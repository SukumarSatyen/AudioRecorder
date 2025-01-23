# Backend Service

This is the backend service for the Voice Recorder application, handling audio file processing and storage.

## Recording Flow and Storage

### Recording Process Flow

1. **Start Recording (Browser Side)**:
   - Browser uses MediaRecorder API to record audio
   - Recorded chunks are stored in browser's memory (RAM)
   - No direct file system storage at this stage
   - Data exists as Blob objects in browser memory
   - Browser's security sandbox prevents direct file system access

2. **Send Chunks Process**:
   - Frontend creates FormData with recorded chunks
   - Sends via HTTP POST to `http://localhost:3001/audio/add`
   - The URL shown (e.g., `http://localhost:3001/uploads/recordings/1737553528695.webm`) is the access URL, not the storage path

3. **Backend Storage Flow**:
   ```
   Browser Memory → HTTP Upload → Backend Server → Local System Storage
   (Blob data)      (FormData)    (multer)        (recordingsDir)
   ```

### Storage Locations

1. **Before Sending**:
   - Location: Browser memory (temporary)
   - Format: Blob objects
   - Access: Limited to browser context

2. **After Sending**:
   - Location: Backend server's local storage
   - Format: WebM audio file
   - Storage: Permanent until explicitly deleted
   - Physical Path Example: `C:\Users\[Username]\...\recordings\[filename].webm`

### Important Notes

1. **Browser Security**:
   - Browsers cannot directly access local file system paths
   - All browser operations happen in a sandboxed environment
   - This is a security feature of web browsers

2. **Path Types**:
   - **Access URL**: `http://localhost:3001/uploads/recordings/[filename].webm`
     - How browser accesses the file through web server
     - What frontend sees and can use
   - **Physical Path**: `C:\Users\...\recordings\[filename].webm`
     - Actual file location on system
     - Only accessible to backend

3. **Storage Management**:
   - Files are stored on the backend server
   - Each recording gets a unique timestamp-based filename
   - Backend handles all file system operations
   - Frontend only works with HTTP URLs

## Storage Implementation Methods

### Direct Backend Storage Method

This is the current implementation that stores browser's recorded chunks to the physical system:

1. **Frontend Implementation**:
```typescript
// Convert recorded chunks to FormData
const formData = new FormData();
const blob = new Blob(recordedChunks, { type: 'audio/webm' });
formData.append('audio', blob, `recording-${Date.now()}.webm`);

// Send to backend endpoint
await fetch('http://localhost:3001/audio/add', {
    method: 'POST',
    body: formData
});
```

2. **Backend Processing**:
   - Receives FormData through HTTP POST
   - Multer middleware processes the file upload
   - Stores file in configured recordings directory
   - Returns access URL to frontend

3. **Advantages**:
   - Works in all web browsers
   - Controlled storage location
   - Enables server-side processing
   - No special permissions needed
   - Cross-platform compatibility

4. **Storage Flow**:
   ```
   Browser Memory → FormData → Backend → Physical System
   (RAM)           (HTTP)     (Multer)  (File System)
   ```

5. **File Access**:
   - Frontend: Uses HTTP URL (`http://localhost:3001/uploads/recordings/[filename].webm`)
   - Backend: Direct file system path (`C:\Users\[Username]\...\recordings\[filename].webm`)

This method provides a secure and controlled way to move audio data from browser memory to the physical system while maintaining web security standards.

### Modern File System Storage Methods

The application now implements a three-tier approach for storing audio recordings:

1. **File System Access API (Primary Method)**:
   - Uses modern browser's File System Access API
   - Allows direct saving to user's chosen location
   - Provides native file picker dialog
   - Most user-friendly approach
   - Example:
   ```typescript
   const handle = await window.showSaveFilePicker({
     suggestedName: filename,
     types: [{ description: 'Audio File', accept: { 'audio/webm': ['.webm'] } }]
   });
   ```

2. **Electron File System API (Secondary Method)**:
   - Available when running as desktop application
   - Uses Node.js fs module through Electron
   - Provides native OS integration
   - Example:
   ```typescript
   const { dialog } = require('electron').remote;
   const fs = require('fs').promises;
   const result = await dialog.showSaveDialog({
     title: 'Save Recording',
     defaultPath: filename
   });
   ```

3. **Server Upload (Fallback Method)**:
   - Default fallback when local methods fail
   - Uses existing FormData upload process
   - Ensures cross-platform compatibility
   - Maintains backward compatibility

### Storage Strategy

The application attempts each storage method in sequence:
1. Try File System Access API for modern browsers
2. Fall back to Electron's native file system if available
3. Default to server upload if both local methods fail

