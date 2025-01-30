/**
 * Audio recording component with chunk-based processing
 * Core component managing all audio recording and processing UI interactions
 * Related: store/audioReducer.ts, utils/fileStorage.ts, backend/services/audioService.ts
 * React components are the building blocks of React applications
 * Syntax:
 *   - MediaRecorder init: `new MediaRecorder(stream, { mimeType: 'audio/webm' })`
 *   - Blob creation: `new Blob(chunks, { type: 'audio/webm' })`
 *   - AudioContext time: `audioContext.currentTime.toFixed(3)`
 */

// Keywords: [React, useState, useDispatch, useSelector, RootState, AudioChunk, startRecordingProcess, stopRecordingProcess, sendChunksToBackend, mergeChunks, AppDispatch]
/*
- Technical mechanics: React functional component using hooks for state management and Redux for global state. Uses Material-UI for UI components and Framer Motion for animations.

- Role in the broader system:
  - `React`: Core library for building the UI components
  - `useState`: Local state management for dialog control
  - `useDispatch`: Redux hook to dispatch actions to the store
  - `useSelector`: Redux hook to access global state
  - `RootState`: TypeScript type defining the shape of the Redux store
  - `AudioChunk`: Interface defining the structure of audio chunks
  - `startRecordingProcess`: Redux action to initiate recording
  - `stopRecordingProcess`: Redux action to stop recording
  - `sendChunksToBackend`: Redux action to send audio to server
  - `mergeChunks`: Redux action to combine audio chunks
  - `AppDispatch`: TypeScript type for Redux dispatch function

- Edge cases or constraints: 
  - Browser compatibility for MediaRecorder API
  - Memory limitations for large audio files
  - Network connectivity for backend operations

- Immediate action performed: 
  - Sets up the audio recording component
  - Initializes Redux state connections
  - Creates UI elements for recording controls

- Dependencies/inputs:
  - Redux store configuration
  - Material-UI components
  - Browser's MediaRecorder API
  - Backend API endpoints

- Outputs/state changes:
  - Updates Redux store with recording state
  - Manages audio chunks in memory
  - Controls UI state for recording process

- Performance considerations:
  - Memory usage for storing audio chunks
  - UI responsiveness during recording
  - Efficient state updates to prevent re-renders

- Security concerns:
  - Audio data handling and storage
  - Backend API communication security
  - User permission management for microphone access

- Scalability:
  - Handles multiple audio chunks
  - Manages large audio files
  - Supports concurrent recording sessions

- Error handling:
  - MediaRecorder API errors
  - Network request failures
  - Permission denial handling
*/

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Button, CircularProgress, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, Link, LinearProgress } from '@mui/material';
import { Mic, Square, Play, Merge, Send, RefreshCw, Download } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { 
  startRecordingProcess, 
  stopRecordingProcess, 
  sendChunksToBackend,
  mergeChunks
} from '../store/audioReducer';
import { AppDispatch } from '../store';
import config from '../config/config';
import { AudioChunk } from '../types/audio';

/**
 * Main AudioRecorder component implementation
 * Provides user interface for recording, merging, and managing audio chunks
 * Related: store/audioReducer.ts, components/Navigation.tsx
 * Functional components in React use hooks to manage state and side effects
 * Syntax:
 *   - getUserMedia: `navigator.mediaDevices.getUserMedia({ audio: true })`
 *   - MediaRecorder events: `mediaRecorder.ondataavailable = (e) => chunks.push(e.data)`
 */

// Keywords: [React, useState, useDispatch, useSelector, RootState, Material-UI components, Lucide icons, ToastContainer, motion, Redux actions, AppDispatch, config, AudioChunk]

/*
- Technical mechanics: Imports necessary React hooks, Redux utilities, UI components, and custom types for building the audio recorder interface.

- Role in the broader system:
  - React/useState: Core framework and state management hook for component-level state
  - useDispatch/useSelector: Redux hooks for state management and action dispatching
  - RootState: TypeScript type for the global Redux state
  - Material-UI components: Provide the UI building blocks for the recorder interface
  - Lucide icons: Supply visual icons for recorder controls
  - ToastContainer: Handles notification display
  - motion: Enables animations for better UX
  - Redux actions: Handle audio recording state changes
  - AppDispatch: TypeScript type for Redux dispatch
  - config: Application configuration
  - AudioChunk: Type definition for audio data chunks

- Edge cases or constraints: 
  - Material-UI theme customization limitations
  - Redux state synchronization delays
  - Browser compatibility for audio APIs

- Immediate action performed:
  - Makes dependencies available for use in the component

- Dependencies/inputs:
  - React and Redux core libraries
  - Material-UI component library
  - Various utility libraries for icons and animations

- Outputs/state changes:
  - No direct state changes, only imports

- Performance considerations:
  - Bundle size impact from multiple UI libraries
  - Potential tree-shaking optimization needs

- Security concerns:
  - Third-party package vulnerabilities
  - Need to validate imported configurations

- Scalability:
  - Component library supports large-scale applications
  - Redux patterns scale well with increasing complexity

- Error handling:
  - Import failures should be caught by build system
  - Runtime availability checks needed for browser APIs
*/

