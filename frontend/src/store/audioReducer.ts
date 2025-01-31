/**
 * Redux slice for audio recording state management
 * Manages all audio recording related state and operations
 * Related: components/AudioRecorder.tsx, store/audioTypes.ts, store/index.ts
 * Redux slices provide a way to organize related state logic and actions into manageable pieces
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AudioChunk, RecordingState } from './audioTypes';
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
  console.log('[audioReducer.ts, createAndValidateMediaStream] Initiating media stream creation');
  // Request microphone access and create stream
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log('[audioReducer.ts, createAndValidateMediaStream] Media stream obtained');
  
  // Validate stream
  if (!stream || !stream.active || stream.getAudioTracks().length === 0) {
    console.error('[audioReducer.ts, createAndValidateMediaStream] Stream validation failed', {
      streamExists: !!stream,
      isActive: stream?.active,
      audioTracks: stream?.getAudioTracks().length
    });
    throw new Error('Failed to initialize audio stream');
  }
  console.log('[audioReducer.ts, createAndValidateMediaStream] Stream validation successful');

  // Ensure audio track is enabled
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack.enabled) {
    console.log('[audioReducer.ts, createAndValidateMediaStream] Enabling audio track');
    audioTrack.enabled = true;
  }

  // Create media recorder with specific options
  const mimeType = getSupportedMimeType();
  console.log('[audioReducer.ts, createAndValidateMediaStream] Creating MediaRecorder', { mimeType });
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    audioBitsPerSecond: 128000
  });
  console.log('[audioReducer.ts, createAndValidateMediaStream] MediaRecorder created successfully');

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
    console.log('[audioReducer.ts, mergeChunks] Starting chunk merge process');
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    if (chunks.length === 0) {
      console.error('[audioReducer.ts, mergeChunks] Error: No chunks available to merge');
      throw new Error('No chunks to merge');
    }
    console.log('[audioReducer.ts, mergeChunks] Found chunks to merge', { chunkCount: chunks.length });

    dispatch(setProcessing(true));
    try {
      console.log('[audioReducer.ts, mergeChunks] Preparing FormData with chunks');
      const formData = new FormData();
      chunks.forEach((chunk: AudioChunk, index: number) => {
        formData.append(`chunk${index}`, chunk.blob);
      });

      console.log('[audioReducer.ts, mergeChunks] Sending merge request to server');
      const response = await fetch(`${BACKEND_URL}/audio/merge`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('[audioReducer.ts, mergeChunks] Server merge request failed', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to merge chunks');
      }

      console.log('[audioReducer.ts, mergeChunks] Server merge successful, retrieving merged blob');
      const mergedBlob = await response.blob();
      dispatch(setMergedAudio(mergedBlob));
      console.log('[audioReducer.ts, mergeChunks] Merge process completed successfully');
      toast.success('Audio chunks merged successfully!', {
        autoClose: 6000,
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('[audioReducer.ts, mergeChunks] Error during merge process', {
        error: errorMessage,
        stack: (error as Error).stack
      });
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
    console.log('[audioReducer.ts, sendChunksToBackend] Starting chunk upload process');
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    if (chunks.length === 0) {
      console.error('[audioReducer.ts, sendChunksToBackend] Error: No chunks available to send');
      throw new Error('No chunks to send');
    }
    console.log('[audioReducer.ts, sendChunksToBackend] Found chunks to send', { chunkCount: chunks.length });

    dispatch(setSending(true));
    try {
      for (const chunk of chunks) {
        if (!chunk.sent) {
          console.log('[audioReducer.ts, sendChunksToBackend] Preparing chunk for upload', {
            chunkId: chunk.id,
            timestamp: chunk.timestamp
          });
          
          const formData = new FormData();
          formData.append('audio', chunk.blob);
          formData.append('timestamp', chunk.timestamp.toString());
          formData.append('duration', chunk.duration.toString());
          
          console.log('[audioReducer.ts, sendChunksToBackend] Sending chunk to server', { chunkId: chunk.id });
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
            console.error('[audioReducer.ts, sendChunksToBackend] Server upload failed', {
              chunkId: chunk.id,
              status: response.status,
              statusText: response.statusText,
              errorData
            });
            throw new Error(errorData.error || `Failed to send chunk: ${response.status} ${response.statusText}`);
          }
          
          console.log('[audioReducer.ts, sendChunksToBackend] Chunk uploaded successfully', { chunkId: chunk.id });
          dispatch(markChunkAsSent(chunk.id));
        }
      }
      console.log('[audioReducer.ts, sendChunksToBackend] All chunks sent successfully');
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
      console.error('[audioReducer.ts, sendChunksToBackend] Error during upload process', {
        error: errorMessage,
        stack: (error as Error).stack
      });
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
    console.log('[audioReducer.ts, startRecordingProcess] Initiating recording process');
    let mediaRecorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let startTime: number;
    let chunkCount = 0;

    try {
      console.log('[audioReducer.ts, startRecordingProcess] Initializing media stream and recorder');
      const result = await createAndValidateMediaStream();
      stream = result.stream;
      mediaRecorder = result.mediaRecorder;

      console.log('[audioReducer.ts, startRecordingProcess] Storing media recorder references');
      dispatch(setMediaRecorder({ mediaRecorder, stream }));

      await new Promise<void>((resolve, reject) => {
        if (!mediaRecorder) {
          console.error('[audioReducer.ts, startRecordingProcess] MediaRecorder initialization failed');
          return reject(new Error('No media recorder'));
        }

        // Add error handler logging
        mediaRecorder.onerror = (event) => {
          console.error('[audioReducer.ts, startRecordingProcess.onerror] MediaRecorder error occurred', {
            error: event,
            state: mediaRecorder?.state
          });
        };

        // Add state change logging
        mediaRecorder.onstart = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onstart] MediaRecorder started', {
            state: mediaRecorder?.state,
            time: new Date().toISOString()
          });
        };

        mediaRecorder.onpause = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onpause] MediaRecorder paused', {
            state: mediaRecorder?.state,
            time: new Date().toISOString()
          });
        };

        mediaRecorder.onresume = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onresume] MediaRecorder resumed', {
            state: mediaRecorder?.state,
            time: new Date().toISOString()
          });
        };

        mediaRecorder.onstop = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onstop] MediaRecorder stopped', {
            state: mediaRecorder?.state,
            time: new Date().toISOString()
          });
        };

        console.log('[audioReducer.ts, startRecordingProcess] Setting up MediaRecorder event handlers');
        mediaRecorder.ondataavailable = async (event) => {
          console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Processing new audio chunk', {
            chunkSize: event.data.size,
            chunkNumber: chunkCount + 1
          });
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
            
            await dispatch(addChunk(chunk as AudioChunk));
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
        stream.getTracks().forEach((track: MediaStreamTrack) => {
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
    console.log('[audioReducer.ts, stopRecordingProcess] Stopping recording process');
    const state = getState() as { audio: RecordingState };
    const { mediaRecorder, stream } = state.audio;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('[audioReducer.ts, stopRecordingProcess] Stopping MediaRecorder');
      mediaRecorder.stop();
    }

    // Clean up media stream
    if (stream) {
      console.log('[audioReducer.ts, stopRecordingProcess] Stopping media stream');
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
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
      console.log('[audioReducer.ts, setMediaRecorder] Setting media recorder references');
      state.mediaRecorder = action.payload.mediaRecorder;
      state.stream = action.payload.stream;
      state.isRecording = true;
      state.recordingFinished = false;
    },
    addChunk: (state, action: PayloadAction<AudioChunk>) => {
      console.log('[audioReducer.ts, addChunk] Adding new audio chunk', { chunkId: action.payload.id });
      if (state.chunks.length < MAX_CHUNKS) {
        state.chunks.push(action.payload);
      }
    },
    markChunkAsSent: (state, action: PayloadAction<string>) => {
      console.log('[audioReducer.ts, markChunkAsSent] Marking chunk as sent', { chunkId: action.payload });
      const chunk = state.chunks.find((c: AudioChunk) => c.id === action.payload);
      if (chunk) {
        chunk.sent = true;
      }
    },
    clearSentChunks: (state) => {
      console.log('[audioReducer.ts, clearSentChunks] Clearing sent chunks');
      state.chunks = state.chunks.filter((c: AudioChunk) => !c.sent);
    },
    setError: (state, action: PayloadAction<string>) => {
      console.log('[audioReducer.ts, setError] Setting error message', { error: action.payload });
      state.error = action.payload;
      state.isRecording = false;
    },
    setMergedAudio: (state, action: PayloadAction<Blob>) => {
      console.log('[audioReducer.ts, setMergedAudio] Setting merged audio blob');
      state.mergedAudio = action.payload;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setProcessing] Setting processing state', { isProcessing: action.payload });
      state.isProcessing = action.payload;
    },
    setSending: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setSending] Setting sending state', { isSending: action.payload });
      state.isSending = action.payload;
    },
    setRecordingFinished: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setRecordingFinished] Setting recording finished state', { recordingFinished: action.payload });
      state.recordingFinished = action.payload;
    },
    cleanupRecording: (state) => {
      console.log('[audioReducer.ts, cleanupRecording] Cleaning up recording state');
      state.isRecording = false;
      state.mediaRecorder = null;
      state.stream = null;
    },
    resetRecording: (state) => {
      console.log('[audioReducer.ts, resetRecording] Resetting recording state');
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
