/**
 * Express server initialization and configuration for audio recording backend
 * Entry point for all backend operations, handling routing and middleware setup
 * Related: routes/audioRoutes.ts, config/paths.ts, services/audioService.ts, services/storageService.ts
 * Express.js is a fast, unopinionated, minimalist web framework for Node.js that provides robust features for web and mobile applications
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import audioRoutes from './routes/audioRoutes';
import * as pathUtils from '../../config/paths';

dotenv.config({ path: path.join(__dirname, '../../config/.env') });

// Debug logging for environment variables
console.log('Environment Variables:', {
  BACKEND_PORT: process.env.BACKEND_PORT,
  FRONTEND_PORT: process.env.FRONTEND_PORT,
  ENV_FILE_PATH: path.join(__dirname, '../../config/.env')
});

/**
 * Core application configuration and environment setup
 * Establishes server settings and security parameters
 * Related: config/.env, config/paths.ts, frontend/.env
 * Environment variables in Node.js are global objects that define the runtime environment in which an application runs
 */
const app = express();
// Ensure PORT is always a number
const PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);
const FRONTEND_URL = `http://localhost:${process.env.FRONTEND_PORT || '3000'}`;

// Get platform-specific directories
const uploadsDir = pathUtils.getUploadsDir();
const recordingsDir = pathUtils.getRecordingsDir();
const publicDir = path.join(__dirname, '..', 'public');

// Single consolidated directory status log
console.log('Directory structure:', {
  uploadsDir,
  recordingsDir,
  publicDir,
  exists: {
    uploads: fs.existsSync(uploadsDir),
    recordings: fs.existsSync(recordingsDir),
    public: fs.existsSync(publicDir)
  }
});

/**
 * CORS and security middleware configuration
 * Protects against cross-origin attacks while allowing frontend access
 * Related: frontend/src/config/config.ts, frontend/vite.config.ts
 * Cross-Origin Resource Sharing (CORS) is a mechanism that allows restricted resources to be requested from another domain
 */
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
console.log('[index.ts] Setting up middleware and security configurations');
app.use(cors(corsOptions));
app.use(express.json());

// Add security headers including CSP
app.use((req, res, next) => {
  console.log('[index.ts, securityMiddleware] Adding security headers to request');
  res.setHeader(
    'Content-Security-Policy',
    `default-src 'self' http://localhost:${process.env.FRONTEND_PORT} http://localhost:${PORT}; ` +
    `img-src 'self' data: blob: http://localhost:${PORT}; ` +
    `media-src 'self' blob: http://localhost:${PORT}; ` +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline';"
  );
  console.log('[index.ts, securityMiddleware] Security headers added successfully');
  next();
});

// Handle preflight requests
app.options('*', cors(corsOptions));

// Create uploads directory if it doesn't exist
console.log('[index.ts] Checking and creating required directories');
if (!fs.existsSync(uploadsDir)) {
  console.log('[index.ts] Creating uploads directory:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(recordingsDir)) {
  console.log('[index.ts] Creating recordings directory:', recordingsDir);
  fs.mkdirSync(recordingsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  console.log('[index.ts] Creating public directory:', publicDir);
  fs.mkdirSync(publicDir, { recursive: true });
}
console.log('[index.ts] Directory checks and creation completed');

/**
 * Static file serving configuration
 * Enables secure access to uploaded audio files
 * Related: services/storageService.ts, routes/audioRoutes.ts
 * Static file serving in Express provides a way to serve files from a directory, handling file downloads and proper MIME types
 */
const staticOptions = {
  dotfiles: 'ignore',
  etag: true,
  index: false,
  maxAge: '1d',
};

// Function to get content type from file path
function getContentType(filePath: string) {
  console.log('[index.ts, getContentType] Getting content type for:', filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = (() => {
    switch (ext) {
      case '.mp3':
        return 'audio/mpeg';
      case '.wav':
        return 'audio/wav';
      case '.ogg':
        return 'audio/ogg';
      case '.webm':
        return 'audio/webm';
      default:
        return 'application/octet-stream';
    }
  })();
  console.log('[index.ts, getContentType] Determined content type:', contentType);
  return contentType;
}

// Serve static files with proper MIME types
console.log('[index.ts] Setting up static file serving');
app.use(express.static(publicDir, {
  setHeaders: (res, path) => {
    console.log('[index.ts, staticServe.setHeaders] Setting headers for:', path);
    const contentType = getContentType(path);
    if (contentType.startsWith('audio/')) {
      console.log('[index.ts, staticServe.setHeaders] Setting audio-specific headers');
      res.set('Content-Type', contentType);
      res.set('Accept-Ranges', 'bytes');
    }
  }
}));

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    console.log('[index.ts, staticServe.setHeaders] Setting headers for:', path);
    const contentType = getContentType(path);
    if (contentType.startsWith('audio/')) {
      console.log('[index.ts, staticServe.setHeaders] Setting audio-specific headers');
      res.set('Content-Type', contentType);
      res.set('Accept-Ranges', 'bytes');
    }
  }
}));

