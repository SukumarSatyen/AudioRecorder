// Import required dependencies from Redux Toolkit
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Import audio related types
import { AudioChunk, RecordingState } from './audioTypes';

/*
- Technical mechanics: Implements Redux Toolkit's slice pattern for state management using TypeScript
- Role in broader system: createSlice creates reducer logic and actions, PayloadAction ensures type safety for action payloads
- Edge cases/constraints: Type definitions must match actual data structures exactly
- Immediate action: Imports necessary Redux Toolkit utilities and custom type definitions
- Dependencies/inputs: Requires @reduxjs/toolkit package and local type definitions
- Outputs/state changes: No direct state changes, sets up types for state management
- Performance considerations: Import statements are bundled and tree-shaken in production
- Security concerns: Type definitions help prevent injection of malicious data
- Scalability: Types can be extended for additional audio features
- Error handling: TypeScript compilation catches type mismatches
Keywords: [import, createSlice, PayloadAction, AudioChunk, RecordingState]
*/

// Define initial state for the audio recording
const initialState: RecordingState = {
  // Flag to track recording status
  isRecording: false,
  // Track current chunk duration
  currentChunkDuration: 0,
  // Array to store audio chunks
  chunks: [],
  // Store merged audio blob
  mergedAudio: null,
  // Store any error messages
  error: null,
  // Flag to track processing status
  isProcessing: false,
  // Media recorder instance
  mediaRecorder: null,
  // Media stream instance
  stream: null,
  // Flag to track recording finished status
  recordingFinished: false,
  // Flag to track sending status
  isSending: false,
};

/*
- Technical mechanics: Defines initial state object with TypeScript interface RecordingState
- Role in broader system: Serves as the foundation for audio recording state management
- Edge cases/constraints: All properties must be initialized to prevent undefined errors
- Immediate action: Creates initial state object with default values
- Dependencies/inputs: Requires RecordingState type definition
- Outputs/state changes: Establishes baseline state for the audio slice
- Performance considerations: Minimal memory footprint with primitive types
- Security concerns: Null values must be handled carefully in components
- Scalability: Structure supports addition of new audio-related properties
- Error handling: TypeScript ensures type safety for all properties
Keywords: [initialState, RecordingState, isRecording, currentChunkDuration, chunks, mergedAudio, error, isProcessing]
*/

// Create Redux slice for audio functionality
const audioSlice = createSlice({
  // Name of the slice
  name: 'audio',
  // Initial state
  initialState,
  // Define reducers for state mutations
  reducers: {
    // Start recording action
    startRecording: (state) => {
      // Set recording flag to true
      state.isRecording = true;
      // Clear any previous errors
      state.error = null;
    },
    // Stop recording action
    stopRecording: (state) => {
      // Set recording flag to false
      state.isRecording = false;
    },
    // Add new audio chunk action
    addChunk: (state, action: PayloadAction<AudioChunk>) => {
      // Limit chunks to maximum of 5
      if (state.chunks.length < 5) {
        // Add new chunk to array
        state.chunks.push(action.payload);
      }
    },
    // Set merged audio blob action
    setMergedAudio: (state, action: PayloadAction<Blob>) => {
      // Store merged audio blob
      state.mergedAudio = action.payload;
    },
    // Set error message action
    setError: (state, action: PayloadAction<string>) => {
      // Store error message
      state.error = action.payload;
      // Stop recording on error
      state.isRecording = false;
    },
    // Set processing status action
    setProcessing: (state, action: PayloadAction<boolean>) => {
      // Update processing status
      state.isProcessing = action.payload;
    },
    // Reset recording state action
    resetRecording: (state) => {
      // Clear all chunks
      state.chunks = [];
      // Clear merged audio
      state.mergedAudio = null;
      // Clear error message
      state.error = null;
    },
  },
});

/*
- Technical mechanics: Implements Redux reducer functions using createSlice for immutable state updates
- Role in broader system: Each reducer handles specific audio recording state modifications
- Edge cases/constraints: Maximum 5 chunks limit, state mutations only within reducers
- Immediate action: Defines state transformation logic for each audio action
- Dependencies/inputs: Requires initial state and action payloads
- Outputs/state changes: Modifies recording status, chunks array, and error states
- Performance considerations: Immutable updates may impact performance with large audio data
- Security concerns: Validate chunk data before state updates
- Scalability: Can handle multiple recording sessions and audio chunks
- Error handling: Includes error state management and recording status reset
Keywords: [audioSlice, reducers, startRecording, stopRecording, addChunk, setMergedAudio, setError, setProcessing, resetRecording]
*/

// Export individual actions
export const {
  // Action to start recording
  startRecording,
  // Action to stop recording
  stopRecording,
  // Action to add audio chunk
  addChunk,
  // Action to set merged audio
  setMergedAudio,
  // Action to set error
  setError,
  // Action to set processing status
  setProcessing,
  // Action to reset recording
  resetRecording,
} = audioSlice.actions;

/*
- Technical mechanics: Exports individual action creators generated by createSlice
- Role in broader system: Provides typed action creators for components to dispatch
- Edge cases/constraints: Actions must be dispatched through Redux store
- Immediate action: Makes actions available for import in other files
- Dependencies/inputs: Generated from audioSlice reducers
- Outputs/state changes: No direct changes, enables state modifications via dispatch
- Performance considerations: Action creators are lightweight functions
- Security concerns: Actions should validate payload data
- Scalability: New actions can be added as needed
- Error handling: TypeScript ensures correct action usage
Keywords: [export, actions, startRecording, stopRecording, addChunk, setMergedAudio, setError, setProcessing, resetRecording]
*/

// Export the reducer
export default audioSlice.reducer;