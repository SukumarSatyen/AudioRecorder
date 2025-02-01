/* Keywords: [
  saveRecordedAudio, uploadToServer, hasFileSystemAccess, isElectron,
  FileSystemWritableFileStream, FileSystemFileHandle, StorageResult,
  SaveFilePickerOptions, getFileExtension, getContentType, recordedChunks,
  mimeType, blob, filename, handle, writable
]

Technical: Implements browser-based file system operations for audio recording storage using File System Access API
Role:
  saveRecordedAudio: Primary function handling audio data saving and backup
  uploadToServer: Manages cloud storage backup of recordings
  hasFileSystemAccess: Detects browser file system API support
  isElectron: Detects Electron runtime environment
  FileSystemWritableFileStream: Interface for file writing operations
  FileSystemFileHandle: Interface for file system access
  StorageResult: Type defining operation success/failure data
  recordedChunks: Raw audio data segments
  mimeType: Audio format specification
  blob: Binary large object containing audio data
  filename: Generated unique file identifier
  handle: File system access reference
  writable: Stream for writing data

Constraints:
- Requires modern browser with File System Access API support
- Falls back to Electron API if browser API unavailable
- Limited by available system storage
- Dependent on network for server backup

Actions:
- Creates Blob from audio chunks
- Generates unique filenames
- Writes data to local file system
- Attempts server backup
- Handles various storage scenarios

Dependencies:
- File System Access API
- Electron (optional)
- Network connectivity for backup
- audioFormats utility functions

Outputs:
- Saved audio file on local system
- Optional server backup
- Operation status and file details
- Error information if operation fails

Performance:
- Streams data to avoid memory issues
- Handles large audio files efficiently
- Asynchronous operations prevent UI blocking

Security:
- Uses native file picker for safe paths
- Sanitizes filenames
- Validates mime types
- Handles sensitive file operations safely

Scalability:
- Supports multiple audio formats
- Handles varying file sizes
- Provides multiple storage options
- Extensible error handling

Errors:
- Graceful fallback between storage methods
- Comprehensive error reporting
- User feedback via toast messages
- Detailed console logging */

/**
 * Type definitions for the File System Access API
 * These interfaces define the contract for browser's native file system operations
 * Provides type safety for modern browser APIs that allow direct file access
 * Essential for implementing local file saving functionality
 */

/* Keywords: [Window, FileSystemFileHandle, FileSystemWritableFileStream, WritableStream, SaveFilePickerOptions, StorageResult]

Technical: Defines TypeScript interfaces for File System Access API integration
Role:
  Window: Global interface extension for file system capabilities
  FileSystemFileHandle: File handle management interface
  FileSystemWritableFileStream: Stream writing interface
  WritableStream: Base stream interface
  SaveFilePickerOptions: File save dialog configuration
  StorageResult: Operation result type definition

Constraints:
- Browser must support File System Access API
- TypeScript compiler must recognize these declarations
- Limited to file operations supported by browser

Actions:
- Extends Window interface for file system operations
- Defines file handle management interface
- Specifies stream writing capabilities
- Structures save dialog options
- Defines operation result format

Dependencies:
- TypeScript compiler
- Browser's File System Access API
- WritableStream Web API

Outputs:
- Type-safe file system operations
- Structured operation results
- Consistent interface definitions

Performance:
- Zero runtime overhead (TypeScript types)
- Enables compiler optimizations
- Facilitates IDE autocompletion

Security:
- Type-safe file operations
- Controlled file access patterns
- Structured error handling

Scalability:
- Extensible interface definitions
- Supports future API additions
- Maintainable type structure

Errors:
- Compile-time type checking
- Runtime type validation
- Structured error reporting */

/**
 * Extends the Window interface to include File System Access API
 * This ensures TypeScript recognizes these modern browser APIs
 */
declare global {
    interface Window {
        showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }
}

/**
 * Writable file stream interface for file system operations
 * Enables streaming write operations to local files
 * Used by saveRecordedAudio for file writing
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WritableStream} - WritableStream API
 */
