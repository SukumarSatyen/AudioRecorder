/**
 * Audio processing service handling chunk management and file operations
 * Core service managing all audio-related operations and file processing
 * Related: routes/audioRoutes.ts, services/storageService.ts, frontend/src/store/slices/audioSlice.ts
 * Services in Node.js are reusable business logic modules that handle specific functionality domains
 * Syntax: 
 *   - FFmpeg concat filter: `ffmpeg -i "concat:input1.wav|input2.wav" -acodec copy output.wav`
 *   - Child process spawn: `spawn(command, [...args], { stdio: ['pipe', 'pipe', 'pipe'] })`
 */

import { spawn } from 'child_process';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { storageService } from './storageService';

/**
 * Temporary directory configuration for audio file processing
 * Essential for storing intermediate files during processing
 * Used across all audio processing functions in this service
 */
const TEMP_DIR = path.join(__dirname, '../../temp');

export const audioService = {
  /**
   * Audio chunk processing implementation
   * Handles individual audio chunk uploads and cleanup
   * Related: services/storageService.ts, frontend/src/components/AudioRecorder.tsx
   * Chunk-based processing allows efficient handling of large audio files
   * Syntax: 
   *   - Blob to Buffer: `await blob.arrayBuffer().then(buf => Buffer.from(buf))`
   *   - Stream piping: `readStream.pipe(writeStream)`
   */
  async processAudioChunk(file: Express.Multer.File): Promise<string> {
    try {
      // Upload the chunk to storage and get the key
      const key = await storageService.uploadToS3(file);
      
      // Clean up the temporary file after upload
      try {
        fs.unlinkSync(file.path);
        console.log('Cleaned up temporary chunk file:', file.path);
      } catch (error) {
        console.warn('Failed to clean up temporary chunk file:', error);
      }

      return key;
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      throw error;
    }
  },

  /**
   * Audio file merging functionality
   * Combines multiple audio chunks into a single recording
   * Related: routes/audioRoutes.ts, frontend/src/store/slices/audioSlice.ts
   * FFmpeg operations enable powerful audio processing capabilities
   * Syntax:
   *   - FFmpeg complex filter: `-filter_complex "[0:a][1:a]concat=n=2:v=0:a=1[out]" -map "[out]"`
   *   - Temp file cleanup: `fs.unlink(path, (err) => { if(err) throw err; })`
   */
  async mergeAudioFiles(filePaths: string[]): Promise<string> {
    const outputPath = path.join(TEMP_DIR, `${uuidv4()}-merged.wav`);
    
    // Use FFmpeg to concatenate audio files
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', `concat:${filePaths.join('|')}`,
        '-acodec', 'copy',
        outputPath
      ]);

      ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr: ${data}`);
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg process exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        reject(err);
      });
    });
  },

  /**
   * Complete audio processing pipeline
   * Orchestrates the entire audio processing workflow from chunks to final file
   * Related: routes/audioRoutes.ts, services/storageService.ts, frontend/src/components/AudioRecorder.tsx
   * Audio processing pipelines ensure proper sequencing of operations for optimal results
   */
  async processAudio(files: Express.Multer.File[]): Promise<string> {
    try {
      // Upload all files to S3 and get their keys
      const uploadPromises = files.map(file => storageService.uploadToS3(file));
      const s3Keys = await Promise.all(uploadPromises);

      // Download files from S3 to temp directory
      const downloadPromises = s3Keys.map(key => storageService.downloadFromS3(key));
      const localPaths = await Promise.all(downloadPromises);

      // Merge audio files
      const mergedFilePath = await this.mergeAudioFiles(localPaths);

      // Upload merged file to S3
      const mergedFileBuffer = fs.readFileSync(mergedFilePath);
      const mergedFile: Express.Multer.File = {
        buffer: mergedFileBuffer,
        originalname: path.basename(mergedFilePath),
        mimetype: 'audio/wav',
        fieldname: 'audio',
        encoding: '7bit',
        size: mergedFileBuffer.length,
        stream: fs.createReadStream(mergedFilePath),
        destination: '',
        filename: '',
        path: mergedFilePath
      };

      const mergedFileKey = await storageService.uploadToS3(mergedFile);

      // Cleanup temporary files
      localPaths.forEach(filePath => storageService.cleanupTempFile(filePath));
      storageService.cleanupTempFile(mergedFilePath);

      // Delete original files from S3
      await Promise.all(s3Keys.map(key => storageService.deleteFromS3(key)));

      return mergedFileKey;
    } catch (error) {
      throw error;
    }
  }
};