Each successful local save also attempts a server backup for redundancy.

### Implementation Files

The file storage implementation is primarily handled by:
- `frontend/src/utils/fileStorage.ts`: Core file storage logic
- `frontend/src/components/AudioRecorder.tsx`: UI integration
- `backend/src/routes/audioRoutes.ts`: Server-side storage handling

<!--
The following sections contain duplicate information that is kept for reference:

### Failover Storage Implementation

The application implements a dual storage approach with automatic failover:

1. **Primary: File System Access API**
   - Attempts to save directly to user's system
   - Uses modern browser's File System Access API
   - Provides user control over save location
   - Code example:
   ```typescript
   if ('showSaveFilePicker' in window) {
       const handle = await window.showSaveFilePicker({
           suggestedName: `recording-${Date.now()}.webm`,
           types: [{
               description: 'Audio File',
               accept: { 'audio/webm': ['.webm'] }
           }]
       });
       const writable = await handle.createWritable();
       await writable.write(blob);
       await writable.close();
   }
   ```

2. **Fallback: Server Storage**
   - Activates if File System API fails or is unsupported
   - Uses existing server-side storage implementation
   - Ensures reliable storage even if local save fails

3. **Dual Storage Benefits**:
   - Redundant storage for important recordings
   - Local access without server dependency
   - Server backup for file sharing
   - Cross-browser compatibility

4. **Storage Flow**:
   ```
   Record Audio → Try File System API → Success? → Also try server backup
                                    → Fail? → Fall back to server only
   ```

5. **Error Handling**:
   - Graceful degradation between methods
   - Clear user feedback for each scenario
   - Detailed error logging for debugging

The failover approach ensures maximum reliability while providing the best possible user experience based on browser capabilities.
-->
## Code Flow

1. Frontend UI & Recording Initiation
- File: frontend/src/components/AudioRecorder.tsx (Lines 1-50)
- Operation: User interface and recording initialization
- Purpose: Provides UI controls for audio recording and manages recording state

2. Audio Recording & Chunk Processing
- File: frontend/src/components/AudioRecorder.tsx (Lines 51-100)
- Operation: Handles audio recording in chunks
- Purpose: Records audio in manageable chunks for better performance and reliability

3. Frontend File Storage
- File: frontend/src/utils/fileStorage.ts (Lines 1-63)
- Operation: Local file system operations
- Purpose: Manages temporary storage and preparation of audio files before upload

4. Frontend Upload Processing
- File: frontend/src/utils/fileStorage.ts (Lines 64-290)
- Operation: File upload preparation and execution
- Purpose: Prepares audio files and handles upload to backend server

5. Backend Route Handling
- File: backend/src/routes/audioRoutes.ts (Lines 1-50)
- Operation: HTTP endpoint routing
- Purpose: Manages incoming HTTP requests for audio processing

6. Backend File Upload Processing
- File: backend/src/routes/audioRoutes.ts (Lines 51-100)
- Operation: Multer middleware configuration
- Purpose: Handles file upload validation and storage

7. Backend Audio Service Processing
- File: backend/src/services/audioService.ts (Lines 1-50)
- Operation: Audio chunk processing
- Purpose: Processes individual audio chunks and manages temporary storage

8. Backend Audio Merging
- File: backend/src/services/audioService.ts (Lines 51-90)
- Operation: Audio file merging
- Purpose: Combines multiple audio chunks into final recording

9. Backend S3 Storage
- File: backend/src/services/audioService.ts (Lines 91-138)
- Operation: Cloud storage integration
- Purpose: Stores processed audio files in S3 cloud storage

The complete flow works as follows:

1. User initiates recording through the AudioRecorder component
2. Frontend captures audio in chunks using MediaRecorder API
3. Chunks are temporarily stored using fileStorage utilities
4. Files are prepared and uploaded to backend via HTTP
5. Backend routes receive the files through multer middleware
6. Audio service processes chunks and merges if needed
7. Final audio is stored in S3 and cleanup is performed
8. Response is sent back to frontend with storage details
9. Frontend updates UI to reflect successful upload

This architecture ensures efficient handling of audio recordings with proper separation of concerns between frontend and backend components.

## Common Error Scenarios

1. **File Upload Errors**:
   - No file in request
   - AWS credentials missing
   - S3 upload failures

2. **Audio Processing Errors**:
   - Invalid file format
   - Merge operation failures
   - File size limits

3. **Storage Service Errors**:
   - Bucket access denied
   - File not found
   - Delete operation failures

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/