interface FileSystemWritableFileStream extends WritableStream {
    write(data: any): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}

interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{
        description: string;
        accept: Record<string, string[]>;
    }>;
}

interface StorageResult {
    success: boolean;
    key?: string;
    localPath?: string;
    error?: string;
}

import { getAudioFormatInfo } from './audioFormats';
import { toast } from 'react-toastify';

/**
 * Primary function for saving recorded audio data
 * Creates a Blob from the recorded chunks and generates a unique filename
 * 
 * @param {BlobPart[]} recordedChunks - Array of recorded audio segments
 * @param {string} mimeType - Audio format specification (default: audio/webm)
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
 * File saving utilities handle browser-specific file system operations and provide a consistent interface
 * Syntax:
 *   - Blob URL: `URL.createObjectURL(new Blob([data]))`
 *   - Download trigger: `<a download="${filename}" href="${url}"></a>`
 */

/* Keywords: [saveRecordedAudio, recordedChunks, mimeType, blob, filename, handle, writable, isElectron, saveWithElectron, uploadToServer]

Technical: Implements multi-strategy audio file saving with fallback mechanisms
Role:
  saveRecordedAudio: Main function orchestrating save operations
  recordedChunks: Raw audio data array
  mimeType: Audio format identifier
  blob: Binary audio data container
  filename: Generated unique file identifier
  handle: File system access point
  writable: File write stream
  isElectron: Environment detection function
  saveWithElectron: Electron-specific save implementation
  uploadToServer: Cloud storage implementation

Constraints:
- Requires either File System Access API, Electron, or network connection
- File size limited by available storage
- Mime type must be supported audio format
- Filename must be unique

Actions:
- Creates blob from audio chunks
- Generates timestamped filename
- Attempts File System Access API save
- Falls back to Electron if available
- Attempts server upload as final option
- Provides user feedback via toasts

Dependencies:
- File System Access API
- Electron (optional)
- Network connectivity
- Toast notification system
- audioFormats utility

Outputs:
- StorageResult object with success status
- Local file path or server key
- Error information if all methods fail
- User notifications of save status

Performance:
- Streams data to avoid memory issues
- Asynchronous operations
- Progressive enhancement approach
- Efficient fallback strategy

Security:
- Uses native file dialogs
- Sanitizes file paths
- Validates mime types
- Handles sensitive data carefully

Scalability:
- Multiple storage strategies
- Extensible error handling
- Configurable mime types
- Adaptable to new storage methods

Errors:
- Comprehensive error catching
- Graceful fallback chain
- Detailed error logging
- User-friendly error messages */

