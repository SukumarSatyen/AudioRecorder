/**
 * AWS Lambda handler for audio file upload processing
 * Processes incoming audio files and stores them in S3
 * Related: handlers/mergeAudio.ts, handlers/removeAudio.ts, frontend/src/services/audioService.ts
 * AWS Lambda functions are serverless compute units that run code in response to events
 * Syntax:
 *   - S3 put object: `await s3Client.send(new PutObjectCommand({ Bucket, Key, Body }))`
 *   - Middy middleware: `middy(handler).use(jsonBodyParser())`
 *   - Base64 decode: `Buffer.from(audioData, 'base64')`
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

/**
 * Main handler implementation
 * Processes audio file uploads and manages S3 storage
 * Related: frontend/src/store/slices/audioSlice.ts, frontend/src/components/AudioRecorder.tsx
 * Lambda handlers process events and return responses
 * Syntax:
 *   - CORS headers: `'Access-Control-Allow-Origin': '*'`
 *   - Error response: `{ statusCode: 400, body: JSON.stringify({ error }) }`
 */
const addAudioHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { audioData, contentType } = JSON.parse(event.body || '{}');
    if (!audioData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No audio data provided' })
      };
    }

    const buffer = Buffer.from(audioData, 'base64');
    const key = `audio/${uuidv4()}.wav`;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'audio/wav'
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ key })
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to upload audio' })
    };
  }
};

export const handler = middy(addAudioHandler)
  .use(jsonBodyParser());
