/**
 * Utility functions for handling different audio formats
 * Provides centralized audio format management and validation
 */

export const SUPPORTED_AUDIO_FORMATS = {
    WEBM: 'audio/webm;codecs=opus',
    MP3: 'audio/mp3',
    WAV: 'audio/wav',
    OGG: 'audio/ogg'
} as const;

type BaseAudioMimeType = 'audio/webm' | 'audio/mp3' | 'audio/wav' | 'audio/ogg';

export const FILE_EXTENSIONS: Record<BaseAudioMimeType, string> = {
    'audio/webm': '.webm',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg'
};

/**
 * Gets the first supported MIME type from the available formats
 * @returns {string} The supported MIME type or default to webm
 */
export const getSupportedMimeType = (): string => {
    console.log('[audioFormats.ts, getSupportedMimeType] Starting MIME type detection');
    
    const supportedType = Object.values(SUPPORTED_AUDIO_FORMATS).find(
        type => MediaRecorder.isTypeSupported(type)
    );
    
    if (supportedType) {
        console.log('[audioFormats.ts, getSupportedMimeType] Found supported MIME type:', supportedType);
    } else {
        console.log('[audioFormats.ts, getSupportedMimeType] No supported types found, using default WEBM');
    }
    
    const result = supportedType || SUPPORTED_AUDIO_FORMATS.WEBM;
    console.log('[audioFormats.ts, getSupportedMimeType] Returning MIME type:', result);
    return result;
};

/**
 * Gets the file extension for a given MIME type
 * @param {string} mimeType - The MIME type of the audio
 * @returns {string} The corresponding file extension
 */
export const getFileExtension = (mimeType: string): string => {
    console.log('[audioFormats.ts, getFileExtension] Starting with MIME type:', mimeType);
    
    console.log('[audioFormats.ts, getFileExtension] Extracting base MIME type');
    const baseType = mimeType.split(';')[0] as BaseAudioMimeType; // Remove codecs info if present
    
    const extension = FILE_EXTENSIONS[baseType] || '.webm';
    console.log('[audioFormats.ts, getFileExtension] Determined file extension:', extension);
    
    return extension;
};

/**
 * Gets the content type for a filename based on its extension
 * @param {string} filename - The name of the file
 * @returns {string} The corresponding content type
 */
export const getContentType = (filename: string): string => {
    console.log('[audioFormats.ts, getContentType] Starting with filename:', filename);
    
    console.log('[audioFormats.ts, getContentType] Extracting file extension');
    const ext = filename.toLowerCase().split('.').pop();
    console.log('[audioFormats.ts, getContentType] Extracted extension:', ext);
    
    const mimeTypes = Object.entries(FILE_EXTENSIONS).find(
        ([_, extension]) => extension.slice(1) === ext
    );
    
    const contentType = mimeTypes ? mimeTypes[0] : 'application/octet-stream';
    console.log('[audioFormats.ts, getContentType] Determined content type:', contentType);
    
    return contentType;
};
