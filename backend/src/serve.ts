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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const audioDirectory = path.join(__dirname, 'audios');

const app = express();

// Middleware
app.use(formidable());
app.use(cors());

// Ensure audio directory exists
async function ensureAudioDirectory() {
    try {
        await fs.access(audioDirectory);
        console.log('Audios directory exists at:', audioDirectory);
    } catch (error) {
        console.log('Creating audios directory at:', audioDirectory);
        await fs.mkdir(audioDirectory, { recursive: true });
    }
}

// Initialize audio directory
ensureAudioDirectory().catch(console.error);

// Route handler with proper Express types
app.post("/sendVoiceNote", async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.fields) {
            throw new Error('No form data received');
        }

        const base64Field = req.fields.base64;
        if (!base64Field || Array.isArray(base64Field)) {
            throw new Error('Invalid base64 data');
        }
        
        const buffer = Buffer.from(base64Field, "base64");
        const voiceNote = path.join(audioDirectory, `${Date.now()}.webm`);

        // file extension issue
        /*

        // Detect file type from buffer
        const fileType = await fileTypeFromBuffer(buffer);
        if (!fileType || !fileType.ext.match(/^(webm|mp3|wav|ogg|m4a)$/)) {
            throw new Error('Invalid audio file type');
        }

        const voiceNote = path.join(audiosDir, `${Date.now()}.${fileType.ext}`);

        */
        
        await fs.writeFile(voiceNote, buffer);
        res.send(voiceNote);
    } catch (error) {
        next(error);
    }
});

// Create HTTP server
const http = createServer(app);

// Start server
http.listen(3002, () => {
    console.log('Server is running on port 3002');
});
