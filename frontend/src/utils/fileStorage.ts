/**
 * File system operations and storage utilities for audio recording
 * Provides interface between application and browser's file system
 * Used by AudioRecorder.tsx for saving and uploading recordings
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API} - File System Access API
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts, services/audioService.ts
 * Utility functions encapsulate common file operations and provide a consistent interface across the application
 * Syntax:
 *   - File handle: `await window.showSaveFilePicker({ suggestedName })`
 *   - Stream write: `const writableStream = await fileHandle.createWritable()`
 *   - Electron dialog: `await window.electron.showSaveDialog({ defaultPath })`
 */

/**
 * Type definitions for the File System Access API
 * These interfaces define the contract for browser's native file system operations
 * Provides type safety for modern browser APIs that allow direct file access
 * Essential for implementing local file saving functionality
 */

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

import { getFileExtension, getContentType } from './audioFormats';

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
     * Generate a unique filename using current timestamp
     * Format: recording-[timestamp].webm
     * Ensures no filename conflicts when saving multiple recordings
     */
    const extension = getFileExtension(mimeType);
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
                        [mimeType]: [extension]
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
                filters: [{ name: 'Audio Files', extensions: [extension] }]
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
export function hasFileSystemAccess(): boolean {
    console.log('[fileStorage.ts, hasFileSystemAccess] Checking File System Access API support');
    const hasAccess = typeof window !== 'undefined' && 
           'showSaveFilePicker' in window &&
           typeof window.showSaveFilePicker === 'function';
    console.log('[fileStorage.ts, hasFileSystemAccess] Support status:', hasAccess);
    return hasAccess;
};
