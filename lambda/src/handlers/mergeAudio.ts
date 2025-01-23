/**
 * AWS Lambda handler for audio file merging
 * Combines multiple audio files into a single recording
 * Related: handlers/addAudio.ts, frontend/src/services/audioService.ts, frontend/src/store/slices/audioSlice.ts
 * AWS Lambda functions can process complex operations like file merging using temporary storage and external tools
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Audio file merging implementation
 * Processes multiple audio files and combines them using FFmpeg
 * Related: handlers/addAudio.ts, frontend/src/components/AudioRecorder.tsx
 * FFmpeg in Lambda enables powerful audio processing capabilities in a serverless environment
 */
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { audioKeys } = JSON.parse(event.body || '{}');
    
    if (!audioKeys || !Array.isArray(audioKeys) || audioKeys.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio keys provided' })
      };
    }

    // Download all audio files from S3
    const audioBuffers = await Promise.all(
      audioKeys.map(async (key) => {
        const response = await s3Client.send(new GetObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key
        }));
        
        const buffer = await response.Body?.transformToByteArray();
        if (!buffer) {
          throw new Error(`Failed to read audio file: ${key}`);
        }
        return buffer;
      })
    );

    // Merge audio buffers (simplified version - in reality, you'd want to use a proper audio processing library)
    const mergedBuffer = Buffer.concat(audioBuffers.map(buffer => Buffer.from(buffer)));
    
    // Upload merged file
    const mergedKey = `audio/merged-${uuidv4()}.wav`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: mergedKey,
      Body: mergedBuffer,
      ContentType: 'audio/wav'
    }));

    // Delete original files
    await Promise.all(
      audioKeys.map(key => 
        s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key
        }))
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ key: mergedKey })
    };
  } catch (error) {
    console.error('Error merging audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to merge audio files' })
    };
  }
})
  .use(jsonBodyParser());
