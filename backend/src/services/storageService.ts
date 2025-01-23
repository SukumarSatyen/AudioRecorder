/**
 * Storage service managing file operations and persistence
 * Provides unified interface for file storage operations across the application
 * Related: services/audioService.ts, routes/audioRoutes.ts, config/aws.ts
 * File storage services abstract the complexity of file operations and provide consistent access patterns
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for storage directory structure
 * Defines paths for uploads and recordings storage
 * Used across all storage operations in this service
 */
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const RECORDINGS_DIR = path.join(UPLOADS_DIR, 'recordings');

/**
 * Directory initialization block
 * Ensures required storage directories exist before any operations
 * Critical for preventing file system errors during storage operations
 */
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log('Created uploads directory:', UPLOADS_DIR);
}
if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
  console.log('Created recordings directory:', RECORDINGS_DIR);
}

export const storageService = {
  /**
   * S3-like storage implementation for audio files
   * Handles file uploads with proper naming and organization
   * Related: services/audioService.ts, frontend/src/utils/fileStorage.ts
   * File upload handlers ensure secure and organized storage of user-generated content
   */
  async uploadToS3(file: Express.Multer.File): Promise<string> {
    try {
      // Use timestamp as filename to match the frontend
      const timestamp = Date.now();
      const filename = `${timestamp}.webm`;
      const filePath = path.join(RECORDINGS_DIR, filename);
      
      console.log('Saving file:', {
        filename,
        filePath,
        fileSize: file.buffer.length
      });
      
      // Write the file to the recordings directory
      fs.writeFileSync(filePath, file.buffer);
      
      // Verify file was written
      if (fs.existsSync(filePath)) {
        console.log('File saved successfully:', filePath);
      } else {
        console.error('File was not saved:', filePath);
      }
      
      // Return the relative path that will be used in the URL
      return `recordings/${filename}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  /**
   * File deletion functionality
   * Manages cleanup of processed or unnecessary files
   * Related: routes/audioRoutes.ts, services/audioService.ts
   * Proper file cleanup prevents storage bloat and maintains system performance
   */
  async deleteFromS3(key: string): Promise<void> {
    try {
      const filePath = path.join(UPLOADS_DIR, key);
      console.log('Attempting to delete file:', filePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('File deleted successfully:', filePath);
      } else {
        console.log('File not found for deletion:', filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  /**
   * File retrieval implementation
   * Provides access to stored files for processing or serving
   * Related: routes/audioRoutes.ts, frontend/src/components/AudioRecorder.tsx
   * File retrieval systems ensure efficient access to stored content while maintaining security
   */
  async downloadFromS3(key: string): Promise<string> {
    const filePath = path.join(UPLOADS_DIR, key);
    console.log('Attempting to download file:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      throw new Error('File not found');
    }
    return filePath;
  },

  /**
   * Temporary file cleanup utility
   * Maintains system cleanliness by removing temporary files
   * Related: services/audioService.ts, routes/audioRoutes.ts
   * Regular cleanup of temporary files prevents storage exhaustion and improves system reliability
   */
  cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Temp file cleaned up:', filePath);
      }
    } catch (error) {
      console.error('Error cleaning up temp file:', error);
    }
  }
};
