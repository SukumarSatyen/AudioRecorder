/**
 * Type definitions for audio recording functionality
 * Defines TypeScript interfaces for audio-related data structures
 * Related: store/slices/audioSlice.ts, components/AudioRecorder.tsx, services/audioService.ts
 * TypeScript interfaces provide type safety and better code documentation through explicit type definitions
 */

/**
 * Audio recording state interface
 * Defines the shape of audio recording state data
 * Related: store/slices/audioSlice.ts, components/AudioRecorder.tsx
 * State interfaces in TypeScript ensure consistent data structure across the application
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
 * Audio chunk metadata interface
 * Defines the structure of audio chunk information
 * Related: services/audioService.ts, components/AudioRecorder.tsx
 * Metadata interfaces help track and manage audio processing state and progress
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