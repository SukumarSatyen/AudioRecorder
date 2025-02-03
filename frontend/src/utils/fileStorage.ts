import { getAudioFormatInfo } from './audioFormats';
import { toast } from 'react-toastify';

interface StorageResult {
    success: boolean;
    key?: string;
    localPath?: string;
    error?: string;
}

/*
 * Benefits of using interfaces in TypeScript:
 * 1. Type Safety: Interfaces ensure that the object conforms to a specific structure, preventing errors due to incorrect property assignments.
 * 2. Code Readability: Interfaces provide explicit documentation on the expected shape of the object, making the code more understandable by other developers.
 * 3. Auto-completion: When using an interface, IDEs and code editors can provide auto-completion suggestions for the properties and methods, making development more efficient.
 * 4. Flexibility: Interfaces allow for optional properties, making it easier to handle different scenarios and edge cases.
 */

export const saveRecordedAudioAsBase64 = (
    blob: Blob 
    // arrayBlobPartObjects: BlobPart[] 
    // arrayBlobPartObjects is an array of BlobPart objects, while blob is a single Blob object. 
    // arrayBlobPartObjects is used when you want to access each chunk of the audio data individually, 
    // while blob is used when you want to access the entire audio data as a single entity. 
    // For example, if you want to play the audio data, you would use the blob, while if you want to process each chunk of the audio data, you would use arrayBlobPartObjects.
    // 'The chunks of audio data to be saved, represented as BlobPart objects.
    // BlobPart is a type in the Web Audio API that represents a part of an audio or video file.
    // It can be a chunk of audio data, such as an audio sample, or it can be a chunk of video data, such as a frame of video.
    // No need to define either
    // mimeType: string = 'audio/webm' 
    // or
    // arrayBlobPartObjects: BlobPart[], 
    // 'The chunks of audio data to be saved, represented as BlobPart objects.
    // BlobPart is a type in the Web Audio API that represents a part of an audio or video file.
    // It can be a chunk of audio data, such as an audio sample, or it can be a chunk of video data, such as a frame of video.
    // mimeType : string = getAudioFormatInfo().mimeType
    // mimeType: string = 'audio/webm' // 'The MIME type of the audio data to be saved.'
    // 'The MIME type of the audio data to be saved.'
): Promise<StorageResult> => {
    return new Promise((resolve) => {
        const timestamp = new Date().getTime();
        console.log('[fileStorage.ts, saveRecordedAudioAsBase64] Timestamp:', timestamp);
        
        const filename = `audio_${timestamp}.${getAudioFormatInfo().fileExtension}`;
        console.log('[fileStorage.ts, saveRecordedAudioAsBase64] File name:', filename);

        console.log('[fileStorage.ts, saveRecordedAudio] Starting audio save process');
    
        // Create blob and generate filename
        // const blobPart = new Blob(arrayBlobPartObjects, { type: getAudioFormatInfo().mimeType });
        // Create a new blobPart containing the recorded audio data
        // After the user has finished recording
        // The blob is created in memory
        // To prepare the data for saving to the file system
        // Using the Blob constructor with the arrayBlobPartObjects array as the first argument, and an options object as the second argument

        console.log('[fileStorage.ts, saveRecordedAudio] Created blob with size:', blob.size, ' bytes');

        const formatInfo = getAudioFormatInfo();
        const extension = formatInfo.fileExtension;
        console.log('[fileStorage.ts, saveRecordedAudio] File extension:', extension);

        const osName = (() => {
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('windows') > -1) return 'Windows';
            if (userAgent.indexOf('mac') > -1) return 'MacOS';
            if (userAgent.indexOf('linux') > -1) return 'Linux';
            return 'Unknown';
        })(); // osName executed

        console.log('[fileStorage.ts, saveRecordedAudio] OS name:', osName); 

        const browserName = (() => {
            const userAgent = navigator.userAgent.toLowerCase();
            if (userAgent.indexOf('chrome') > -1) return 'Chrome';
            if (userAgent.indexOf('firefox') > -1) return 'Firefox';
            if (userAgent.indexOf('edge') > -1) return 'Edge';
            if (userAgent.indexOf('opera') > -1 || userAgent.indexOf('opr') > -1) return 'Opera';
            if (userAgent.indexOf('safari') > -1) return 'Safari';
            return 'Not included in Code';
        })(); // browserName executed

        console.log('[fileStorage.ts, saveRecordedAudio] Browser name:', browserName);

        const fileStorageConfig = {
            osName,
            browserName,
            filename,
            blobSize: blob.size
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

    
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        // Create a new FileReader object, which is used to read the contents of the given blob.
        // The readAsDataURL method is used to read the blob as a data URL, which is a string that
        // contains the contents of the blob encoded in base64 format.
        // The onloadend event is triggered when the entire blob has been read, and the result
        // is stored in the result property of the FileReader object.
        // The result property is a string that contains the base64 encoded blob data.
        
        reader.onloadend = () => {
            try {
                const base64data = reader.result as string;
                console.log('[fileStorage.ts, saveRecordedAudioAsBase64] Base64 data:', base64data);
                localStorage.setItem(filename, base64data);
                // localStorage is a web storage API that allows web applications to store data locally within the user's browser.
                // setItem is a method of the localStorage object that adds a key-value pair to the storage area.
                // The first argument is the key, which is a string that identifies the data to be stored.
                // The second argument is the value, which is the data to be stored.
                // In this case, the key is the filename, and the value is the base64 encoded audio data.
                // The base64 encoded audio data is stored in the localStorage so that it can be retrieved later.
                // The key-value pair is stored in the browser's local storage, which is a persistent storage that is not cleared when the user closes the browser.
                // The data is stored in the browser's local storage, 
                // - which is a sandboxed environment that is not accessible by other web sites.
                // - which is a client-side storage that does not require a server to store the data.
                // - which is a fast storage that does not require a network request to store the data.

                // Resolve the promise with a successful StorageResult
                // success: a boolean indicating whether the operation was successful
                // key: a string identifying the saved file (used by the server upload method)
                // localPath: a string indicating the local path where the file was saved (used by the local storage method)
                // These key-value pairs are included in the resolved promise to provide additional information to the caller.
                // The caller should be the AudioRecorder component, which uses the returned StorageResult to update its state and trigger further actions.
                // The AudioRecorder component should be the caller because it calls the saveRecordedAudioAsBase64 function and handles the returned promise.
                // The AudioRecorder component should use the returned StorageResult to update its state (e.g., `recordingFinished`) 
                // and trigger further actions (e.g., sending the saved audio to the server).
                resolve({
                    success: true,
                    key: filename,
                    localPath: filename
                });
            } catch (error) {
                console.error('[fileStorage.ts, saveRecordedAudioAsBase64] Error saving audio:', error);
                resolve({
                    success: false,
                    error: `Failed to save audio as base64 string: ${error instanceof Error ? error.message : 'Unknown error'}`
                });
            }
        };

        reader.onerror = () => {
            resolve({
                success: false,
                error: 'Failed to convert audio to base64 string. Make sure your browser supports FileReader and data URLs.'
            });
        };
    });
};

/* Existing Execution Order:

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
       - Combine arrayBlobPartObjects
       - Set mime type
   3.2. Generate Filename
       - Get file extension
       - Create timestamp-based name
   3.3. Storage Strategy 1: Local Storage
       3.3.1. Use base64 encoding to save audio to local storage
       3.3.2. Return StorageResult indicating success or failure

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
