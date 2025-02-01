/**
 * Type definitions for audio recording functionality
 * Defines TypeScript interfaces for audio-related data structures
 * Related: store/slices/audioSlice.ts, components/AudioRecorder.tsx, services/audioService.ts
 * TypeScript interfaces provide type safety and better code documentation through explicit type definitions
 */

/**
 * RecordingState interface
 * 
 * Keywords: [RecordingState, isRecording, currentChunkDuration, chunks, mergedAudio, error, isProcessing, mediaRecorder, stream, recordingFinished, isSending]  
 * 
 * Technical: This interface defines the structure of the audio recording state, ensuring type safety and consistency across the application.  
 * Role:
 * RecordingState: Represents the current state of audio recording.
 * isRecording: Indicates if recording is in progress.
 * currentChunkDuration: Duration of the current audio chunk.
 * chunks: Array of recorded audio chunks.
 * mergedAudio: Combined audio blob from all chunks.
 * error: Stores any error messages.
 * isProcessing: Indicates if audio is being processed.
 * mediaRecorder: Instance of MediaRecorder used for recording.
 * stream: Instance of MediaStream used for recording.
 * recordingFinished: Indicates if recording has finished.
 * isSending: Indicates if audio is being sent.
 * Constraints: Must handle potential errors during recording and processing.
 * Actions: Tracks recording state and manages audio chunks.
 * Dependencies: Requires MediaRecorder and MediaStream instances.
 * Outputs: Provides structured data about the recording state.
 * Performance: Efficiently manages audio data without significant overhead.
 * Security: Must handle sensitive audio data securely.
 * Scalability: Can accommodate multiple recordings simultaneously.
 * Errors: Handles errors related to recording and processing.
 */
export interface RecordingState {
  // Boolean flag indicating if recording is in progress
  isRecording: boolean;
  // Duration of the current audio chunk being recorded
  currentChunkDuration: number;
  // Array of recorded audio chunks
  chunks: AudioChunk[];
  // Combined audio blob from all chunks
  mergedAudio: Blob | null;
  // Error message if any error occurs during recording
  error: string | null;
  // Boolean flag indicating if audio is being processed
  isProcessing: boolean;
  // MediaRecorder instance used for recording
  mediaRecorder: MediaRecorder | null;
  // MediaStream instance used for recording
  stream: MediaStream | null;
  // Boolean flag indicating if recording has finished
  recordingFinished: boolean;
  // Boolean flag indicating if audio is being sent
  isSending: boolean;
}

/**
 * AudioChunk interface
 * 
 * Keywords: [AudioChunk, id, blob, duration, timestamp, sent, fileName, filePath]  
 * 
 * Technical: This interface defines the structure for audio chunk metadata, ensuring proper tracking of audio processing.  
 * Role:
 * AudioChunk: Represents an individual audio chunk.
 * id: Unique identifier for the audio chunk.
 * blob: Contains the audio data.
 * duration: Duration of the audio chunk in seconds.
 * timestamp: When the chunk was recorded.
 * sent: Indicates if the chunk has been sent.
 * fileName: Name of the chunk file.
 * filePath: Path where the file will be stored.
 * Constraints: Must ensure unique IDs for each chunk.
 * Actions: Tracks metadata for each audio chunk.
 * Dependencies: Requires proper handling of audio data.
 * Outputs: Provides structured metadata for audio chunks.
 * Performance: Efficiently manages chunk data for processing.
 * Security: Must ensure data integrity and confidentiality.
 * Scalability: Can handle multiple chunks for large recordings.
 * Errors: Handles errors related to chunk processing.
 */
export interface AudioChunk {
  // Unique identifier for the audio chunk
  id: string;
  // Binary large object containing the audio data
  blob: Blob;
  // Duration of the audio chunk in seconds
  duration: number;
  // Timestamp when the chunk was recorded
  timestamp: number;
  // Boolean flag indicating if the chunk has been sent
  sent: boolean;
  // File name for the chunk
  fileName: string;
  // Full path where the file will be stored
  filePath: string;
}

/**
 * Execution Order:  
 * 
 * 1. Initialize recording state  
 * 2. Start recording  
 *    - Set isRecording to true  
 *    - Create MediaRecorder instance  
 *    - Create MediaStream instance  
 * 3. Capture audio chunks  
 *    - Push chunks to the chunks array  
 * 4. Merge audio chunks  
 *    - Set mergedAudio to the combined blob  
 * 5. Handle errors if any  
 *    - Set error message in the state  
 * 6. Finish recording  
 *    - Set recordingFinished to true  
 * 7. Send audio if needed  
 *    - Set isSending to true  
 *    - Process the audio data  
 * 8. Clean up resources  
 *    - Release MediaRecorder and MediaStream instances
 */