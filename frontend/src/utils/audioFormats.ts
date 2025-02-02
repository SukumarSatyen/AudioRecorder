/**
 * Utility functions for handling different audio formats
 * Provides centralized audio format management and validation
 */
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
/**
 * SUPPORTED_AUDIO_FORMATS
 *
 * Technical: This constant holds a mapping of supported audio formats to their respective MIME types.
 * Role: Provides a centralized way to manage supported audio formats.
 * Constraints: Limited to predefined formats.
 * Actions: Maps each format to its respective MIME type.
 * Dependencies: Requires the correct MIME types to be defined.
 * Outputs: Returns a string representing the MIME type for a given format.
 * Performance: Efficient lookup for supported formats.
 * Security: No direct security risks; relies on valid MIME types.
 * Scalability: Can be extended by adding more formats and MIME types.
 * Errors: No error handling needed as it’s a static mapping.
 */

export const SUPPORTED_AUDIO_FORMATS = {
  WEBM: "audio/webm;codecs=opus",
  MP3: "audio/mp3",
  WAV: "audio/wav",
  OGG: "audio/ogg",
  AAC: "audio/aac", // Recommended for mobile devices
  M4A: "audio/m4a", // Popular for podcasts and streaming
  FLAC: "audio/flac", // Lossless audio format
} as const

/**
 * BaseAudioMimeType
 *
 * Technical: Defines a type that restricts audio mime types to a specific set.
 * Role: Ensures that only valid audio types are utilized throughout the code.
 * Constraints: Cannot use mime types outside the defined set.
 * Actions: Enforces type safety for audio mime types.
 * Dependencies: None.
 * Outputs: Provides type checking during development.
 * Performance: Minimal overhead as it’s a type definition.
 * Security: Reduces risks by limiting mime types.
 * Scalability: Can be expanded by adding more mime types to the definition.
 * Errors: TypeScript will flag any invalid mime types.
 */

type BaseAudioMimeType =
  | "audio/webm"
  | "audio/mp3"
  | "audio/wav"
  | "audio/ogg"
  | "audio/aac"
  | "audio/m4a"
  | "audio/flac"

/**
 * FILE_EXTENSIONS
 *
 * Technical: This constant holds a mapping of audio mime types to their corresponding file extensions.
 * Role: Provides a way to retrieve file extensions based on audio mime types.
 * Constraints: Limited to predefined mime types.
 * Actions: Maps each mime type to its respective extension.
 * Dependencies: Requires the correct mime types to be defined.
 * Outputs: Returns a string representing the file extension for a given mime type.
 * Performance: Efficient lookup for file extensions.
 * Security: No direct security risks; relies on valid mime types.
 * Scalability: Can be extended by adding more mime types and extensions.
 * Errors: No error handling needed as it’s a static mapping.
 */

export const FILE_EXTENSIONS: Record<BaseAudioMimeType, string> = {
  "audio/webm": ".webm",
  "audio/mp3": ".mp3",
  "audio/wav": ".wav",
  "audio/ogg": ".ogg",
  "audio/aac": ".aac",
  "audio/m4a": ".m4a",
  "audio/flac": ".flac",
}

/**
 * BaseAudioMimeType and FILE_EXTENSIONS
 *
 * Technical: This section combines the type definition and the mapping of mime types to extensions.
 * Role: Ensures type safety and provides a lookup for extensions.
 * Constraints: Limited to defined mime types and extensions.
 * Actions: Facilitates the retrieval of file extensions based on mime types.
 * Dependencies: Requires both the type and mapping to be defined.
 * Outputs: Provides a way to retrieve file extensions based on audio mime types.
 * Performance: Efficient due to static mappings.
 * Security: No direct risks.
 * Scalability: Can be enhanced with additional mime types and extensions.
 * Errors: No specific error handling needed.
 */

/**
 * Gets the first supported MIME type from the available formats
 * Keywords: [getSupportedMimeType, MediaRecorder, SUPPORTED_AUDIO_FORMATS]
 * Technical: This function retrieves the first supported MIME type from the available formats.
 * Role: Provides a way to obtain a valid MIME type for audio playback.
 * Constraints: Limited to predefined supported formats.
 * Actions: Iterates through the supported formats and returns the first valid MIME type.
 * Dependencies: Requires the SUPPORTED_AUDIO_FORMATS constant to be defined.
 * Outputs: Returns a string representing a supported MIME type.
 * Performance: Efficient as it stops at the first valid format.
 * Security: No direct risks; relies on valid formats.
 * Scalability: Can be extended by adding more formats to SUPPORTED_AUDIO_FORMATS.
 * Errors: No specific error handling needed; returns undefined if no formats are valid.
 */