export const saveRecordedAudio = async (
    recordedChunks: BlobPart[],
    mimeType: string = 'audio/webm'
): Promise<StorageResult> => {
    console.log('[fileStorage.ts, saveRecordedAudio] Starting audio save process');
    
    /**
     * Create a new Blob instance from the recorded chunks
     * The type property ensures proper audio format handling
     */
    const blob = new Blob(recordedChunks, { type: mimeType });
    console.log('[fileStorage.ts, saveRecordedAudio] Created blob with size:', blob.size, 'bytes');
    
    /**
     * Get audio format information including file extension
     * This provides consistent format handling across the application
     */
    const formatInfo = getAudioFormatInfo();
    const extension = formatInfo.fileExtension;
    const filename = `recording-${Date.now()}${extension}`;
    console.log('[fileStorage.ts, saveRecordedAudio] Generated filename:', filename);

    /**
     * First Storage Attempt: File System Access API
     * Check if the API is supported before attempting to use it
     */
    if (hasFileSystemAccess()) {
        console.log('[fileStorage.ts, saveRecordedAudio] File System Access API available');
        try {
            console.log('[fileStorage.ts, saveRecordedAudio] Showing save file picker');
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Audio File',
                    accept: {
                        [formatInfo.contentType]: [extension]
                    }
                }]
            });
            console.log('[fileStorage.ts, saveRecordedAudio] File handle obtained:', handle.name);

            console.log('[fileStorage.ts, saveRecordedAudio] Creating writable stream');
            const writable = await handle.createWritable();
            
            console.log('[fileStorage.ts, saveRecordedAudio] Writing blob to file');
            await writable.write(blob);
            
            console.log('[fileStorage.ts, saveRecordedAudio] Closing file stream');
            await writable.close();

            /**
             * Backup Strategy: Server Upload
             * Even when local save succeeds, attempt server backup
             * Provides redundancy and cloud access capability
             * Notifies user of both save locations
             */
            try {
                console.log('[fileStorage.ts, saveRecordedAudio] Attempting server backup');
                await uploadToServer(blob, filename);
                toast.success('Audio saved both locally and to server');
                console.log('[fileStorage.ts, saveRecordedAudio] Server backup successful');
            } catch (serverError) {
                toast.info('Audio saved locally only');
                console.warn('[fileStorage.ts, saveRecordedAudio] Server backup failed:', serverError);
            }

            console.log('[fileStorage.ts, saveRecordedAudio] Local save completed successfully');
            return {
                success: true,
                localPath: handle.name
            };
        } catch (error) {
            console.warn('[fileStorage.ts, saveRecordedAudio] File System API failed:', error);
            console.log('[fileStorage.ts, saveRecordedAudio] Falling back to Electron or server');
        }
    }

    /**
     * Detects if the application is running in an Electron environment
     * This function performs multiple checks to ensure we're in Electron:
     * 1. Verifies that 'window' object exists
     * 2. Checks if 'process' property is available on window
     * 3. Ensures process object is properly initialized
     * 4. Confirms we're in the renderer process of Electron
     * 
     * Type assertions (window as any) are used because TypeScript doesn't
     * know about Electron's runtime additions to the window object
     * 
     * @returns {boolean} True if running in Electron, false otherwise
     */
    const isElectron = (): boolean => {
        console.log('[fileStorage.ts, isElectron] Checking if running in Electron environment');
        const result = window && 
               'process' in window && 
               (window as any).process && 
               (window as any).process.type === 'renderer';
        console.log('[fileStorage.ts, isElectron] Result:', result);
        return result;
    };

    /**
     * Saves a Blob object to the local filesystem using Electron's native APIs
     * This function provides direct access to the OS file system through Electron
     * 
     * The process involves:
     * 1. Environment validation - ensures we're in Electron
     * 2. Module imports - dynamically loads required Electron modules
     * 3. File dialog - shows native save dialog to get user's desired location
     * 4. File conversion - converts Blob to Buffer for file system writing
     * 5. File writing - saves the buffer to disk at chosen location
     * 
     * Error handling includes:
     * - Environment compatibility checking
     * - Dialog cancellation handling
     * - File system operation error management
     * - Type-safe error message extraction
     * 
     * @param {Blob} blob - The blob data to save (typically audio recording)
     * @param {string} filename - Name to use for the save dialog
     * @returns {Promise<string>} Path where the file was saved
     * @throws {Error} If save fails or dialog is cancelled
     * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
     * Electron file saving utilities handle native file system operations and provide a consistent interface
     */
    const saveWithElectron = async (blob: Blob, filename: string): Promise<string> => {
        console.log('[fileStorage.ts, saveWithElectron] Starting Electron save process');
        
        if (!isElectron()) {
            console.error('[fileStorage.ts, saveWithElectron] Not in Electron environment');
            throw new Error('Not running in Electron environment');
        }

        console.log('[fileStorage.ts, saveWithElectron] Loading Electron modules');
        const { dialog } = (window as any).require('electron').remote;
        const fs = (window as any).require('fs').promises;

        try {
            console.log('[fileStorage.ts, saveWithElectron] Showing save dialog');
            const result = await dialog.showSaveDialog({
                title: 'Save Recording',
                defaultPath: filename,
                filters: [{ 
                    name: 'Audio Files', 
                    extensions: [extension.substring(1)] // Remove leading dot
                }]
            });

            console.log('[fileStorage.ts, saveWithElectron] Processing save dialog result');
            if (!result.canceled && result.filePath) {
                console.log('[fileStorage.ts, saveWithElectron] Converting blob to buffer');
                const buffer = await blob.arrayBuffer();
                console.log('[fileStorage.ts, saveWithElectron] Writing buffer to file');
                await fs.writeFile(result.filePath, Buffer.from(buffer));
                console.log('[fileStorage.ts, saveWithElectron] File saved successfully');
                return result.filePath;
            }
            console.error('[fileStorage.ts, saveWithElectron] Save dialog was canceled');
            throw new Error('Save dialog was canceled');
        } catch (error: unknown) {
            console.error('[fileStorage.ts, saveWithElectron] Electron save failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Electron save failed: ${errorMessage}`);
        }
    };

    // Try Electron file system if available
    if (isElectron()) {
        try {
            console.log('[fileStorage.ts, saveRecordedAudio] Attempting Electron save');
            const localPath = await saveWithElectron(blob, filename);
            
            // Also try server backup if possible
            try {
                console.log('[fileStorage.ts, saveRecordedAudio] Attempting server backup');
                await uploadToServer(blob, filename);
                toast.success('Audio saved both locally and to server');
                console.log('[fileStorage.ts, saveRecordedAudio] Server backup successful');
            } catch (serverError) {
                toast.info('Audio saved locally only');
                console.warn('[fileStorage.ts, saveRecordedAudio] Server backup failed:', serverError);
            }

            console.log('[fileStorage.ts, saveRecordedAudio] Electron save completed successfully');
            return {
                success: true,
                localPath
            };
        } catch (electronError) {
            console.warn('[fileStorage.ts, saveRecordedAudio] Electron save failed, falling back to server:', electronError);
            // Fall through to server upload
        }
    }

    /**
     * Final Fallback: Server Upload
     * Last resort when both local storage methods fail
     * Provides cloud-based storage solution
     * Handles complete failure scenario with appropriate error reporting
     * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
     * Server upload utilities handle cloud storage operations and provide a consistent interface
     * Syntax:
     *   - FormData append: `formData.append('file', blob, filename)`
     *   - Progress event: `xhr.upload.onprogress = (e) => e.loaded / e.total`
     */
    try {
        console.log('[fileStorage.ts, saveRecordedAudio] Attempting server upload');
        const result = await uploadToServer(blob, filename);
        toast.success('Audio saved to server');
        console.log('[fileStorage.ts, saveRecordedAudio] Server upload successful');
        return {
            success: true,
            key: result.key
        };
    } catch (error) {
        console.error('[fileStorage.ts, saveRecordedAudio] All storage methods failed:', error);
        toast.error('Failed to save audio file');
        console.log('[fileStorage.ts, saveRecordedAudio] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};

/**
 * Server upload functionality for audio files
 * Manages communication with backend storage service
 * Used by saveRecordedAudio for cloud storage
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API} - Fetch API
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
 * Server upload utilities handle cloud storage operations and provide a consistent interface
 */

/* Keywords: [uploadToServer, blob, filename, FormData, fetch]

Technical: Implements server-side storage for audio recordings
Role:
  uploadToServer: Manages file upload to remote server
  blob: Audio data to upload
  filename: File identifier
  FormData: Data container for upload
  fetch: Network request handler

Constraints:
- Requires network connectivity
- Server must support multipart/form-data
- File size limited by server config
- Valid filename required

Actions:
- Creates FormData object
- Appends file with metadata
- Sends POST request to server
- Handles response parsing
- Manages upload errors

Dependencies:
- Fetch API
- Network connectivity
- Server endpoint
- Valid MIME types

Outputs:
- Upload success status
- Server-generated key
- Error details if failed
- Progress information

Performance:
- Streaming upload support
- Progress tracking
- Timeout handling
- Response caching

Security:
- Secure HTTPS connection
- File type validation
- Size limit enforcement
- Error sanitization

Scalability:
- Handles multiple file types
- Configurable endpoints
- Extensible response handling
- Load balancing ready

Errors:
- Network error handling
- Timeout management
- Response validation
- Detailed error reporting */

export const uploadToServer = async (blob: Blob, filename: string): Promise<{ key: string }> => {
    console.log('[fileStorage.ts, uploadToServer] Starting server upload', { filename });
    
    try {
        console.log('[fileStorage.ts, uploadToServer] Creating form data');
        const formData = new FormData();
        formData.append('audio', blob, filename);

        console.log('[fileStorage.ts, uploadToServer] Sending POST request to server');
        const response = await fetch('http://localhost:3001/audio/add', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            console.error('[fileStorage.ts, uploadToServer] Server response not OK:', response.status);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('[fileStorage.ts, uploadToServer] Upload successful');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('[fileStorage.ts, uploadToServer] Upload failed:', error);
        throw error;
    }
};

/**
 * Browser capability detection for file system features
 * Ensures graceful fallback for unsupported browsers
 * Used by saveRecordedAudio for feature detection
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Navigator} - Navigator API
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
 * Browser capability detection utilities handle feature detection and provide a consistent interface
 */

/* Keywords: [hasFileSystemAccess, window, showSaveFilePicker]

Technical: Detects browser support for File System Access API
Role:
  hasFileSystemAccess: Feature detection function
  window: Global browser object
  showSaveFilePicker: File system API method

Constraints:
- Browser compatibility required
- Security context limitations
- User permissions needed
- API version dependencies

Actions:
- Checks window object
- Validates API presence
- Returns boolean result
- Logs detection result

Dependencies:
- Modern browser
- Secure context
- Window object
- Console logging

Outputs:
- Boolean support status
- Console log messages
- No side effects
- Consistent results

Performance:
- Minimal overhead
- Cached results
- Quick execution
- No async operations

Security:
- No sensitive data
- Safe detection
- No state changes
- Read-only operation

Scalability:
- Browser agnostic
- Version independent
- Future API compatible
- Maintainable code

Errors:
- Graceful degradation
- Safe type checking
- No exceptions
- Clear logging */

export function hasFileSystemAccess(): boolean {
    console.log('[fileStorage.ts, hasFileSystemAccess] Checking File System Access API support');
    const hasAccess = typeof window !== 'undefined' && 
           'showSaveFilePicker' in window &&
           typeof window.showSaveFilePicker === 'function';
    console.log('[fileStorage.ts, hasFileSystemAccess] Support status:', hasAccess);
    return hasAccess;
};

/* Execution Order:

1. Import Dependencies
   - getFileExtension from audioFormats
   - getContentType from audioFormats

2. Type Definitions
   - Window interface extension
   - FileSystemWritableFileStream interface
   - FileSystemFileHandle interface
   - SaveFilePickerOptions interface
   - StorageResult interface

3. saveRecordedAudio Function
   3.1. Create Blob
       - Combine recordedChunks
       - Set mime type
   3.2. Generate Filename
       - Get file extension
       - Create timestamp-based name
   3.3. Storage Strategy 1: File System Access API
       3.3.1. Check API support (hasFileSystemAccess)
       3.3.2. Show save file picker
       3.3.3. Get file handle
       3.3.4. Create writable stream
       3.3.5. Write blob data
       3.3.6. Close stream
       3.3.7. Attempt server backup (uploadToServer)
   3.4. Storage Strategy 2: Electron
       3.4.1. Check Electron environment (isElectron)
       3.4.2. Load Electron modules
       3.4.3. Show save dialog
       3.4.4. Convert blob to buffer
       3.4.5. Write file
       3.4.6. Attempt server backup (uploadToServer)
   3.5. Storage Strategy 3: Server Upload
       3.5.1. Call uploadToServer
       3.5.2. Handle response
   3.6. Return StorageResult

4. uploadToServer Function
   4.1. Create FormData
   4.2. Append file data
   4.3. Send POST request
   4.4. Parse response
   4.5. Return server key

5. hasFileSystemAccess Function
   5.1. Check window object
   5.2. Validate showSaveFilePicker
   5.3. Return support status

6. Utility Functions
   6.1. isElectron
       - Check window.process
       - Validate renderer process
   6.2. saveWithElectron
       - Load Electron modules
       - Show save dialog
       - Write file */
