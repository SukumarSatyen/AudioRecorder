/**
 * AWS S3 client configuration and initialization
 * Provides cloud storage capabilities for the application
 * Related: services/storageService.ts, config/.env, frontend/src/utils/fileStorage.ts
 * The AWS SDK for JavaScript enables developers to build and deploy applications that use AWS services
 */

import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../config/.env') });

/**
 * S3 client instance configuration
 * Initializes authenticated connection to AWS S3
 * Related: config/.env, services/storageService.ts
 * The S3Client class is the entry point for all S3 operations, providing methods to interact with S3 buckets and objects
 */
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});
