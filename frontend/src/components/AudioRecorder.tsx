/**
 * Audio recording component with chunk-based processing
 * Core component managing all audio recording and processing UI interactions
 * Related: store/slices/audioSlice.ts, utils/fileStorage.ts, backend/services/audioService.ts
 * React components are the building blocks of React applications
 * Syntax:
 *   - MediaRecorder init: `new MediaRecorder(stream, { mimeType: 'audio/webm' })`
 *   - Blob creation: `new Blob(chunks, { type: 'audio/webm' })`
 *   - AudioContext time: `audioContext.currentTime.toFixed(3)`
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
} from '../store/slices/audioSlice';
import { AppDispatch } from '../store';
import config from '../config/config';

/**
 * Main AudioRecorder component implementation
 * Provides user interface for recording, merging, and managing audio chunks
 * Related: store/slices/audioSlice.ts, components/Navigation.tsx
 * Functional components in React use hooks to manage state and side effects
 * Syntax:
 *   - getUserMedia: `navigator.mediaDevices.getUserMedia({ audio: true })`
 *   - MediaRecorder events: `mediaRecorder.ondataavailable = (e) => chunks.push(e.data)`
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
   * Related: store/slices/audioSlice.ts, utils/fileStorage.ts
   * Event handlers in React components respond to user interactions
   * Syntax:
   *   - MediaRecorder start: `mediaRecorder.start(timeslice)`
   *   - AudioContext resume: `await audioContext.resume()`
   */
  const handleStartRecording = () => {
    console.log('[AudioRecorder.tsx, handleStartRecording] Starting recording process');
    dispatch(startRecordingProcess());
  };

  /**
   * Recording stop handler
   * Finalizes the current recording session and prepares for processing
   * Related: store/slices/audioSlice.ts, backend/services/audioService.ts
   * Asynchronous operations in React components should be properly handled to ensure smooth user experience
   */
  const handleStopRecording = () => {
    console.log('[AudioRecorder.tsx, handleStopRecording] Stopping recording process');
    dispatch(stopRecordingProcess());
  };

  /**
   * Audio chunk merging handler
   * Combines recorded audio chunks into a single cohesive recording
   * Related: store/slices/audioSlice.ts, backend/services/audioService.ts
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
   * Connected to audioSlice.ts sendChunksToBackend action
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
        {chunks.map((chunk, index) => (
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
            {chunks.map((chunk, index) => (
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