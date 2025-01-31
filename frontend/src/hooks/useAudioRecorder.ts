// Import React hooks
import { useCallback, useEffect, useRef, useState } from 'react';
// Import Redux hooks
import { useDispatch, useSelector } from 'react-redux';
// Import root state type
import { RootState } from '../store';
// Import audio slice actions
import {
  startRecording,
  stopRecording,
  addChunk,
  setError,
  setMergedAudio,
  setProcessing,
} from '../store/audioSlice';
import { AudioChunk } from '../store/audioTypes.ts';
import { UPLOAD_PATH } from '../store/audioReducer';

// Define duration of each audio chunk in milliseconds
const CHUNK_DURATION = 10000; // 10 seconds in milliseconds

// Custom hook for audio recording functionality
export const useAudioRecorder = () => {
  // Initialize Redux dispatch
  const dispatch = useDispatch();
  // Get audio state from Redux store
  const { isRecording, chunks, mergedAudio } = useSelector(
    (state: RootState) => state.audio
  );
  // Reference to MediaRecorder instance
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  // Reference to timeout for chunk duration
  const timeoutRef = useRef<NodeJS.Timeout>();
  // State for media stream
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Function to start a new recording
  const startNewRecording = useCallback(async () => {
    console.log('[useAudioRecorder.ts, startNewRecording] Starting new recording');
    try {
      console.log('[useAudioRecorder.ts, startNewRecording] Requesting audio input');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[useAudioRecorder.ts, startNewRecording] Audio input granted');
      // Store stream in state
      setStream(audioStream);

      // Create new MediaRecorder instance
      console.log('[useAudioRecorder.ts, startNewRecording] Creating MediaRecorder instance');
      const recorder = new MediaRecorder(audioStream);
      // Store recorder reference
      mediaRecorder.current = recorder;

      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Data available, creating chunk');
          // Create chunk object with metadata
          const chunk: AudioChunk = {
            id: Date.now().toString(),
            blob: event.data,
            duration: CHUNK_DURATION,
            timestamp: Date.now(),
            sent: false,
            fileName: `recording_${Date.now()}.webm`,
            filePath: `${UPLOAD_PATH}/recordings/${Date.now()}.webm`
          };
          console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Dispatching addChunk:', chunk);
          // Dispatch chunk to store
          dispatch(addChunk(chunk));
          
          // Automatically start next recording if not at max chunks
          if (chunks.length < 4) { // Check for less than 4 since new chunk isn't in state yet
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Less than 4 chunks, starting new recording');
            startNewRecording();
          } else {
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Max chunks reached, stopping stream');
            // Stop stream tracks when max chunks reached
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
      };

      // Start recording
      console.log('[useAudioRecorder.ts, startNewRecording] Starting recording');
      recorder.start();
      // Update recording state
      dispatch(startRecording());
      console.log('[useAudioRecorder.ts, startNewRecording] Recording started successfully');

      // Set timeout to stop recording after chunk duration
      timeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          // Stop recorder and update state
          recorder.stop();
          dispatch(stopRecording());
        }
      }, CHUNK_DURATION);
    } catch (error) {
      // Handle and dispatch any errors
      dispatch(setError('Failed to start recording: ' + (error as Error).message));
    }
  }, [dispatch, chunks.length, stream]);

  // Function to stop current recording
  const stopCurrentRecording = useCallback(() => {
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Stopping current recording');
    // Check if recorder exists and is recording
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      console.log('[useAudioRecorder.ts, stopCurrentRecording] Recorder exists and is recording, stopping recorder');
      // Stop recorder and update state
      mediaRecorder.current.stop();
      console.log('[useAudioRecorder.ts, stopCurrentRecording] Dispatching stopRecording');
      dispatch(stopRecording());
    }
    // Clear chunk duration timeout
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Clearing chunk duration timeout');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Stop all tracks in the stream
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Stopping all tracks in the stream');
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Current recording stopped successfully');
  }, [dispatch, stream]);

  // Function to merge recorded chunks
  const mergeChunks = useCallback(async () => {
    // Return if no chunks exist
    if (chunks.length === 0) return;

    // Set processing state
    dispatch(setProcessing(true));
    try {
      // Create audio context
      const audioContext = new AudioContext();
      // Convert chunks to audio buffers
      const audioBuffers = await Promise.all(
        chunks.map(async (chunk: AudioChunk) => {
          const arrayBuffer = await chunk.blob.arrayBuffer();
          return audioContext.decodeAudioData(arrayBuffer);
        })
      );

      // Calculate total length of merged audio
      const totalLength = audioBuffers.reduce((acc: number, buffer: AudioBuffer) => acc + buffer.length, 0);
      // Create buffer for merged audio
      const mergedBuffer = audioContext.createBuffer(
        1,
        totalLength,
        audioContext.sampleRate
      );
      // Get channel data for writing
      const channelData = mergedBuffer.getChannelData(0);

      // Merge audio buffers
      let offset = 0;
      audioBuffers.forEach((buffer: AudioBuffer) => {
        channelData.set(buffer.getChannelData(0), offset);
        offset += buffer.length;
      });

      // Convert merged buffer to blob
      const mergedBlob = await new Promise<Blob>((resolve) => {
        // Create media stream destination
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        // Create buffer source
        const source = audioContext.createBufferSource();
        source.buffer = mergedBuffer;
        source.connect(mediaStreamDestination);
        
        // Create recorder for final output
        const recorder = new MediaRecorder(mediaStreamDestination.stream);
        const chunks: BlobPart[] = [];
        
        // Handle recorder events
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/wav' }));
        
        // Start playback and recording
        source.start(0);
        recorder.start();
        source.stop(audioContext.currentTime + mergedBuffer.duration);
        recorder.stop();
      });

      // Store merged audio in state
      dispatch(setMergedAudio(mergedBlob));
    } catch (error) {
      // Handle and dispatch any errors
      dispatch(setError('Failed to merge audio chunks: ' + (error as Error).message));
    } finally {
      // Reset processing state
      dispatch(setProcessing(false));
    }
  }, [chunks, dispatch]);

  // Cleanup effect
  useEffect(() => {
    console.log('[useAudioRecorder.ts, cleanup] Cleaning up resources');
    // Stop all media tracks
    if (stream) {
      console.log('[useAudioRecorder.ts, cleanup] Stopping all media tracks');
      stream.getTracks().forEach(track => track.stop());
    }
    // Clear any pending timeouts
    console.log('[useAudioRecorder.ts, cleanup] Clearing any pending timeouts');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('[useAudioRecorder.ts, cleanup] Cleanup completed successfully');
  }, [stream]);

  // Return hook interface
  return {
    startRecording: startNewRecording,
    stopRecording: stopCurrentRecording,
    mergeChunks,
    isRecording,
    chunks,
    mergedAudio,
  };
};