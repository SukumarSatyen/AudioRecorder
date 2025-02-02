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
  
   Keywords: [Window, FileSystemFileHandle, FileSystemWritableFileStream, WritableStream, SaveFilePickerOptions, StorageResult]

Technical: Defines TypeScript interfaces for File System Access API integration
Role:
  Window: Global interface extension for file system capabilities
  FileSystemFileHandle: File handle management interface
  FileSystemWritableFileStream: Stream writing interface
  WritableStream: Base stream interface
  SaveFilePickerOptions: File save dialog configuration
  StorageResult: Operation result type definition

Keywords: [saveRecordedAudio, recordedChunks, mimeType, blob, filename, handle, writable, isElectron, saveWithElectron, uploadToServer]

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

 Keywords: [uploadToServer, blob, filename, FormData, fetch]

Technical: Implements server-side storage for audio recordings
Role:
  uploadToServer: Manages file upload to remote server
  blob: Audio data to upload
  filename: File identifier
  FormData: Data container for upload
  fetch: Network request handler


 Keywords: [hasFileSystemAccess, window, showSaveFilePicker]

Technical: Detects browser support for File System Access API
Role:
  hasFileSystemAccess: Feature detection function
  window: Global browser object
  showSaveFilePicker: File system API method
  
 * Type definitions for File System Access API interfaces
 * Provides type safety for browser's native file system operations
 */

const path = require('path');

declare global {
    interface Window {
        showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }
}

/**
 * Writable stream interface for file operations
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WritableStream}
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

/**
 * Benefits of using interfaces in TypeScript:
 * 1. **Type Safety**: Interfaces ensure that the object conforms to a specific structure, preventing errors due to incorrect property assignments.
 * 2. **Code Readability**: Interfaces provide explicit documentation on the expected shape of the object, making the code more understandable by other developers.
 * 3. **Auto-completion**: When using an interface, IDEs and code editors can provide auto-completion suggestions for the properties and methods, making development more efficient.
 * 4. **Flexibility**: Interfaces allow for optional properties, making it easier to handle different scenarios and edge cases.
 */


import { getAudioFormatInfo } from './audioFormats';
import { toast } from 'react-toastify';

