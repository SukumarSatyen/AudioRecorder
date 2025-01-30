/**
 * Redux slice for audio recording state management
 * Manages all audio recording related state and operations
 * Related: components/AudioRecorder.tsx, types/audio.ts, store/index.ts
 * Redux slices provide a way to organize related state logic and actions into manageable pieces
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AudioChunk, RecordingState } from '../../types/audio';
import { toast } from 'react-toastify';
import { getSupportedMimeType } from "../utils/audioFormats";

/**
 * Configuration constants for audio recording
 * Defines core parameters for chunk-based recording
 * Used across audio recording operations
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder} - MediaRecorder API
 */
const CHUNK_DURATION = 10000; // 10 seconds in milliseconds
const MAX_CHUNKS = 5;
export const BACKEND_URL = 'http://localhost:3001'; // Backend server URL
export const UPLOAD_PATH = '/uploads'; // Default upload path

/**
 * Media stream initialization and validation
 * Creates and validates audio recording capabilities
 * Used by startRecordingProcess thunk
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream} - MediaStream API
 */
const createAndValidateMediaStream = async (): Promise<{ stream: MediaStream; mediaRecorder: MediaRecorder }> => {
  // Request microphone access and create stream
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Validate stream
  if (!stream || !stream.active || stream.getAudioTracks().length === 0) {
    throw new Error('Failed to initialize audio stream');
  }

  // Ensure audio track is enabled
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack.enabled) {
    audioTrack.enabled = true;
  }

  // Create media recorder with specific options
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: getSupportedMimeType(),
    audioBitsPerSecond: 128000
  });

  return { stream, mediaRecorder };
};

/**
 * Async thunk for merging recorded audio chunks
 * Handles the chunk merging process and backend communication
 * Interacts with backend audioService.ts
 * @see {@link https://redux-toolkit.js.org/api/createAsyncThunk} - Redux Async Thunks
 */