export const AudioRecorder: React.FC = () => {
  console.log('[AudioRecorder.tsx, AudioRecorder] Initializing AudioRecorder component');
  
  const dispatch = useDispatch<AppDispatch>();
  const [openDialog, setOpenDialog] = useState(false);
  const { 
    isRecording, 
    chunks, 
    mergedAudio, 
    error, 
    isProcessing,
    recordingFinished,
    isSending
  } = useSelector((state: RootState) => state.audio);

  // Keywords: [AudioRecorder, dispatch, openDialog, isRecording, chunks, mergedAudio, error, isProcessing, recordingFinished, isSending]

/*
- Technical mechanics: Initializes component state and connects to Redux store for audio recording state management.

- Role in the broader system:
  - AudioRecorder: Main component managing audio recording functionality
  - dispatch: Triggers Redux actions for state changes
  - openDialog: Controls dialog visibility for chunk management
  - isRecording: Tracks active recording state
  - chunks: Stores recorded audio segments
  - mergedAudio: Holds combined audio data
  - error: Captures error states
  - isProcessing: Indicates ongoing operations
  - recordingFinished: Signals completion
  - isSending: Tracks upload state

- Edge cases or constraints:
  - State synchronization delays
  - Memory limitations for large audio chunks
  - Browser audio API restrictions

- Immediate action performed:
  - Sets up component state
  - Connects to Redux store

- Dependencies/inputs:
  - Redux store configuration
  - React state hooks
  - Browser audio APIs

- Outputs/state changes:
  - Local dialog state
  - Access to global audio state

- Performance considerations:
  - Redux selector optimization
  - State update frequency
  - Memory usage for audio data

- Security concerns:
  - Audio data handling
  - State manipulation protections

- Scalability:
  - Handles multiple recording sessions
  - Manages growing audio chunks

- Error handling:
  - Redux error state management
  - Component error boundaries needed
*/

  console.log('[AudioRecorder.tsx, AudioRecorder] Current state:', {
    isRecording,
    chunksCount: chunks.length,
    hasMergedAudio: !!mergedAudio,
    error,
    isProcessing,
    recordingFinished,
    isSending
  });

  /**
   * Recording start handler
   * Initiates the audio recording process with proper state management
   * Related: store/audioReducer.ts, utils/fileStorage.ts
   * Event handlers in React components respond to user interactions
   * Syntax:
   *   - MediaRecorder start: `mediaRecorder.start(timeslice)`
   *   - AudioContext resume: `await audioContext.resume()`
   */
  // Handler Functions Block
// Keywords: [handleStartRecording, handleStopRecording, handleMergeChunks, handlePlayMerged, handleOpenDialog, handleCloseDialog, handleSendChunks, canSendChunks]

/*
- Technical mechanics: Collection of event handlers managing different aspects of the audio recording process through Redux actions and local state management.

- Role in the broader system:
  - handleStartRecording: Initiates audio recording session via Redux action
  - handleStopRecording: Terminates active recording and prepares for processing
  - handleMergeChunks: Combines recorded audio segments into a single file
  - handlePlayMerged: Manages audio playback using browser's Audio API
  - handleOpenDialog: Controls dialog visibility for chunk sending UI
  - handleCloseDialog: Manages dialog closure state
  - handleSendChunks: Triggers backend upload of recorded audio
  - canSendChunks: Guards against invalid state transitions in sending process

- Edge cases or constraints:
  - Browser audio API compatibility
  - Memory limitations for large audio files
  - Network connectivity for sending chunks
  - Race conditions in state transitions
  - Audio format compatibility

- Immediate action performed:
  - Recording start/stop control
  - Audio chunk merging
  - Playback of recorded audio
  - Dialog state management
  - Backend communication initiation

- Dependencies/inputs:
  - Redux dispatch function
  - Current audio recording state
  - Browser's Audio and MediaRecorder APIs
  - UI state (dialog visibility)
  - Network connectivity

- Outputs/state changes:
  - Updates to recording state
  - Audio chunk processing state
  - Dialog visibility changes
  - Backend upload state
  - Audio playback state

- Performance considerations:
  - Audio chunk size management
  - Memory usage during merging
  - UI responsiveness during processing
  - Network bandwidth usage
  - State update batching

- Security concerns:
  - Audio data handling
  - URL.createObjectURL safety
  - Backend API authentication
  - User permission management
  - Cross-origin resource sharing

- Scalability:
  - Handles multiple recording sessions
  - Manages large audio files
  - Supports concurrent operations
  - Backend service scaling
  - UI performance with many chunks

- Error handling:
  - Audio API failures
  - Network errors
  - Invalid state transitions
  - Memory limitations
  - Browser compatibility issues
*/
  const handleStartRecording = () => {
    console.log('[AudioRecorder.tsx, handleStartRecording] Starting recording process');
    dispatch(startRecordingProcess());
  };

  /**
   * Recording stop handler
   * Finalizes the current recording session and prepares for processing
   * Related: store/audioReducer.ts, backend/services/audioService.ts
   * Asynchronous operations in React components should be properly handled to ensure smooth user experience
   */
  const handleStopRecording = () => {
    console.log('[AudioRecorder.tsx, handleStopRecording] Stopping recording process');
    dispatch(stopRecordingProcess());
  };

  /**
   * Audio chunk merging handler
   * Combines recorded audio chunks into a single cohesive recording
   * Related: store/audioReducer.ts, backend/services/audioService.ts
   * Complex state transformations in React use Redux
   * Syntax:
   *   - FormData append: `formData.append('audio', new Blob(chunks), 'recording.webm')`
   *   - Chunk conversion: `chunks.map(chunk => new Uint8Array(chunk))`
   */
  const handleMergeChunks = () => {
    console.log('[AudioRecorder.tsx, handleMergeChunks] Starting chunk merge process', {
      numberOfChunks: chunks.length
    });
    dispatch(mergeChunks());
  };

  /**
   * Plays back the merged audio recording
   * Creates an audio blob URL for playback in the browser
   * Uses browser's native Audio API for playback
   */
  const handlePlayMerged = () => {
    console.log('[AudioRecorder.tsx, handlePlayMerged] Attempting to play merged audio');
    if (mergedAudio) {
      console.log('[AudioRecorder.tsx, handlePlayMerged] Creating audio blob URL for playback');
      const audio = new Audio(URL.createObjectURL(mergedAudio));
      audio.play();
      console.log('[AudioRecorder.tsx, handlePlayMerged] Audio playback started');
    } else {
      console.log('[AudioRecorder.tsx, handlePlayMerged] No merged audio available for playback');
    }
  };

  // UI Rendering Block
// Keywords: [Box, Typography, Alert, Button, LinearProgress, motion, ToastContainer, progressPercentage, canMergeChunks]

/*
- Technical mechanics: Renders a Material-UI based interface with animated components and progress indicators for audio recording functionality.

- Role in the broader system:
  - Box: Container component for layout structure
  - Typography: Text display and headings
  - Alert: Error message display
  - Button: User interaction controls
  - LinearProgress: Visual feedback for recording progress
  - motion: Animated UI elements
  - ToastContainer: Notification system
  - progressPercentage: Recording progress calculation
  - canMergeChunks: State-based UI control

- Edge cases or constraints:
  - Screen size limitations
  - Browser animation performance
  - State synchronization delays
  - UI responsiveness during processing
  - Maximum chunk limit (5)

- Immediate action performed:
  - Renders recording interface
  - Updates progress indicators
  - Displays error states
  - Manages button states
  - Shows processing feedback

- Dependencies/inputs:
  - Material-UI components
  - Framer Motion for animations
  - Redux state values
  - Handler functions
  - Component state

- Outputs/state changes:
  - Visual UI updates
  - Button state changes
  - Progress bar updates
  - Error message display
  - Animation states

- Performance considerations:
  - Component re-render frequency
  - Animation performance
  - State update batching
  - UI responsiveness
  - Memory usage for animations

- Security concerns:
  - XSS in error messages
  - State manipulation protection
  - User input validation
  - Safe rendering of dynamic content

- Scalability:
  - Handles multiple recording states
  - Responsive design
  - Component composition
  - State management efficiency
  - UI performance with many chunks

- Error handling:
  - Visual error feedback
  - Graceful UI degradation
  - Loading states
  - Disabled states
  - User feedback mechanisms
*/

  const handleOpenDialog = () => {
    console.log('[AudioRecorder.tsx, handleOpenDialog] Opening send confirmation dialog');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    console.log('[AudioRecorder.tsx, handleCloseDialog] Closing send confirmation dialog');
    setOpenDialog(false);
  };

  /**
   * Sends recorded audio chunks to the backend for processing
   * Manages dialog state and initiates backend communication
   * Connected to audioReducer.ts sendChunksToBackend action
   */
  const handleSendChunks = () => {
    console.log('[AudioRecorder.tsx, handleSendChunks] Initiating chunk send process', {
      numberOfChunks: chunks.length
    });
    setOpenDialog(false);
    dispatch(sendChunksToBackend());
  };

  // Send button is enabled only when:
  // 1. Recording is not in progress
  // 2. Recording has finished
  // 3. There are chunks to send
  // 4. Not currently sending
  const canSendChunks = !isRecording && recordingFinished && chunks.length > 0 && !isSending;

  // Merge button is enabled only when:
  // 1. Chunks have been sent successfully
  // 2. Not currently processing
  const canMergeChunks = chunks.length > 0 && !isProcessing && !isRecording;

  // Calculate progress percentage
  const progressPercentage = (chunks.length / 5) * 100;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <ToastContainer position="top-right" />
      
      <Typography variant="h4" gutterBottom>
        Audio Recorder
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          color={isRecording ? 'error' : 'primary'}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          startIcon={isRecording ? <Square /> : <Mic />}
          disabled={chunks.length >= 5 && !isRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenDialog}
          disabled={!canSendChunks}
          startIcon={isSending ? <CircularProgress size={20} /> : <Send />}
        >
          {isSending ? 'Sending...' : 'Send Chunks'}
        </Button>

        <Button
          variant="outlined"
          onClick={handleMergeChunks}
          disabled={!canMergeChunks}
          startIcon={isProcessing ? <CircularProgress size={20} /> : <Merge />}
        >
          {isProcessing ? 'Processing...' : 'Merge Chunks'}
        </Button>

        {mergedAudio && (
          <Button
            variant="outlined"
            onClick={handlePlayMerged}
            startIcon={<Play />}
          >
            Play Merged
          </Button>
        )}
      </Box>

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        position: 'relative'
      }}>
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'error.light',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'success.main',
                borderRadius: 5,
              }
            }}
          />
        </Box>
        <Box sx={{ 
          minWidth: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 1 
        }}>
          {isRecording && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw size={16} />
            </motion.div>
          )}
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ fontWeight: 'medium' }}
          >
            {chunks.length}/5 Chunks
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        {chunks.map((chunk: AudioChunk, index: number) => (
          <Box
            key={chunk.id}
            sx={{
              p: 2,
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              opacity: chunk.sent ? 0.5 : 1,
            }}
          >
            <Typography>
              Chunk {index + 1} - Duration: {chunk.duration / 1000}s
              {chunk.sent && (
                <Typography component="span" color="success.main" sx={{ ml: 2 }}>
                  (Sent)
                </Typography>
              )}
            </Typography>
            <audio controls src={URL.createObjectURL(chunk.blob)} />
          </Box>
        ))}
      </Box>

      {mergedAudio && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Merged Audio
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={handlePlayMerged}
            startIcon={<Play />}
            sx={{ mb: 2 }}
          >
            Play Merged Audio
          </Button>
          <Box>
            <audio controls src={URL.createObjectURL(mergedAudio)} />
          </Box>
        </Box>
      )}

      {/* File Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audio Files to Send</DialogTitle>
        <DialogContent>
          <List>
            {chunks.map((chunk: AudioChunk, index: number) => (
              <ListItem 
                key={chunk.id} 
                divider 
                sx={{ 
                  flexDirection: 'column', 
                  alignItems: 'flex-start',
                  py: 2 
                }}
              >
                <Typography variant="subtitle1" component="div" gutterBottom>
                  {`Recording ${index + 1}`}
                </Typography>
                <Box 
                  component="div" 
                  sx={{ 
                    width: '100%',
                    pl: 2
                  }}
                >
                  <Typography 
                    component="div" 
                    variant="body2" 
                    color="textPrimary" 
                    sx={{ 
                      '& > div': { 
                        marginBottom: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }
                    }}
                  >
                    <div><span>•</span> <span>File Name:</span> <span>{chunk.id}.webm</span></div>
                    <div><span>•</span> <span>File Path:</span> <span>{`${config.BACKEND_URL}/uploads/recordings/${chunk.id}.webm`}</span></div>
                    <div><span>•</span> <span>File Type:</span> <span>{chunk.blob.type}</span></div>
                    <div><span>•</span> <span>Size:</span> <span>{(chunk.blob.size / 1024).toFixed(2)} KB</span></div>
                    <div><span>•</span> <span>Duration:</span> <span>{chunk.duration / 1000} seconds</span></div>
                    <div><span>•</span> <span>Timestamp:</span> <span>{new Date(chunk.timestamp).toLocaleString()}</span></div>
                    <div><span>•</span> <span>Status:</span> <span>{chunk.sent ? 'Already Sent' : 'Ready to Send'}</span></div>
                    <div>
                      <span>•</span> <span>Download:</span>
                      <Link 
                        href={`${config.BACKEND_URL}/uploads/recordings/${chunk.id}.webm`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        sx={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          textDecoration: 'none',
                          color: 'primary.main',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        <Download size={16} /> Download File
                      </Link>
                    </div>
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSendChunks} 
            color="primary" 
            variant="contained"
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Confirm Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};