/**
 * Express router for handling all audio-related HTTP endpoints
 * Central routing module managing all audio file operations and processing
 * Related: services/audioService.ts, services/storageService.ts, frontend/src/components/AudioRecorder.tsx
 * Express routers provide a way to modularize route handling and create a mini-application capable of performing middleware and routing functions
 */
import express from 'express';
import multer from 'multer';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';
import * as pathUtils from '../../../config/paths';
import fs from 'fs';
import path from 'path';

// Initialize Express Router for handling audio-related routes
const router = express.Router();

/**
 * Directory configuration and initialization
 * Ensures required storage directories exist before handling requests
 * Used by multer storage configuration and file operations
 * @see {@link https://nodejs.org/api/fs.html} - Node.js File System
 */
const uploadsDir = pathUtils.getUploadsDir();
const recordingsDir = pathUtils.getRecordingsDir();

console.log('Audio Routes Directories:', {
  uploadsDir,
  recordingsDir,
  exists: {
    uploads: fs.existsSync(uploadsDir),
    recordings: fs.existsSync(recordingsDir)
  }
});

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
  console.log('Created recordings directory:', recordingsDir);
}

/**
 * Multer storage configuration for file upload handling
 * Configures file storage locations and naming conventions
 * Related: services/storageService.ts, config/paths.ts
 * Multer is a middleware for handling multipart/form-data, primarily used for uploading files in Express applications
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer destination:', recordingsDir);
    cb(null, recordingsDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename while ensuring uniqueness
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const originalName = file.originalname;
    const ext = file.originalname.split('.').pop();
    const baseName = file.originalname.split('.').slice(0, -1).join('.');
    cb(null, `${baseName}-${uniqueSuffix}.${ext}`);
  }
});

/**
 * Upload configuration and validation
 * Defines file size limits and type validation
 * Used by multer middleware for file upload handling
 * @see {@link https://github.com/expressjs/multer#limits} - Multer Limits
 */
const multerConfig = {
  storage,
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log('Multer fileFilter:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname
    });
    
    if (!file.mimetype.includes('audio/')) {
      cb(new Error('File must be an audio file'));
      return;
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
};

// Create middleware functions for handling single and multiple file uploads
// These wrap multer's upload functionality with error handling
// - uploadSingle: handles single file uploads
// - uploadArray: handles multiple file uploads (up to 5 files)
const uploadSingle = multer(multerConfig).single('audio');
const uploadArray = multer(multerConfig).array('audio', 5);

/**
 * Upload error handling middleware
 * Provides consistent error handling for file upload operations
 * Related: frontend/src/components/AudioRecorder.tsx, services/audioService.ts
 * Error handling middleware in Express catches errors and processes them in a consistent way across the application
 */
const handleUploadError = (err: any, res: express.Response) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      error: 'File upload error',
      details: err.message
    });
  } else if (err) {
    console.error('Unknown upload error:', err);
    return res.status(500).json({
      error: 'Unknown upload error',
      details: err.message
    });
  }
};

/**
 * Single file upload middleware
 * Processes individual audio file uploads with error handling
 * Related: services/audioService.ts, frontend/src/store/slices/audioSlice.ts
 * Middleware functions in Express have access to the request and response objects, and can modify them or end the request-response cycle
 */
const singleUploadMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  uploadSingle(req, res, function (err) {
    if (err) {
      return handleUploadError(err, res);
    }
    next();
  });
};

/**
 * Array file upload middleware
 * Handles multiple file uploads for batch processing
 * Related: services/audioService.ts, frontend/src/store/slices/audioSlice.ts
 * Array file upload middleware allows processing multiple files in a single request, useful for batch operations
 */
const arrayUploadMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  uploadArray(req, res, function (err) {
    if (err) {
      return handleUploadError(err, res);
    }
    next();
  });
};

/**
 * Single file upload route handler
 * Processes and stores individual audio file uploads
 * Related: services/audioService.ts, frontend/src/components/AudioRecorder.tsx
 * Route handlers in Express process incoming HTTP requests and send appropriate responses based on the request data
 */
router.post('/add', singleUploadMiddleware, async (req, res) => {
  try {
    console.log('Received audio chunk upload request');
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No audio chunk provided' });
    }

    console.log('Processing audio chunk:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      destination: req.file.destination,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Verify file was saved
    const filePath = path.join(recordingsDir, req.file.filename);
    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
      throw new Error('Audio chunk was not saved properly');
    }

    // Process the audio chunk
    const key = await audioService.processAudioChunk(req.file);
    console.log('Audio chunk processed and saved with key:', key);

    // Return the key for frontend reference
    res.json({ 
      key,
      message: 'Audio chunk processed successfully'
    });
  } catch (error: unknown) {
    console.error('Error handling audio chunk:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Failed to process audio chunk',
      details: errorMessage 
    });
  }
});

/**
 * Audio merge route handler
 * Combines multiple audio files into a single recording
 * Related: services/audioService.ts, frontend/src/store/slices/audioSlice.ts
 * Audio processing routes handle complex operations like merging multiple audio files while maintaining proper error handling
 */
router.post('/merge', arrayUploadMiddleware, async (req, res) => {
  try {
    console.log('Received merge request');
    
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.error('No files in merge request');
      return res.status(400).json({ error: 'No audio files provided' });
    }

    console.log('Received files for merging:', req.files.length);

    const mergedFileKey = await audioService.processAudio(req.files);
    console.log('Files merged successfully with key:', mergedFileKey);
    res.json({ key: mergedFileKey });
  } catch (error: unknown) {
    console.error('Error merging audio:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Failed to merge audio files',
      details: errorMessage 
    });
  }
});

/**
 * Delete audio file route handler
 * Removes audio file from storage
 * Connected to frontend AudioRecorder.tsx delete functionality
 * @see {@link https://expressjs.com/en/4x/api.html#router.delete.method} - Express Router
 */
router.delete('/remove/:key', async (req, res) => {
  try {
    const { key } = req.params;
    console.log('Received delete request for key:', key);
    
    await storageService.deleteFromS3(key);
    console.log('File deleted successfully');
    res.json({ message: 'Audio file deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting audio:', error);
    const errorMessage = isError(error) ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      error: 'Failed to delete audio file',
      details: errorMessage 
    });
  }
});

// Type guard for error handling
// Helps TypeScript determine if an unknown error is an Error object
// Used throughout the routes for consistent error handling
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export default router;
