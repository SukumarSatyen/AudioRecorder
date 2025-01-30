const express = require('express');
const formidable = require('express-formidable');
const cors = require('cors');
const fs = require('fs/promises');
const { createServer } = require('http');
const { Fields } = require('formidable');
const path = require('path');
const { fileURLToPath } = require('url');

// Type augmentation for express-formidable
declare global {
    namespace Express {
        interface Request {
            fields?: Fields;
        }
    }
}

// Get current directory
console.log('[serve.ts] Initializing application paths');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDirectory = path.join(__dirname, 'audios');
console.log('[serve.ts] Audio directory path set to:', audioDirectory);

const app = express();

// Middleware
console.log('[serve.ts] Setting up middleware');
app.use(formidable());
app.use(cors());
console.log('[serve.ts] Middleware setup completed');

// Ensure audio directory exists
async function ensureAudioDirectory() {
    console.log('[serve.ts, ensureAudioDirectory] Starting directory check');
    try {
        await fs.access(audioDirectory);
        console.log('[serve.ts, ensureAudioDirectory] Audios directory exists at:', audioDirectory);
    } catch (error) {
        console.log('[serve.ts, ensureAudioDirectory] Directory not found, creating at:', audioDirectory);
        await fs.mkdir(audioDirectory, { recursive: true });
        console.log('[serve.ts, ensureAudioDirectory] Directory created successfully');
    }
    console.log('[serve.ts, ensureAudioDirectory] Directory check/creation completed');
}

// Initialize audio directory
console.log('[serve.ts] Initializing audio directory');
ensureAudioDirectory().catch(error => {
    console.error('[serve.ts, ensureAudioDirectory] Failed to initialize directory:', error);
});

// Route handler with proper Express types
app.post("/sendVoiceNote", async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('[serve.ts, sendVoiceNote] Starting voice note processing');
    try {
        if (!req.fields) {
            console.error('[serve.ts, sendVoiceNote] No form data received');
            throw new Error('No form data received');
        }

        console.log('[serve.ts, sendVoiceNote] Checking base64 field');
        const base64Field = req.fields.base64;
        if (!base64Field || Array.isArray(base64Field)) {
            console.error('[serve.ts, sendVoiceNote] Invalid base64 data received');
            throw new Error('Invalid base64 data');
        }
        
        console.log('[serve.ts, sendVoiceNote] Converting base64 to buffer');
        const buffer = Buffer.from(base64Field, "base64");
        const voiceNote = path.join(audioDirectory, `${Date.now()}.webm`);
        console.log('[serve.ts, sendVoiceNote] Generated voice note path:', voiceNote);

        // file extension issue
        /*

        // Detect file type from buffer
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType || !fileType.ext.match(/^(webm|mp3|wav|ogg|m4a)$/)) {
            throw new Error('Invalid audio file type');
        }

        const voiceNote = path.join(audiosDir, `${Date.now()}.${fileType.ext}`);

        */
        
        console.log('[serve.ts, sendVoiceNote] Writing voice note to file');
        await fs.writeFile(voiceNote, buffer);
        console.log('[serve.ts, sendVoiceNote] Voice note saved successfully');
        
        res.send(voiceNote);
        console.log('[serve.ts, sendVoiceNote] Response sent to client');
    } catch (error) {
        console.error('[serve.ts, sendVoiceNote] Error processing voice note:', error);
        next(error);
    }
});

// Create HTTP server
console.log('[serve.ts] Creating HTTP server');
const http = createServer(app);

// Start server
http.listen(3002, () => {
    console.log('[serve.ts, serverStart] Server started successfully');
    console.log('[serve.ts, serverStart] Server is running on port 3002');
});
