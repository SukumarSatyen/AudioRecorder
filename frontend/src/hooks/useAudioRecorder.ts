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
  console.log('[useAudioRecorder.ts, useAudioRecorder] Starting hook initialization');

  // Initialize Redux dispatch
  const dispatch = useDispatch();
  console.log('[useAudioRecorder.ts, useAudioRecorder] Initialized dispatch');

  // Get audio state from Redux store
  const { isRecording, chunks, mergedAudio } = useSelector(
    (state: RootState) => state.audio
  );
  console.log('[useAudioRecorder.ts, useAudioRecorder] Retrieved audio state from Redux store');

  // Reference to MediaRecorder instance
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  console.log('[useAudioRecorder.ts, useAudioRecorder] Initialized mediaRecorder reference');

  // Reference to timeout for chunk duration
  const timeoutRef = useRef<NodeJS.Timeout>();
  console.log('[useAudioRecorder.ts, useAudioRecorder] Initialized timeoutRef reference');

  // State for media stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  console.log('[useAudioRecorder.ts, useAudioRecorder] Initialized stream state');

  // Function to start a new recording
  const startNewRecording = useCallback(async () => {
    console.log('[useAudioRecorder.ts, startNewRecording] Starting new recording process');

    try {
      console.log('[useAudioRecorder.ts, startNewRecording] Requesting audio input');
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[useAudioRecorder.ts, startNewRecording] Audio input granted');

      // Store stream in state
      setStream(audioStream);
      console.log('[useAudioRecorder.ts, startNewRecording] Updated stream state:', audioStream);

      // Create new MediaRecorder instance
      console.log('[useAudioRecorder.ts, startNewRecording] Creating MediaRecorder instance');
      const recorder = new MediaRecorder(audioStream);
      console.log('[useAudioRecorder.ts, startNewRecording] Created MediaRecorder instance');

      // Store recorder reference
      mediaRecorder.current = recorder;
      console.log('[useAudioRecorder.ts, startNewRecording] Updated mediaRecorder reference:', recorder);

      // Handle data available event
      recorder.ondataavailable = (event) => {
        console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Data available event triggered');

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
          console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Created chunk:', chunk);

          console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Dispatching addChunk:', chunk);
          // Dispatch chunk to store
          dispatch(addChunk(chunk));
          console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Chunk added to store');

          // Automatically start next recording if not at max chunks
          if (chunks.length < 4) { // Check for less than 4 since new chunk isn't in state yet
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Condition met: less than 4 chunks');
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Starting new recording');
            startNewRecording();
          } else {
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Condition met: max chunks reached');
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Stopping stream');
            // Stop stream tracks when max chunks reached
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
            console.log('[useAudioRecorder.ts, startNewRecording.ondataavailable] Stream stopped and set to null');
          }
        }
      };

      // Start recording
      console.log('[useAudioRecorder.ts, startNewRecording] Starting recording');
      recorder.start();
      console.log('[useAudioRecorder.ts, startNewRecording] Recording started');

      // Update recording state
      dispatch(startRecording());
      console.log('[useAudioRecorder.ts, startNewRecording] Recording started successfully');

      console.log('[useAudioRecorder.ts, startNewRecording] Awaiting chunk duration timeout');
      // Set timeout to stop recording after chunk duration
      timeoutRef.current = setTimeout(() => {
        console.log('[useAudioRecorder.ts, startNewRecording] Chunk duration timeout triggered');

        if (recorder.state === 'recording') {
          console.log('[useAudioRecorder.ts, startNewRecording] Condition met: recorder is recording');
          // Stop recorder and update state
          recorder.stop();
          dispatch(stopRecording());
          console.log('[useAudioRecorder.ts, startNewRecording] Recorder stopped and recording state updated');
        }
      }, CHUNK_DURATION);
    } catch (error) {
      console.error('[useAudioRecorder.ts, startNewRecording] Error:', error);

      // Handle and dispatch any errors
      dispatch(setError('Failed to start recording: ' + (error as Error).message));
      console.log('[useAudioRecorder.ts, startNewRecording] Error dispatched to store');
    } finally {
      console.log('[useAudioRecorder.ts, startNewRecording] New recording process completed');
    }
  }, [dispatch, chunks.length, stream]);

  // Function to stop current recording
  const stopCurrentRecording = useCallback(() => {
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Stopping current recording process');

    // Check if recorder exists and is recording
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      console.log('[useAudioRecorder.ts, stopCurrentRecording] Condition met: recorder exists and is recording');
      console.log('[useAudioRecorder.ts, stopCurrentRecording] Stopping recorder');
      // Stop recorder and update state
      mediaRecorder.current.stop();
      dispatch(stopRecording());
      console.log('[useAudioRecorder.ts, stopCurrentRecording] Recorder stopped and recording state updated');
    }

    console.log('[useAudioRecorder.ts, stopCurrentRecording] Clearing chunk duration timeout');
    // Clear chunk duration timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log('[useAudioRecorder.ts, stopCurrentRecording] Stopping all tracks in the stream');
    // Stop all tracks in the stream
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    console.log('[useAudioRecorder.ts, stopCurrentRecording] Stream stopped and set to null');

    console.log('[useAudioRecorder.ts, stopCurrentRecording] Current recording process completed');
  }, [dispatch, stream]);

  // Function to merge recorded chunks
  const mergeChunks = useCallback(async () => {
    console.log('[useAudioRecorder.ts, mergeChunks] Merging recorded chunks process started');

    // Return if no chunks exist
    if (chunks.length === 0) {
      console.log('[useAudioRecorder.ts, mergeChunks] Condition met: no chunks exist');
      return;
    }

    console.log('[useAudioRecorder.ts, mergeChunks] Setting processing state');
    // Set processing state
    dispatch(setProcessing(true));

    try {
      console.log('[useAudioRecorder.ts, mergeChunks] Creating audio context');
      // Create audio context
      const audioContext = new AudioContext();

      console.log('[useAudioRecorder.ts, mergeChunks] Converting chunks to audio buffers');
      // Convert chunks to audio buffers
      const audioBuffers = await Promise.all(
        chunks.map(async (chunk: AudioChunk) => {
          const arrayBuffer = await chunk.blob.arrayBuffer();
          return audioContext.decodeAudioData(arrayBuffer);
        })
      );

      console.log('[useAudioRecorder.ts, mergeChunks] Calculating total length of merged audio');
      // Calculate total length of merged audio
      const totalLength = audioBuffers.reduce((acc: number, buffer: AudioBuffer) => acc + buffer.length, 0);

      console.log('[useAudioRecorder.ts, mergeChunks] Creating buffer for merged audio');
      // Create buffer for merged audio
      const mergedBuffer = audioContext.createBuffer(
        1,
        totalLength,
        audioContext.sampleRate
      );

      console.log('[useAudioRecorder.ts, mergeChunks] Getting channel data for writing');
      // Get channel data for writing
      const channelData = mergedBuffer.getChannelData(0);

      console.log('[useAudioRecorder.ts, mergeChunks] Merging audio buffers');
      // Merge audio buffers
      let offset = 0;
      audioBuffers.forEach((buffer: AudioBuffer) => {
        console.log('[useAudioRecorder.ts, mergeChunks] Current offset value:', offset);
        console.log('[useAudioRecorder.ts, mergeChunks] Processing buffer:', buffer);
        console.log('[useAudioRecorder.ts, mergeChunks] Buffer length:', buffer.length);
        console.log('[useAudioRecorder.ts, mergeChunks] Buffer duration:', buffer.duration);
        console.log('[useAudioRecorder.ts, mergeChunks] Buffer sampleRate:', buffer.sampleRate);
        console.log('[useAudioRecorder.ts, mergeChunks] Buffer numberOfChannels:', buffer.numberOfChannels);

        channelData.set(buffer.getChannelData(0), offset);
        console.log('[useAudioRecorder.ts, mergeChunks] Offset after setting channel data:', offset);
        offset += buffer.length;
        console.log('[useAudioRecorder.ts, mergeChunks] Offset after incrementing:', offset);
      });

      console.log('[useAudioRecorder.ts, mergeChunks] Converting merged buffer to blob');
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

      console.log('[useAudioRecorder.ts, mergeChunks] Storing merged audio in state');
      // Store merged audio in state
      dispatch(setMergedAudio(mergedBlob));
    } catch (error) {
      console.error('[useAudioRecorder.ts, mergeChunks] Error:', error);

      // Handle and dispatch any errors
      dispatch(setError('Failed to merge audio chunks: ' + (error as Error).message));
    } finally {
      console.log('[useAudioRecorder.ts, mergeChunks] Resetting processing state');
      // Reset processing state
      dispatch(setProcessing(false));

      console.log('[useAudioRecorder.ts, mergeChunks] Merging recorded chunks process completed');
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
  console.log('[useAudioRecorder.ts, useAudioRecorder] Returning hook interface');
  return {
    startRecording: startNewRecording,
    stopRecording: stopCurrentRecording,
    mergeChunks,
    isRecording,
    chunks,
    mergedAudio,
  };
};