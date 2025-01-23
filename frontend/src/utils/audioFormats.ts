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
    return Object.values(SUPPORTED_AUDIO_FORMATS).find(
        type => MediaRecorder.isTypeSupported(type)
    ) || SUPPORTED_AUDIO_FORMATS.WEBM;
};

/**
 * Gets the file extension for a given MIME type
 * @param {string} mimeType - The MIME type of the audio
 * @returns {string} The corresponding file extension
 */
export const getFileExtension = (mimeType: string): string => {
    const baseType = mimeType.split(';')[0] as BaseAudioMimeType; // Remove codecs info if present
    return FILE_EXTENSIONS[baseType] || '.webm';
};

/**
 * Gets the content type for a filename based on its extension
 * @param {string} filename - The name of the file
 * @returns {string} The corresponding content type
 */
export const getContentType = (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeTypes = Object.entries(FILE_EXTENSIONS).find(
        ([_, extension]) => extension.slice(1) === ext
    );
    return mimeTypes ? mimeTypes[0] : 'application/octet-stream';
};
