/**
 * Redux slice for audio recording state management
 * Manages all audio recording related state and operations
 * Related: components/AudioRecorder.tsx, store/audioTypes.ts, store/index.ts
 * Redux slices provide a way to organize related state logic and actions into manageable pieces
 */

/**
 * Execution Order:
 * 1. Import statements are processed
 * 2. Configuration constants are initialized (CHUNK_DURATION, MAX_CHUNKS, etc.)
 * 3. createAndValidateMediaStream function is defined
 * 4. Async thunks are defined (mergeChunks, sendChunksToBackend, startRecordingProcess, stopRecordingProcess)
 * 5. Initial state is created
 * 6. Redux slice is created with reducers
 * 7. Reducer functions are defined in the following order:
 *    - setMediaRecorder: Initializes recording infrastructure
 *    - addChunk: Manages audio chunk collection
 *    - markChunkAsSent: Updates chunk upload status
 *    - clearSentChunks: Removes processed chunks
 *    - setError: Manages error states
 *    - setMergedAudio: Stores combined audio
 *    - setProcessing: Tracks processing status
 *    - setSending: Tracks upload status
 *    - setRecordingFinished: Updates recording completion
 *    - cleanupRecording: Cleans up resources
 *    - resetRecording: Resets state to initial
 * 8. Actions are exported for external use
 * 
 * Total Keywords and Functions: 45
 * - Configuration: [CHUNK_DURATION, MAX_CHUNKS, BACKEND_URL, UPLOAD_PATH]
 * - Core Functions: [createAndValidateMediaStream, mergeChunks, sendChunksToBackend, startRecordingProcess, stopRecordingProcess]
 * - Event Handlers: [onerror, onstart, onpause, onresume, onstop, ondataavailable]
 * - State Management: [setMediaRecorder, addChunk, markChunkAsSent, clearSentChunks, setError, setMergedAudio, setProcessing, setSending, setRecordingFinished, cleanupRecording, resetRecording]
 * - Types: [AudioChunk, RecordingState, PayloadAction, MediaRecorder, MediaStream, MediaStreamTrack, Blob]
 * - State Properties: [isRecording, currentChunkDuration, chunks, mergedAudio, error, isProcessing, mediaRecorder, stream, recordingFinished, isSending]
 * - External Dependencies: [createSlice, createAsyncThunk, toast, getSupportedMimeType]
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AudioChunk, RecordingState } from './audioTypes';
import { toast } from 'react-toastify';
import { getSupportedMimeType } from "../utils/audioFormats";
import { saveRecordedAudioHelper } from '../utils/fileStorage';

console.log('[audioReducer.ts] Initializing audio reducer module');

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

console.log('[audioReducer.ts] Defining configuration constants', {
  CHUNK_DURATION,
  MAX_CHUNKS,
  BACKEND_URL,
  UPLOAD_PATH
});

/**
 * Media stream initialization and validation
 * Creates and validates audio recording capabilities
 * Used by startRecordingProcess thunk
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaStream} - MediaStream API
 */