export const getSupportedMimeType = (): string => {
  console.log(
    "[audioFormats.ts, getSupportedMimeType] Starting MIME type detection"
  )
  // 1. Get all supported mime types from MediaRecorder
  // 2. Check if any of the supported types are supported by MediaRecorder
  // 3. If yes, return the first supported type
  // 4. If no, return the default WEBM type
  // 5. Log the result
  // 6. Return the result

  const supportedType = Object.values(SUPPORTED_AUDIO_FORMATS).find(
    (type) => MediaRecorder.isTypeSupported(type)
    // type: string
    // isTypeSupported: (type: string) => boolean
    // supportedType: string
  )

  const supportedTypesAsString = Object.values(SUPPORTED_AUDIO_FORMATS)
    .filter((type) => MediaRecorder.isTypeSupported(type))
    .join(", ")

  const supportedTypesFormatted = Object.values(SUPPORTED_AUDIO_FORMATS)
    .filter((type) => MediaRecorder.isTypeSupported(type))
    .map((type) => `• ${type}`)
    .join("\n")

  // Show toast notification with beautiful formatting
  toast.info(`Supported Audio Formats:\n ${supportedTypesFormatted}`, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      fontSize: "16px",
      lineHeight: "1.5",
      whiteSpace: "pre-line",
    },
  })

  console.log(
    "[audioFormats.ts, getSupportedMimeType] Supported MIME types:",
    supportedTypesAsString
  )
  console.log(
    "[audioFormats.ts, getSupportedMimeType] Supported MIME types (formatted):",
    supportedTypesFormatted
  )

  if (supportedType && supportedType.length > 0) {
    console.log(
      "[audioFormats.ts, getSupportedMimeType] Found supported MIME type:",
      supportedType
    )
  } else {
    console.log(
      "[audioFormats.ts, getSupportedMimeType] No supported types found, using default WEBM"
    )
  }

  const result = SUPPORTED_AUDIO_FORMATS.WEBM || supportedType
  console.log(
    "[audioFormats.ts, getSupportedMimeType] Returning MIME type:",
    result
  )
  return result
}

/**
 * Execution Order:
 *
 * 1. Call getSupportedMimeType to retrieve the first supported MIME type.
 * 2. Return the MIME type for further processing.
 */

/**
 * Gets the file extension for a given MIME type
 * Keywords: [getFileExtension, FILE_EXTENSIONS, BaseAudioMimeType]
 * Technical: This function retrieves the file extension for a given MIME type.
 * Role: Provides a way to obtain the file extension for a given MIME type.
 * Constraints: Limited to predefined MIME types.
 * Actions: Maps the MIME type to its corresponding file extension.
 * Dependencies: Requires the FILE_EXTENSIONS constant to be defined.
 * Outputs: Returns a string representing the file extension.
 * Performance: Efficient lookup for file extensions.
 * Security: No direct security risks; relies on valid MIME types.
 * Scalability: Can be extended by adding more MIME types and extensions.
 * Errors: No specific error handling needed; returns undefined if no extension is found.
 */
export const getFileExtension = (mimeType: string): string => {
  console.log(
    "[audioFormats.ts, getFileExtension] Starting with MIME type:",
    mimeType
  )

  console.log("[audioFormats.ts, getFileExtension] Extracting base MIME type")
  const baseType = mimeType.split(";")[0] as BaseAudioMimeType // Remove codecs info if present

  // List all supported file extensions for the base type
  const supportedExtensionsFormatted = Object.entries(FILE_EXTENSIONS)
    .filter(([key]) => key === baseType) // Filter to get only the matching baseType
    .map(([key, value]) => `• ${key}: ${value}`) // Format each entry
    .join("\n") // Join with new lines

  console.log(
    "[audioFormats.ts, getFileExtension] Supported file extensions (formatted):",
    supportedExtensionsFormatted
  )
  // Show toast notification with supported file extensions
  toast.info(
    `Supported File Extensions for "${baseType}":\n${supportedExtensionsFormatted}`,
    {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      style: {
        fontSize: "16px",
        lineHeight: "1.5",
        whiteSpace: "pre-line",
      },
    }
  )

  const extension = FILE_EXTENSIONS[baseType] || ".webm"
  console.log(
    "[audioFormats.ts, getFileExtension] Determined file extension:",
    extension
  )

  return extension
}

/**
 * Gets the content type for a filename based on its extension
 * Keywords: [getContentType, FILE_EXTENSIONS, filename]
 * Technical: This function retrieves the content type for a filename based on its extension.
 * Role: Provides a way to obtain the content type for a given filename.
 * Constraints: Limited to predefined file extensions.
 * Actions: Maps the file extension to its corresponding content type.
 * Dependencies: Requires the FILE_EXTENSIONS constant to be defined.
 * Outputs: Returns a string representing the content type.
 * Performance: Efficient lookup for content types.
 * Security: No direct security risks; relies on valid file extensions.
 * Scalability: Can be extended by adding more file extensions and content types.
 * Errors: No specific error handling needed; returns undefined if no content type is found.
 */
