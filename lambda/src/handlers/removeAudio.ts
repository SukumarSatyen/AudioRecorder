/**
 * AWS Lambda handler for audio file deletion
 * Removes audio files from S3 storage
 * Related: handlers/addAudio.ts, handlers/mergeAudio.ts, frontend/src/services/audioService.ts
 * AWS Lambda functions can perform cleanup operations to manage storage resources effectively
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import middy from '@middy/core';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Audio file removal implementation
 * Processes deletion requests for audio files in S3
 * Related: frontend/src/store/slices/audioSlice.ts, frontend/src/components/AudioRecorder.tsx
 * S3 deletion operations help maintain storage efficiency by removing unnecessary files
 */
const removeAudioHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const key = event.pathParameters?.key;
    
    if (!key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No key provided' })
      };
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Audio file deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to delete audio' })
    };
  }
};

export const handler = middy(removeAudioHandler);