/**
 * Debug route implementation
 * Provides system diagnostics and file system verification
 * Related: frontend/src/utils/fileStorage.ts, config/paths.ts
 * Debugging routes help identify issues in production by exposing system state and configuration details
 */
app.get('/debug/files', (req, res) => {
  console.log('[index.ts, debugFiles] Starting debug files endpoint');
  try {
    console.log('[index.ts, debugFiles] Checking directories');
    console.log('[index.ts, debugFiles] __dirname:', __dirname);
    console.log('[index.ts, debugFiles] uploadsDir:', uploadsDir);
    console.log('[index.ts, debugFiles] recordingsDir:', recordingsDir);
    
    const uploadsExists = fs.existsSync(uploadsDir);
    const recordingsExists = fs.existsSync(recordingsDir);
    
    let recordings: string[] = [];
    if (recordingsExists) {
      console.log('[index.ts, debugFiles] Reading recordings directory');
      recordings = fs.readdirSync(recordingsDir);
      console.log('[index.ts, debugFiles] Recordings found:', recordings);
    }
    
    const response = {
      directories: {
        __dirname,
        uploadsDir,
        recordingsDir,
        uploadsExists,
        recordingsExists
      },
      recordings: recordings.map(file => ({
        name: file,
        path: path.join(recordingsDir, file),
        exists: fs.existsSync(path.join(recordingsDir, file)),
        size: fs.existsSync(path.join(recordingsDir, file)) ? 
          fs.statSync(path.join(recordingsDir, file)).size : 0
      }))
    };
    
    console.log('[index.ts, debugFiles] Sending debug response');
    res.json(response);
  } catch (error) {
    console.error('[index.ts, debugFiles] Error in debug route:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Serve README.md as HTML at root endpoint
app.get('/', (req, res) => {
  console.log('[index.ts, serveReadme] Starting to serve README.md');
  try {
    const readmePath = path.join(__dirname, '..', 'README.md');
    console.log('[index.ts, serveReadme] Reading README from:', readmePath);
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Backend API Documentation</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
              color: #333;
            }
            pre {
              background-color: #f6f8fa;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
            }
            code {
              font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
              font-size: 0.9em;
              padding: 0.2em 0.4em;
              background-color: #f6f8fa;
              border-radius: 3px;
            }
            h1, h2, h3 {
              border-bottom: 1px solid #eaecef;
              padding-bottom: 0.3em;
            }
            .container {
              background-color: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${marked(readmeContent)}
          </div>
        </body>
      </html>
    `;
    console.log('[index.ts, serveReadme] Serving README as HTML');
    res.send(htmlContent);
  } catch (error) {
    console.error('[index.ts, serveReadme] Error serving README:', error);
    res.status(500).send('Error loading documentation');
  }
});

// Routes
app.use('/api/audio', audioRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[index.ts, errorHandler] Error occurred:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Function to start the server with port conflict handling
async function startServer(retries = 3) {
  console.log('[index.ts, startServer] Starting server with retries:', retries);
  try {
    console.log('[index.ts, startServer] Attempting to start server on port:', PORT);
    app.listen(PORT, () => {
      console.log('[index.ts, startServer] Server started successfully');
      console.log('[index.ts, startServer] Server is running on port:', PORT);
      console.log('[index.ts, startServer] Frontend URL:', FRONTEND_URL);
    });
  } catch (error) {
    console.error('[index.ts, startServer] Error starting server:', error);
    if (error.code === 'EADDRINUSE' && retries > 0) {
      console.log('[index.ts, startServer] Port', PORT, 'is in use, trying port', PORT + 1);
      process.env.BACKEND_PORT = String(PORT + 1);
      await startServer(retries - 1);
    } else {
      console.error('[index.ts, startServer] Failed to start server after all retries');
      process.exit(1);
    }
  }
}

startServer();