export const mergeChunks = createAsyncThunk<void, void>(
  'audio/mergeChunks',
  async (_, { getState, dispatch }) => {
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    if (chunks.length === 0) {
      throw new Error('No chunks to merge');
    }

    dispatch(setProcessing(true));
    try {
      // Create a FormData with all chunks
      const formData = new FormData();
      chunks.forEach((chunk, index) => {
        formData.append(`chunk${index}`, chunk.blob);
      });

      const response = await fetch(`${BACKEND_URL}/audio/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to merge chunks');
      }

      const mergedBlob = await response.blob();
      dispatch(setMergedAudio(mergedBlob));
      toast.success('Audio chunks merged successfully!', {
        autoClose: 6000,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      dispatch(setError(errorMessage));
      toast.error(`Failed to merge chunks: ${errorMessage}`, {
        autoClose: 6000,
      });
    } finally {
      dispatch(setProcessing(false));
    }
  }
);

/**
 * Async thunk for handling audio chunk uploads
 * Manages the process of sending audio chunks to the backend
 * Related: services/audioService.ts, components/AudioRecorder.tsx
 * Async thunks in Redux handle side effects and asynchronous operations while managing loading states
 */
export const sendChunksToBackend = createAsyncThunk<void, void>(
  'audio/sendChunksToBackend',
  async (_, { getState, dispatch }) => {
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    if (chunks.length === 0) {
      throw new Error('No chunks to send');
    }

    dispatch(setSending(true));
    try {
      for (const chunk of chunks) {
        if (!chunk.sent) {
          const formData = new FormData();
          formData.append('audio', chunk.blob);
          formData.append('timestamp', chunk.timestamp.toString());
          formData.append('duration', chunk.duration.toString());
          
          const response = await fetch(`${BACKEND_URL}/api/audio/add`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            },
            body: formData,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('Server response:', errorData);
            throw new Error(errorData.error || `Failed to send chunk: ${response.status} ${response.statusText}`);
          }
          
          dispatch(markChunkAsSent(chunk.id));
        }
      }
      dispatch(clearSentChunks());
      toast.success('All chunks sent successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('Error sending chunks:', error);
      dispatch(setError(errorMessage));
      toast.error(`Failed to send chunks: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      dispatch(setSending(false));
    }
  }
);

/**
 * Async thunk for handling the entire recording process
 * Manages media stream initialization, recording, and chunk creation
 * Interacts with backend audioService.ts
 * @see {@link https://redux-toolkit.js.org/api/createAsyncThunk} - Redux Async Thunks
 */
export const startRecordingProcess = createAsyncThunk<void, void>(
  'audio/startRecordingProcess',
  async (_, { dispatch }) => {
    let mediaRecorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let startTime: number;
    let chunkCount = 0;

    try {
      // Initialize media stream and recorder
      const result = await createAndValidateMediaStream();
      stream = result.stream;
      mediaRecorder = result.mediaRecorder;

      // Store references in state
      dispatch(setMediaRecorder({ mediaRecorder, stream }));

      await new Promise<void>((resolve, reject) => {
        if (!mediaRecorder) return reject(new Error('No media recorder'));

        // Handle recording data
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            const timestamp = startTime + (chunkCount * CHUNK_DURATION);
            const dateStr = new Date(timestamp).toISOString().split('T')[0];
            const chunkId = Date.now().toString();
            
            const chunk: AudioChunk = {
              id: chunkId,
              blob: event.data,
              duration: CHUNK_DURATION,
              timestamp: timestamp,
              sent: false,
              fileName: `recording_${chunkCount + 1}_${dateStr}.webm`,
              filePath: `${UPLOAD_PATH}/recordings/${chunkId}.webm`
            };
            
            await dispatch(addChunk(chunk));
            chunkCount++;
            
            if (chunkCount < MAX_CHUNKS && mediaRecorder && stream) {
              // Start next chunk with validation
              if (stream.active && mediaRecorder.state !== 'recording') {
                startTime = Date.now();
                mediaRecorder.start();
                setTimeout(() => {
                  if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                  }
                }, CHUNK_DURATION);
              } else {
                dispatch(stopRecordingProcess());
                toast.warning('Recording stopped: Stream became inactive', {
                  position: 'top-right',
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
                reject(new Error('Stream became inactive'));
              }
            } else {
              // Clean up after max chunks
              dispatch(stopRecordingProcess());
              resolve();
            }
          }
        };

        // Handle errors
        mediaRecorder.onerror = (event) => {
          toast.error('Recording error: ' + event, {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          reject(new Error('MediaRecorder error: ' + event));
        };

        // Start first chunk with validation
        if (stream && stream.active) {
          startTime = Date.now();
          mediaRecorder.start();
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
            }
          }, CHUNK_DURATION);
        } else {
          toast.warning('Cannot start recording: Stream is not active', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          reject(new Error('Stream is not active'));
        }
      });
    } catch (error) {
      // Clean up on error
      if (stream) {
        stream.getTracks().forEach(track => {
          track.enabled = false;
          track.stop();
        });
      }
      const errorMessage = (error as Error).message;
      dispatch(setError(errorMessage));
      // Show error toast if it's not already shown
      if (!errorMessage.includes('Stream became inactive') && !errorMessage.includes('Stream is not active')) {
        toast.error(`Recording error: ${errorMessage}`, {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
      throw error;
    }
  }
);

/**
 * Async thunk for stopping recording and cleaning up
 * Manages media stream cleanup and state reset
 * Interacts with backend audioService.ts
 * @see {@link https://redux-toolkit.js.org/api/createAsyncThunk} - Redux Async Thunks
 */
export const stopRecordingProcess = createAsyncThunk<void, void>(
  'audio/stopRecordingProcess',
  async (_, { getState, dispatch }) => {
    const state = getState() as { audio: RecordingState };
    const { mediaRecorder, stream } = state.audio;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    // Clean up media stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    dispatch(cleanupRecording());
    dispatch(setRecordingFinished(true));
  }
);

/**
 * Initial state for audio recording
 * Defines the initial state for all audio recording properties
 * Used by audioSlice reducer
 * @see {@link https://redux-toolkit.js.org/api/createSlice} - Redux Toolkit Slice
 */
const initialState: RecordingState = {
  isRecording: false,
  currentChunkDuration: 0,
  chunks: [],
  mergedAudio: null,
  error: null,
  isProcessing: false,
  mediaRecorder: null,
  stream: null,
  recordingFinished: false,
  isSending: false
};

/**
 * Audio slice implementation
 * Defines state shape and reducers for audio operations
 * Related: store/index.ts, components/AudioRecorder.tsx
 * Redux slice reducers specify how the application's state changes in response to actions
 */
const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    setMediaRecorder: (state, action: PayloadAction<{ mediaRecorder: MediaRecorder | null, stream: MediaStream | null }>) => {
      state.mediaRecorder = action.payload.mediaRecorder;
      state.stream = action.payload.stream;
      state.isRecording = true;
      state.recordingFinished = false;
    },
    addChunk: (state, action: PayloadAction<AudioChunk>) => {
      if (state.chunks.length < MAX_CHUNKS) {
        state.chunks.push(action.payload);
      }
    },
    markChunkAsSent: (state, action: PayloadAction<string>) => {
      const chunk = state.chunks.find(c => c.id === action.payload);
      if (chunk) {
        chunk.sent = true;
      }
    },
    clearSentChunks: (state) => {
      state.chunks = state.chunks.filter(chunk => !chunk.sent);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isRecording = false;
    },
    setMergedAudio: (state, action: PayloadAction<Blob>) => {
      state.mergedAudio = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    setRecordingFinished: (state, action: PayloadAction<boolean>) => {
      state.recordingFinished = action.payload;
    },
    cleanupRecording: (state) => {
      state.isRecording = false;
      state.mediaRecorder = null;
      state.stream = null;
    },
    resetRecording: (state) => {
      state.chunks = [];
      state.mergedAudio = null;
      state.error = null;
      state.isProcessing = false;
      state.mediaRecorder = null;
      state.stream = null;
      state.isRecording = false;
      state.recordingFinished = false;
      state.isSending = false;
    }
  }
});

export const {
  setMediaRecorder,
  addChunk,
  markChunkAsSent,
  clearSentChunks,
  setError,
  setMergedAudio,
  setProcessing,
  setSending,
  setRecordingFinished,
  cleanupRecording,
  resetRecording
} = audioSlice.actions;

export default audioSlice.reducer;
