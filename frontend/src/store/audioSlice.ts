// Import required dependencies from Redux Toolkit
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Import audio related types
import { AudioChunk, RecordingState } from '../../types/audio';

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
};

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

// Export the reducer
export default audioSlice.reducer;