export const saveRecordedAudio = async (
    recordedChunks: BlobPart[], 
    // 'The chunks of audio data to be saved, represented as BlobPart objects.
    // BlobPart is a type in the Web Audio API that represents a part of an audio or video file.
    // It can be a chunk of audio data, such as an audio sample, or it can be a chunk of video data, such as a frame of video.
    mimeType : string = getAudioFormatInfo().mimeType
    // mimeType: string = 'audio/webm' // 'The MIME type of the audio data to be saved.'
): Promise<StorageResult> => {
    /**
     
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
     * @returns {Promise<StorageResult>}
     * 
     * interface declared above as StorageResult: {
     * 
     *  success: boolean
     *  key?: string // key or identifier for the saved file
     *  localPath?: string // local path where the file was saved
     *  error?: string // error message if the save operation failed
     * 
     *  The key property is optional (?) because it is only used by the
     *  server upload method, which is the last fallback method in the
     *  saveRecordedAudio function. If the server upload method is not
     *  used, then the key property is not used.
     * 
     *  Then, Returns a Promise that resolves with a StorageResult object
     * }
     */

    console.log('[fileStorage.ts, saveRecordedAudio] Starting audio save process');
    
    // Create blob and generate filename
    const blob = new Blob(recordedChunks, { type: mimeType });
    // Create a new blob containing the recorded audio data
    // After the user has finished recording
    // The blob is created in memory
    // To prepare the data for saving to the file system
    // Using the Blob constructor with the recordedChunks array as the first argument, and an options object as the second argument


    console.log('[fileStorage.ts, saveRecordedAudio] Created blob with size:', blob.size, 'bytes');
    
    /**
     * Get audio format information including file extension
     * This provides consistent format handling across the application
     */
    const formatInfo = getAudioFormatInfo();
    const extension = formatInfo.fileExtension;
    
    const filename = `rec-${Date.now()}${extension}`;
    // Sample output: rec-1643723400.webm
    // The filename is a timestamp (in milliseconds) concatenated with the file extension
    // The timestamp is obtained using the Date.now() method
    // The file extension is obtained from the getAudioFormatInfo() function
    console.log('[fileStorage.ts, saveRecordedAudio] Generated filename:', filename);


    // File System Access API
    
    // export const hasFileSystemAccess = (): boolean => {
    /* return hasAccess; }; */

    console.log('[fileStorage.ts, hasFileSystemAccess] Checking File System Access API support');
    const hasAccess = typeof window !== 'undefined' && 
           'showSaveFilePicker' in window &&
           typeof window.showSaveFilePicker === 'function';

    /**
     * Keywords:
     *  hasAccess: Boolean indicating browser support for File System Access API
     *  FileSystemFileHandle: Interface for file system access
     *  FileSystemWritableFileStream: Interface for file writing operations
     *  Window: Global interface extension for file system capabilities
     *  typeof window !== 'undefined': Ensures that the window object is defined,
     *                                which is necessary for the File System Access API
     *                                to work properly. This check is necessary because
     *                                the window object is not always defined, such as
     *                                in server-side rendering scenarios.
     *  'showSaveFilePicker' in window: Checks if the showSaveFilePicker method is available
     *  typeof window.showSaveFilePicker === 'function': Ensures that the showSaveFilePicker method is a function
     */

    console.log('[fileStorage.ts, hasFileSystemAccess] Support status:', hasAccess);
    // The filename is stored in memory, but is it possible for the browser to write
    // directly to the local hard disk where the browser is running?
    // The answer is yes, using the File System Access API.
    // The browser can request access to the local file system using the
    // showSaveFilePicker() method, which returns a FileSystemFileHandle object.
    // The handle object can be used to create a FileSystemWritableFileStream object,
    // which can be used to write data directly to the local file system.
    // This provides a way for the browser to write data directly to the local
    // hard disk, without having to use the server as an intermediary.
    
    if (!hasAccess) {
        console.log('[fileStorage.ts, saveRecordedAudio] File System Access API not supported');
        return {
            success: false,
            error: 'File System Access API not supported'
        };
    }

    console.log('[fileStorage.ts, saveRecordedAudio] Attempting to save file using File System Access API');
    
    const osName = require('os').platform();
    console.log('[fileStorage.ts, saveRecordedAudio] OS name:', osName);

    const browserName = (() => {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';
        if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        return 'Not included in Code';
    })();
    console.log('[fileStorage.ts, saveRecordedAudio] Browser name:', browserName);

    const homedir = require('os').homedir();
    const fs = require('fs').promises;
    const folderPath = path.join(homedir, 'audio');
    const filePath = path.join(folderPath, filename);

    /* 
    Keywords: [fileStorage.ts, saveRecordedAudio, homedir, fs, folderPath, filePath]
    
     * Keywords:
     *  fileStorage.ts: This is the name of the file that contains the code
     *  saveRecordedAudio: This is the name of the function that contains the code
     *  homedir: This is the name of a variable that is used to store the home directory path
     *  fs: This is the name of a variable that is used to store the file system module
     *  folderPath: This is the name of a variable that is used to store the path of the folder where the file is being saved
     *  filePath: This is the name of a variable that is used to store the path of the file that is being saved
     */

    const fileStorageConfig = {
        osName,
        browserName,
        homedir,
        folderPath,
        filePath
    };

    console.log('[fileStorage.ts, saveRecordedAudio] File storage configuration:', fileStorageConfig);
    const toastOptions = {
        position: "bottom-right" as const,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
    };

    /* 
    Fixed the type error by adding as const to the position value. 
    The as const assertion tells TypeScript that "top-right" should be treated as a literal type rather than a general string.
    Literal type is a type that has a specific value, while a general string is a type that can have any value.
    For example, the type "top-right" is a literal type because it has a specific value, while the type string is a general string type because it can have any value.
    In TypeScript, when you use a string literal in a type annotation, you are creating a literal type.
    When you use a string literal in a type annotation, TypeScript will infer the type of the variable to be the literal type, not the general string type.
    For example, if you write `const x: "top-right" = "top-right"`, the type of `x` is `"top-right"`, not `string`.
    This is important because it allows TypeScript to check the type more accurately.
    For example, if you have a function that takes a parameter of type `"top-right"`, TypeScript will throw an error if you try to call the function with a string that is not `"top-right"`.
    If you had used a general string type instead, TypeScript would not throw an error, because the type `string` is satisfied by any string value, not just `"top-right"`.
    By using a literal type, you are telling TypeScript that you are intentionally using a specific value, and you want it to check the type more accurately.
    
    This is important because React-Toastify's ToastPosition type is a union of specific string literals, not a general string type.
    By using as const, we're telling TypeScript that we're intentionally using one of these specific values, which allows it to check the type more accurately.
    

    The valid positions for React-Toastify are:

    "top-right"
    "top-center"
    "top-left"
    "bottom-right"
    "bottom-center"
    "bottom-left"

    The error occurred because React-Toastify's ToastPosition type only accepts these specific string literals, not any arbitrary string. 
    By using as const, we're telling TypeScript that we're intentionally using one of these specific values.
        
    theme options: "colored", "dark", "light", "minimal"
    */

    toast(`File storage configuration: ${JSON.stringify(fileStorageConfig, null, 4)}`, toastOptions);
    // JSON.stringify(fileStorageConfig, null, 4) is a formatted string representation of the fileStorageConfig object. 
    // The second argument, null, is the replacer function which is not used here. 
    // The third argument, 4, is the space parameter which specifies the number of spaces to use for indentation in the string representation. 
    // The resulting string is a pretty-printed JSON representation of the fileStorageConfig object.`);

    console.log('[fileStorage.ts, saveRecordedAudio] Attempting to save file directly to home directory: ', filePath);

    try {
        const folderExistsBoolean = await fs.stat(folderPath).then(() => true).catch(() => false);
        // fs.stat(folderPath) - Returns information about the file or directory at the specified path.
        // The information includes the file type, permissions, access time, modification time, and other attributes.
        // If the file or directory does not exist, the method returns a rejected promise with an error object.
        // The then() method is used to handle the resolved promise, and the catch() method is used to handle the rejected promise.
        // The then() method returns a new promise that resolves with the value returned by the callback function.
        // The catch() method returns a new promise that resolves with the value returned by the callback function if the original promise was rejected.
        // In this case, the then() method returns a promise that resolves with the value true, and the catch() method returns a promise that resolves with the value false.
        // The await keyword is used to wait for the promise to resolve, and the result is stored in the folderExists variable.
        // The expected result is a boolean value indicating whether the folder exists or not.
        // If the folder exists, the result is true, otherwise it is false.


        console.log('[fileStorage.ts, saveRecordedAudio] Folder exists result:', folderExistsBoolean.toString());

        if (typeof folderExistsBoolean === 'boolean' && folderExistsBoolean) {
            console.log('[fileStorage.ts, saveRecordedAudio] Folder exists:', folderPath);
        } else {
            console.log('[fileStorage.ts, saveRecordedAudio] Folder does not exist:', folderPath);
        
            try {
                await fs.mkdir(folderPath, { recursive: true });
            } catch (error) {
                console.log('[fileStorage.ts, saveRecordedAudio] Error creating folder:', error);
            }
            // fs.mkdir(folderPath, { recursive: true }) - Creates the directory specified in folderPath if it does not already exist.
            // The { recursive: true } option means that the directory will be created recursively if any of its parent directories do not already exist.
            // For example, if folderPath is /user/documents/audioRecordings, the mkdir method will create the directories /user, /user/documents, and /user/documents/audioRecordings if they do not already exist.
            console.log('[fileStorage.ts, saveRecordedAudio] Created folder:', folderPath);
        }
            try {
                const writable = await fs.open(filePath, 'w');
                await writable.write(blob);
                await writable.close();
            } catch (error) {
                console.log('[fileStorage.ts, saveRecordedAudio] Error writing to file:', error);
            }
            // fs.open(filePath, 'w') - Opens the file specified in filePath in write mode.
            // The 'w' option stands for write mode.
            // The method returns a promise that resolves with a FileHandle object.
            // The FileHandle object is used to perform operations on the file.
            // The await keyword is used to wait for the promise to resolve, and the result is stored in the writable variable.

            // writable.write(blob) - Writes the blob to the file.
            // The blob is the audio data as a blob object.
            // The write method returns a promise that resolves when the write operation is complete.
            // The await keyword is used to wait for the promise to resolve.

            // writable.close() - Closes the file handle.
            // The close method returns a promise that resolves when the file handle is closed.
            // The await keyword is used to wait for the promise to resolve.
        
        return {
            success: true,
            localPath: filePath
        };
    } catch (error) {
        console.error('[fileStorage.ts, saveRecordedAudio] Error saving file directly to home directory:', error);

        return {
            success: false,
            error: 'Error saving file directly to home directory'
        };
    }
}



/* Exisitng Execution Order:

1. Import Dependencies
   - getFileExtension from audioFormats
   - getContentType from audioFormats
   - toast from toast

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
       

Planned Execution Order:

   3.4. Storage Strategy A: File System Access API
       3.4.1. Check API support (hasFileSystemAccess)
       3.4.2. Show save file picker
       3.4.3. Get file handle
       3.4.4. Create writable stream
       3.4.5. Write blob data
       3.4.6. Close stream
       3.4.7. Attempt server backup (uploadToServer)
   3.5. Storage Strategy B: Electron
       3.5.1. Check Electron environment (isElectron)
       3.5.2. Load Electron modules
       3.5.3. Show save dialog
       3.5.4. Convert blob to buffer
       3.5.5. Write file
       3.5.6. Attempt server backup (uploadToServer)
   3.6. Storage Strategy 3: Server Upload
       3.6.1. Call uploadToServer
       3.6.2. Handle response
   3.7. Return StorageResult

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