export const getContentType = (filename: string): string => {
  /* 
    The getContentType function is imported in the following file:
    File: frontend/src/utils/fileStorage.ts
    Import Statement: import { getFileExtension, getContentType } from './audioFormats';    

*/
  console.log(
    "[audioFormats.ts, getContentType] Starting with filename:",
    filename
  )

  console.log("[audioFormats.ts, getContentType] Extracting file extension")
  const ext = filename.toLowerCase().split(".").pop()
  console.log("[audioFormats.ts, getContentType] Extracted extension:", ext)

  const mimeTypes = Object.entries(FILE_EXTENSIONS).find(
    ([_, extension]) => extension.slice(1) === ext
  )

  console.log("[audioFormats.ts, getContentType] Found MIME types:", mimeTypes)

  // List all supported content types
  const supportedContentTypesFormatted = Object.entries(FILE_EXTENSIONS)
    .filter(([key]) => MediaRecorder.isTypeSupported(key)) // Filter to get only the supported types
    .map(([key, value]) => `• ${key}: ${value}`) // Format each entry
    .join("\n") // Join with new lines

  console.log(
    "[audioFormats.ts, getContentType] Supported Content Types (formatted):",
    supportedContentTypesFormatted
  )

  // Show toast notification with supported content types
  toast.info(`Supported Content Types:\n${supportedContentTypesFormatted}`, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      fontSize: "16px",
      lineHeight: "1.5",
      whiteSpace: "pre-line",
    },
  })

  const contentType = mimeTypes ? mimeTypes[0] : "application/octet-stream"
  console.log(
    "[audioFormats.ts, getContentType] Determined content type:",
    contentType
  )

  return contentType
}

/**
 * Gets comprehensive audio format information
 * Keywords: [getAudioFormatInfo, getSupportedMimeType, getFileExtension, getContentType]
 *
 * Technical: Combines all audio format information into a single JSON response
 * Role: Provides a unified interface for audio format details
 * Constraints: Limited to supported audio formats
 * Actions: Retrieves MIME type, extension, and content type with fallbacks
 * Dependencies: Requires all three underlying functions
 * Outputs: JSON object with format information
 * Performance: Multiple lookups but cached results
 * Security: No direct risks, uses validated data
 * Scalability: Extensible with new format properties
 * Errors: Implements three-level fallback for content type
 */
export const getAudioFormatInfo = (): {
  mimeType: string
  fileExtension: string
  contentType: string
} => {
  console.log(
    "[audioFormats.ts, getAudioFormatInfo] Starting format info retrieval"
  )

  // Get the supported MIME type first
  const mimeType = getSupportedMimeType()
  console.log(
    "[audioFormats.ts, getAudioFormatInfo] Retrieved MIME type:",
    mimeType
  )

  // Get the file extension based on the MIME type
  const fileExtension = getFileExtension(mimeType)
  console.log(
    "[audioFormats.ts, getAudioFormatInfo] Retrieved file extension:",
    fileExtension
  )

  // Attempt to get content type with three-level fallback
  let contentType: string

  // First attempt: Get content type from base MIME type
  try {
    contentType = mimeType.split(";")[0]
    console.log(
      "[audioFormats.ts, getAudioFormatInfo] Determined content type from MIME:",
      contentType
    )

    // Validate if it's a proper audio content type
    if (!contentType.startsWith("audio/")) {
      throw new Error("Invalid audio content type")
    }
  } catch (error) {
    console.log(
      "[audioFormats.ts, getAudioFormatInfo] Failed to get content type from MIME, trying filename method"
    )

    // Second attempt: Try getting content type from filename
    try {
      const sampleFilename = `sample${fileExtension}`
      console.log(
        "[audioFormats.ts, getAudioFormatInfo] Generating sample filename:",
        sampleFilename
      )
      contentType = getContentType(sampleFilename)

      if (!contentType) {
        throw new Error("No content type from filename")
      }
      console.log(
        "[audioFormats.ts, getAudioFormatInfo] Retrieved content type from filename:",
        contentType
      )
    } catch (error) {
      // Final fallback: Use application/octet-stream
      console.log(
        "[audioFormats.ts, getAudioFormatInfo] Falling back to application/octet-stream"
      )
      contentType = "application/octet-stream"
    }
  }

  // Return all information in a JSON object
  const result = {
    mimeType,
    fileExtension,
    contentType,
  }

  console.log(
    "[audioFormats.ts, getAudioFormatInfo] Returning format info:",
    result
  )
  return result
}

/**
 * Execution Order:
 *
 * 1. Define the FILE_EXTENSIONS constant.
 * 2. Define the BaseAudioMimeType type.
 * 3. Map audio mime types to their extensions in FILE_EXTENSIONS.
 * 4. Define the getSupportedMimeType function.
 * 5. Define the getFileExtension function.
 * 6. Define the getContentType function.
 * 7. Define the getAudioFormatInfo function.
 * 8. Export the FILE_EXTENSIONS object.
 * 9. Export the getSupportedMimeType function.
 * 10. Export the getFileExtension function.
 * 11. Export the getContentType function.
 * 12. Export the getAudioFormatInfo function.
 */