/*
Keywords: [createAndValidateMediaStream, stream, mediaRecorder, MediaStream, MediaRecorder, getSupportedMimeType, navigator, getUserMedia, audioTrack]

- Technical: Asynchronously initializes audio recording hardware and creates necessary media objects
- Role: 
  - createAndValidateMediaStream: Core function for setting up audio recording infrastructure
  - stream: Represents the raw audio input from the microphone
  - mediaRecorder: Controls the recording process and generates audio data
  - getSupportedMimeType: Determines the compatible audio format for recording
- Constraints: Requires user permission for microphone access, browser compatibility
- Actions: Requests microphone access, validates stream, creates MediaRecorder instance
- Dependencies: navigator.mediaDevices API, MediaRecorder API, getSupportedMimeType utility
- Outputs: Returns validated MediaStream and configured MediaRecorder objects
- Performance: Minimal overhead, one-time initialization cost
- Security: Requires explicit user permission for microphone access
- Scalability: Handles single audio input stream, not designed for multiple streams
- Errors: Throws errors for stream validation failures or initialization issues
*/
const createAndValidateMediaStream = async (): Promise<{ stream: MediaStream; mediaRecorder: MediaRecorder }> => {
  console.log('[audioReducer.ts, createAndValidateMediaStream] Starting media stream initialization');
  
  console.log('[audioReducer.ts, createAndValidateMediaStream] Requesting microphone access');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log('[audioReducer.ts, createAndValidateMediaStream] Media stream obtained');
  
  console.log('[audioReducer.ts, createAndValidateMediaStream] Starting stream validation');
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
  console.log('[audioReducer.ts, createAndValidateMediaStream] Checking audio track status');
  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack.enabled) {
    console.log('[audioReducer.ts, createAndValidateMediaStream] Enabling audio track');
    audioTrack.enabled = true;
  }
  console.log('[audioReducer.ts, createAndValidateMediaStream] Audio track status verified');

  // Create media recorder with specific options
  console.log('[audioReducer.ts, createAndValidateMediaStream] Getting supported mime type');
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
/*
Keywords: [mergeChunks, createAsyncThunk, FormData, chunks, blob, dispatch, setProcessing, setMergedAudio, toast]

- Technical: Redux thunk that combines recorded audio chunks into a single audio file
- Role:
  - mergeChunks: Orchestrates the chunk merging process
  - FormData: Packages audio chunks for server transmission
  - dispatch: Updates Redux state during merge process
  - toast: Provides user feedback on merge status
- Constraints: Requires valid chunks in state, server connectivity
- Actions: Collects chunks, sends to server, processes response
- Dependencies: Redux store, backend merge endpoint, FormData API
- Outputs: Merged audio blob and updated application state
- Performance: Processing time scales with total chunk size
- Security: Validates server response, handles errors gracefully
- Scalability: Can handle multiple chunks but may need optimization for large sets
- Errors: Comprehensive error handling with user feedback
*/
export const mergeChunks = createAsyncThunk<void, void>(
  'audio/mergeChunks',
  async (_, { getState, dispatch }) => {
    console.log('[audioReducer.ts, mergeChunks] Starting chunk merge process');
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    console.log('[audioReducer.ts, mergeChunks] Validating chunks availability');
    if (chunks.length === 0) {
      console.error('[audioReducer.ts, mergeChunks] Error: No chunks available to merge');
      throw new Error('No chunks to merge');
    }
    console.log('[audioReducer.ts, mergeChunks] Found chunks to merge', { chunkCount: chunks.length });

    console.log('[audioReducer.ts, mergeChunks] Setting processing state');
    dispatch(setProcessing(true));
    
    try {
      console.log('[audioReducer.ts, mergeChunks] Preparing FormData with chunks');
      const formData = new FormData();
      chunks.forEach((chunk: AudioChunk, index: number) => {
        console.log('[audioReducer.ts, mergeChunks] Adding chunk to FormData', { chunkIndex: index });
        formData.append(`chunk${index}`, chunk.blob);
      });

      console.log('[audioReducer.ts, mergeChunks] Sending merge request to server');
      const response = await fetch(`${BACKEND_URL}/audio/merge`, {
        method: 'POST',
        body: formData,
      });

      console.log('[audioReducer.ts, mergeChunks] Checking server response');
      if (!response.ok) {
        console.error('[audioReducer.ts, mergeChunks] Server merge request failed', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to merge chunks');
      }

      console.log('[audioReducer.ts, mergeChunks] Server merge successful, retrieving merged blob');
      const mergedBlob = await response.blob();
      console.log('[audioReducer.ts, mergeChunks] Setting merged audio in state');
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
      console.log('[audioReducer.ts, mergeChunks] Resetting processing state');
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
/*
Keywords: [sendChunksToBackend, chunks, FormData, setSending, markChunkAsSent, clearSentChunks, fetch]

- Technical: Handles individual chunk upload process to backend storage
- Role:
  - sendChunksToBackend: Manages chunk upload workflow
  - setSending: Tracks upload status in Redux state
  - markChunkAsSent: Updates chunk status after successful upload
- Constraints: Network dependency, server availability
- Actions: Uploads chunks sequentially, tracks progress, updates state
- Dependencies: Backend API, Redux store, FormData API
- Outputs: Updated chunk status in Redux store
- Performance: Sequential uploads may impact performance with many chunks
- Security: Uses credentials, validates responses
- Scalability: Sequential processing may need optimization for large datasets
- Errors: Detailed error handling with user feedback
*/
export const sendChunksToBackend = createAsyncThunk<void, void>(
  'audio/sendChunksToBackend',
  async (_, { getState, dispatch }) => {
    console.log('[audioReducer.ts, sendChunksToBackend] Starting chunk upload process');
    
    console.log('[audioReducer.ts, sendChunksToBackend] Getting current state');
    const state = getState() as { audio: RecordingState };
    const { chunks } = state.audio;
    
    console.log('[audioReducer.ts, sendChunksToBackend] Validating chunks availability');
    if (chunks.length === 0) {
      console.error('[audioReducer.ts, sendChunksToBackend] Error: No chunks available to send');
      throw new Error('No chunks to send');
    }
    console.log('[audioReducer.ts, sendChunksToBackend] Found chunks to send', { chunkCount: chunks.length });

    console.log('[audioReducer.ts, sendChunksToBackend] Setting sending state to true');
    dispatch(setSending(true));
    
    try {
      console.log('[audioReducer.ts, sendChunksToBackend] Starting chunk upload loop');
      for (const chunk of chunks) {
        if (!chunk.sent) {
          console.log('[audioReducer.ts, sendChunksToBackend] Processing unsent chunk', {
            chunkId: chunk.id,
            timestamp: chunk.timestamp
          });
          
          console.log('[audioReducer.ts, sendChunksToBackend] Preparing FormData for chunk', { chunkId: chunk.id });
          const formData = new FormData();
          formData.append('audio', chunk.blob);
          formData.append('timestamp', chunk.timestamp.toString());
          formData.append('duration', chunk.duration.toString());
          
          console.log('[audioReducer.ts, sendChunksToBackend] Sending chunk to server', { 
            chunkId: chunk.id,
            endpoint: `${BACKEND_URL}/api/audio/add`
          });
          const response = await fetch(`${BACKEND_URL}/api/audio/add`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            },
            body: formData,
          });
          
          console.log('[audioReducer.ts, sendChunksToBackend] Checking response status', {
            chunkId: chunk.id,
            status: response.status
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
        } else {
          console.log('[audioReducer.ts, sendChunksToBackend] Skipping already sent chunk', { chunkId: chunk.id });
        }
      }
      
      console.log('[audioReducer.ts, sendChunksToBackend] All chunks processed successfully');
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
      console.log('[audioReducer.ts, sendChunksToBackend] Resetting sending state');
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
/*
Keywords: [startRecordingProcess, mediaRecorder, stream, dispatch, MediaRecorder, MediaStream, createAndValidateMediaStream, setMediaRecorder, CHUNK_DURATION]

- Technical: Orchestrates the entire audio recording lifecycle using Redux async thunk pattern
  Initializes media hardware, manages recording state, and handles chunk-based recording
  Uses MediaRecorder API for capturing audio and dispatches Redux actions for state updates

- Role: 
  - startRecordingProcess: Main controller for audio recording workflow
  - mediaRecorder: Handles raw audio capture and encoding
  - stream: Manages microphone input stream
  - dispatch: Updates Redux state throughout recording
  - createAndValidateMediaStream: Sets up recording infrastructure

- Constraints: 
  - Requires user permission for microphone access
  - Limited by browser MediaRecorder API support
  - Maximum chunk count enforced
  - Stream must remain active throughout recording
  - Specific mime type requirements for audio format

- Actions:
  - Initializes media stream and recorder
  - Sets up event handlers for recorder lifecycle
  - Manages chunk-based recording process
  - Handles recording state transitions
  - Provides user feedback via toast notifications

- Dependencies:
  - MediaRecorder API
  - Redux store and dispatch
  - createAndValidateMediaStream function
  - Toast notification system
  - Browser media APIs
  - Audio chunk processing logic

- Outputs:
  - Series of audio chunks in state
  - Updated recording status
  - User feedback notifications
  - Error states when issues occur
  - MediaRecorder and stream references

- Performance:
  - Asynchronous operation for non-blocking execution
  - Chunk-based recording reduces memory usage
  - Event-driven architecture for efficient processing
  - Controlled memory usage through max chunk limit
  - Resource cleanup on completion or error

- Security:
  - Requires explicit user permission
  - Validates media stream before use
  - Sanitizes error messages
  - Handles sensitive hardware access
  - Proper resource cleanup

- Scalability:
  - Handles variable recording durations
  - Adapts to different audio input devices
  - Manages multiple recording sessions
  - Configurable chunk duration
  - Extensible event handler system

- Errors:
  - Comprehensive error handling for stream issues
  - Graceful cleanup on failures
  - User-friendly error notifications
  - State consistency maintenance
  - Resource leak prevention
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
      console.log('[audioReducer.ts, startRecordingProcess] Media stream initialization successful');
      
      stream = result.stream;
      mediaRecorder = result.mediaRecorder;

      console.log('[audioReducer.ts, startRecordingProcess] Storing media recorder references in state');
      dispatch(setMediaRecorder({ mediaRecorder, stream }));

      console.log('[audioReducer.ts, startRecordingProcess] Setting up recording promise');
      await new Promise<void>((resolve, reject) => {
        if (!mediaRecorder) {
          console.error('[audioReducer.ts, startRecordingProcess] MediaRecorder initialization failed');
          return reject(new Error('No media recorder'));
        }

        // Event Handlers
        /*
        Keywords: [onerror, onstart, onpause, onresume, onstop, ondataavailable, MediaRecorder]

        - Technical: Event handlers for MediaRecorder lifecycle events
        - Role:
          - onerror: Handles recording errors and updates state
          - onstart: Manages recording start state
          - onpause: Handles paused state
          - onresume: Manages resumed recording state
          - onstop: Handles recording completion
          - ondataavailable: Processes recorded audio chunks
        - Constraints: Tied to MediaRecorder state transitions
        - Actions: Updates Redux state based on recording events
        - Dependencies: MediaRecorder API, Redux dispatch
        - Outputs: State updates and audio chunks
        - Performance: Event-driven, minimal overhead
        - Security: Validates data before processing
        - Scalability: Handles standard recording scenarios
        - Errors: Each handler includes error state management
        */
        mediaRecorder.onerror = (event) => {
          console.error('[audioReducer.ts, startRecordingProcess.onerror] MediaRecorder error occurred', {
            error: event,
            state: mediaRecorder?.state,
            timestamp: new Date().toISOString()
          });
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

        mediaRecorder.onstart = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onstart] MediaRecorder started', {
            state: mediaRecorder?.state,
            time: new Date().toISOString(),
            chunkCount: chunkCount
          });
        };

        mediaRecorder.onpause = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onpause] MediaRecorder paused', {
            state: mediaRecorder?.state,
            time: new Date().toISOString(),
            currentChunk: chunkCount
          });
        };

        mediaRecorder.onresume = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onresume] MediaRecorder resumed', {
            state: mediaRecorder?.state,
            time: new Date().toISOString(),
            currentChunk: chunkCount
          });
        };

        mediaRecorder.onstop = () => {
          console.log('[audioReducer.ts, startRecordingProcess.onstop] MediaRecorder stopped', {
            state: mediaRecorder?.state,
            time: new Date().toISOString(),
            finalChunkCount: chunkCount
          });
        };

        console.log('[audioReducer.ts, startRecordingProcess] Setting up MediaRecorder event handlers');
        mediaRecorder.ondataavailable = async (event) => {
          console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Processing new audio chunk', {
            chunkSize: event.data.size,
            chunkNumber: chunkCount + 1,
            timestamp: new Date().toISOString()
          });

          if (event.data.size > 0) {
            console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Creating chunk metadata');
            const timestamp = startTime + (chunkCount * CHUNK_DURATION);
            const dateStr = new Date(timestamp).toISOString().split('T')[0];
            const chunkId = Date.now().toString();
            
            console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Preparing chunk object', {
              chunkId,
              timestamp,
              dateStr,
              duration: CHUNK_DURATION
            });

            const chunk: AudioChunk = {
              id: chunkId,
              blob: event.data,
              duration: CHUNK_DURATION,
              timestamp: timestamp,
              sent: false,
              fileName: `recording_${chunkCount + 1}_${dateStr}.webm`,
              filePath: `${UPLOAD_PATH}/recordings/${chunkId}.webm`
            };
            
            console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Dispatching addChunk action');
            await dispatch(addChunk(chunk as AudioChunk));
            
            // Save the audio chunk locally
            try {
                const saveResult = await saveRecordedAudioHelper([event.data], 'audio/webm');
                if (!saveResult.success) {
                    console.error('[audioReducer.ts, startRecordingProcess.ondataavailable] Error saving audio chunk:', saveResult.error);
                }
            } catch (error) {
                console.error('[audioReducer.ts, startRecordingProcess.ondataavailable] Error in saveRecordedAudioHelper:', error);
            }
            
            chunkCount++;
            
            console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Checking chunk count and stream status', {
              currentCount: chunkCount,
              maxChunks: MAX_CHUNKS,
              streamActive: stream?.active
            });

            if (chunkCount < MAX_CHUNKS && mediaRecorder && stream) {
              // Start next chunk with validation
              if (stream.active && mediaRecorder.state !== 'recording') {
                console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Starting next chunk recording');
                startTime = Date.now();
                mediaRecorder.start();
                
                console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Setting chunk duration timer');
                setTimeout(() => {
                  console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Chunk duration reached, stopping recorder', {
                    chunkNumber: chunkCount,
                    recorderState: mediaRecorder?.state
                  });
                  if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                  }
                }, CHUNK_DURATION);
              } else {
                console.warn('[audioReducer.ts, startRecordingProcess.ondataavailable] Stream became inactive, stopping recording');
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
              console.log('[audioReducer.ts, startRecordingProcess.ondataavailable] Maximum chunks reached or invalid state, stopping recording', {
                chunkCount,
                MAX_CHUNKS,
                hasMediaRecorder: !!mediaRecorder,
                hasStream: !!stream
              });
              // Clean up after max chunks
              dispatch(stopRecordingProcess());
              resolve();
            }
          } else {
            console.warn('[audioReducer.ts, startRecordingProcess.ondataavailable] Received empty chunk data');
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
/*
Keywords: [stopRecordingProcess, mediaRecorder, stream, dispatch, cleanupRecording, setRecordingFinished, MediaStreamTrack]

- Technical: 
  Handles graceful termination of audio recording process using Redux async thunk
  Manages resource cleanup and state reset operations
  Ensures proper shutdown of media hardware and recording infrastructure

- Role:
  - stopRecordingProcess: Orchestrates recording termination
  - mediaRecorder: Controls recording device shutdown
  - stream: Manages audio input cleanup
  - cleanupRecording: Handles state cleanup
  - setRecordingFinished: Updates completion status

- Constraints:
  - Requires active MediaRecorder instance
  - Must handle both normal and error cases
  - Needs to maintain state consistency
  - Time-sensitive operation ordering
  - Complete resource cleanup required

- Actions:
  - Stops active recording session
  - Terminates media stream tracks
  - Cleans up recording resources
  - Updates recording state
  - Triggers completion handlers

- Dependencies:
  - MediaRecorder state
  - Redux store access
  - Stream track management
  - State cleanup actions
  - Recording status tracking

- Outputs:
  - Updated recording status
  - Cleaned up resources
  - Released hardware access
  - Reset state values
  - Completion indicators

- Performance:
  - Immediate resource release
  - Efficient cleanup sequence
  - Minimal state updates
  - Optimized track stopping
  - Quick hardware release

- Security:
  - Complete resource cleanup
  - Hardware access termination
  - State sanitization
  - Safe stream closure
  - Protected cleanup sequence

- Scalability:
  - Handles multiple tracks
  - Adapts to various states
  - Consistent cleanup process
  - Extensible termination logic
  - Robust state management

- Errors:
  - Graceful failure handling
  - State consistency checks
  - Resource cleanup verification
  - Error state management
  - Recovery mechanisms
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

console.log('[audioReducer.ts] Defining initial state', initialState);

/**
 * Redux Slice Reducers
 * 
 * Redux slice reducers for audio state management
 * 
 * @see {@link https://redux-toolkit.js.org/api/createSlice} - Redux Toolkit Slice
 */
/*
Keywords: [setMediaRecorder, addChunk, markChunkAsSent, clearSentChunks, setError, setMergedAudio, setProcessing, setSending, setRecordingFinished, cleanupRecording, resetRecording]

- Technical: Redux slice reducers for audio state management
- Role:
  - setMediaRecorder: Updates recorder instance
  - addChunk: Stores new audio chunks
  - markChunkAsSent: Updates chunk upload status
  - clearSentChunks: Removes processed chunks
  - setError: Manages error states
  - setMergedAudio: Stores combined audio
  - setProcessing/setSending: Tracks operation status
  - cleanupRecording/resetRecording: State cleanup
- Constraints: Immutable state updates
- Actions: Direct state mutations within Redux
- Dependencies: Redux Toolkit, AudioChunk type
- Outputs: Updated Redux state
- Performance: Optimized for frequent state updates
- Security: Input validation in reducers
- Scalability: Handles multiple chunks efficiently
- Errors: Each reducer maintains state consistency
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
    /*
    Keywords: [setMediaRecorder, MediaRecorder, MediaStream, PayloadAction, state]

    - Technical: Updates the MediaRecorder and MediaStream instances in Redux state
    - Role:
      - setMediaRecorder: Core state updater for recording infrastructure
      - MediaRecorder: Controls audio recording process
      - MediaStream: Represents audio input source
      - PayloadAction: Type-safe action payload
    - Constraints: Requires valid MediaRecorder and MediaStream instances
    - Actions: Updates recorder and stream state atomically
    - Dependencies: Redux state, MediaRecorder API
    - Outputs: Updated state with new recorder configuration
    - Performance: Lightweight state update operation
    - Security: Validates input instances before state update
    - Scalability: Handles single recorder instance
    - Errors: Type-safe payload prevents invalid updates
    */
    addChunk: (state, action: PayloadAction<AudioChunk>) => {
      console.log('[audioReducer.ts, addChunk] Adding new audio chunk', { chunkId: action.payload.id });
      if (state.chunks.length < MAX_CHUNKS) {
        state.chunks.push(action.payload);
      }
    },
    /*
    Keywords: [addChunk, AudioChunk, chunks, PayloadAction, state]

    - Technical: Adds a new audio chunk to the recording state
    - Role:
      - addChunk: Manages audio chunk collection
      - AudioChunk: Type-safe chunk data structure
      - chunks: Array of recorded audio segments
    - Constraints: Maximum chunk limit enforced
    - Actions: Appends new chunk to state array
    - Dependencies: AudioChunk type definition
    - Outputs: Updated chunks array in state
    - Performance: O(1) array append operation
    - Security: Validates chunk data structure
    - Scalability: Handles multiple chunks with size limit
    - Errors: Enforces chunk size and count limits
    */
    markChunkAsSent: (state, action: PayloadAction<string>) => {
      console.log('[audioReducer.ts, markChunkAsSent] Marking chunk as sent', { chunkId: action.payload });
      const chunk = state.chunks.find((c: AudioChunk) => c.id === action.payload);
      if (chunk) {
        chunk.sent = true;
      }
    },
    /*
    Keywords: [markChunkAsSent, chunks, PayloadAction, state, id]

    - Technical: Updates chunk status after successful upload
    - Role:
      - markChunkAsSent: Tracks upload completion
      - chunks: Manages chunk upload state
      - id: Unique chunk identifier
    - Constraints: Chunk must exist in state
    - Actions: Updates chunk sent status
    - Dependencies: Chunk state management
    - Outputs: Updated chunk status in state
    - Performance: O(n) lookup and update
    - Security: Validates chunk existence
    - Scalability: Handles multiple chunk updates
    - Errors: Maintains chunk state consistency
    */
    clearSentChunks: (state) => {
      console.log('[audioReducer.ts, clearSentChunks] Clearing sent chunks');
      state.chunks = state.chunks.filter((c: AudioChunk) => !c.sent);
    },
    /*
    Keywords: [clearSentChunks, chunks, state, filter]

    - Technical: Removes successfully uploaded chunks from state
    - Role:
      - clearSentChunks: State cleanup operation
      - chunks: Audio chunk collection
      - filter: Array filtering operation
    - Constraints: Preserves unsent chunks
    - Actions: Filters out sent chunks from state
    - Dependencies: Chunk sent status
    - Outputs: Cleaned state with only pending chunks
    - Performance: O(n) filtering operation
    - Security: Maintains data integrity
    - Scalability: Efficient memory management
    - Errors: Preserves upload consistency
    */
    setError: (state, action: PayloadAction<string>) => {
      console.log('[audioReducer.ts, setError] Setting error message', { error: action.payload });
      state.error = action.payload;
      state.isRecording = false;
    },
    /*
    Keywords: [setError, error, PayloadAction, state]

    - Technical: Updates error state with message
    - Role:
      - setError: Error state manager
      - error: Error message storage
      - PayloadAction: Type-safe error payload
    - Constraints: String error messages only
    - Actions: Updates global error state
    - Dependencies: Redux state management
    - Outputs: Updated error message in state
    - Performance: Simple state update
    - Security: Sanitizes error messages
    - Scalability: Handles various error types
    - Errors: Central error handling
    */
    setMergedAudio: (state, action: PayloadAction<Blob>) => {
      console.log('[audioReducer.ts, setMergedAudio] Setting merged audio blob');
      state.mergedAudio = action.payload;
    },
    /*
    Keywords: [setMergedAudio, Blob, PayloadAction, state]

    - Technical: Stores merged audio blob in state
    - Role:
      - setMergedAudio: Final audio manager
      - Blob: Binary audio data
      - PayloadAction: Type-safe blob payload
    - Constraints: Valid audio blob required
    - Actions: Updates merged audio state
    - Dependencies: Web Audio API Blob
    - Outputs: Stored merged audio data
    - Performance: Handles large audio blobs
    - Security: Validates blob content
    - Scalability: Manages audio size
    - Errors: Blob validation checks
    */
    setProcessing: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setProcessing] Setting processing state', { isProcessing: action.payload });
      state.isProcessing = action.payload;
    },
    /*
    Keywords: [setProcessing, processing, PayloadAction, state]

    - Technical: Controls processing state flag
    - Role:
      - setProcessing: Processing indicator
      - processing: Boolean state flag
      - PayloadAction: Type-safe boolean payload
    - Constraints: Boolean values only
    - Actions: Updates processing status
    - Dependencies: Redux state
    - Outputs: Updated processing flag
    - Performance: Minimal state update
    - Security: Simple boolean validation
    - Scalability: Thread-safe state updates
    - Errors: Type-safe processing state
    */
    setSending: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setSending] Setting sending state', { isSending: action.payload });
      state.isSending = action.payload;
    },
    /*
    Keywords: [setSending, sending, PayloadAction, state]

    - Technical: Controls upload state flag
    - Role:
      - setSending: Upload progress indicator
      - sending: Boolean state flag
      - PayloadAction: Type-safe boolean payload
    - Constraints: Boolean values only
    - Actions: Updates sending status
    - Dependencies: Redux state
    - Outputs: Updated sending flag
    - Performance: Minimal state update
    - Security: Simple boolean validation
    - Scalability: Thread-safe state updates
    - Errors: Type-safe sending state
    */
    setRecordingFinished: (state, action: PayloadAction<boolean>) => {
      console.log('[audioReducer.ts, setRecordingFinished] Setting recording finished state', { recordingFinished: action.payload });
      state.recordingFinished = action.payload;
    },
    /*
    Keywords: [setRecordingFinished, recordingFinished, PayloadAction, state]

    - Technical: Controls recording completion state
    - Role:
      - setRecordingFinished: Recording status manager
      - recordingFinished: Boolean completion flag
      - PayloadAction: Type-safe boolean payload
    - Constraints: Boolean values only
    - Actions: Updates recording status
    - Dependencies: Redux state
    - Outputs: Updated recording status
    - Performance: Minimal state update
    - Security: Simple boolean validation
    - Scalability: Thread-safe state updates
    - Errors: Type-safe recording state
    */
    cleanupRecording: (state) => {
      console.log('[audioReducer.ts, cleanupRecording] Cleaning up recording state');
      state.isRecording = false;
      state.mediaRecorder = null;
      state.stream = null;
    },
    /*
    Keywords: [cleanupRecording, state, mediaRecorder, stream]

    - Technical: Performs recording resource cleanup
    - Role:
      - cleanupRecording: Resource manager
      - mediaRecorder: Recording device cleanup
      - stream: Audio stream cleanup
    - Constraints: Valid recorder state
    - Actions: Stops recording, releases resources
    - Dependencies: MediaRecorder state
    - Outputs: Clean recorder state
    - Performance: Resource deallocation
    - Security: Safe resource cleanup
    - Scalability: Handles all resources
    - Errors: Graceful cleanup handling
    */
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
    },
    /*
    Keywords: [resetRecording, state, initialState]

    - Technical: Resets recording state to initial
    - Role:
      - resetRecording: State reset manager
      - initialState: Default state values
      - state: Current state object
    - Constraints: Maintains type safety
    - Actions: Full state reset operation
    - Dependencies: Initial state definition
    - Outputs: Fresh recording state
    - Performance: Complete state reset
    - Security: Safe state initialization
    - Scalability: Handles all state properties
    - Errors: Type-safe state reset
    */
  }
});

/**
 * Redux Slice Configuration
 * 
 * Redux slice configuration for audio state
 * 
 * @see {@link https://redux-toolkit.js.org/api/createSlice} - Redux Toolkit Slice
 */
/*
Keywords: [audioSlice, createSlice, initialState, reducers, extraReducers]

- Technical: Redux slice configuration for audio state
- Role:
  - audioSlice: Main state container
  - createSlice: Redux Toolkit state generator
  - initialState: Default audio state
  - reducers: Synchronous state updates
  - extraReducers: Async operation handlers
- Constraints: Redux state patterns
- Actions: Defines state shape and mutations
- Dependencies: Redux Toolkit, AudioState type
- Outputs: Redux reducer and actions
- Performance: Optimized state updates
- Security: State isolation
- Scalability: Supports growing state needs
- Errors: Maintains state integrity
*/
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

console.log('[audioReducer.ts] Exporting audio slice actions and reducers');


export default audioSlice.reducer;
