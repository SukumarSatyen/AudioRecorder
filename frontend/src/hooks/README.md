# Custom Hooks Directory

This directory contains custom React hooks used throughout the application.

## useAudioRecorder Hook

The `useAudioRecorder` hook manages audio recording functionality using the MediaRecorder API and Redux for state management.

### Types

```typescript
// Audio chunk interface
interface AudioChunk {
  id: string;           // Unique identifier
  blob: Blob;          // Audio data
  duration: number;    // Duration in milliseconds
  timestamp: number;   // Recording timestamp
}

// Recording state interface
interface RecordingState {
  isRecording: boolean;
  currentChunkDuration: number;
  chunks: AudioChunk[];
  mergedAudio: Blob | null;
  error: string | null;
  isProcessing: boolean;
}
```

### Available Redux Actions

```typescript
// From audioSlice.ts
interface AudioActions {
  startRecording(): void;      // Start recording session
  stopRecording(): void;       // Stop recording session
  addChunk(chunk: AudioChunk): void; // Add new audio chunk
  setError(msg: string): void; // Set error message
  setMergedAudio(blob: Blob): void; // Set merged audio result
  setProcessing(status: boolean): void; // Set processing status
  resetRecording(): void;      // Reset recording state
}
```

### Usage Example

```typescript
import { useAudioRecorder } from '../hooks/useAudioRecorder';

const YourComponent = () => {
  const { startRecording, stopRecording, mergeChunks } = useAudioRecorder();
  const { isRecording, chunks, error } = useSelector(state => state.audio);

  // Start recording
  const handleStart = () => {
    startRecording();
  };

  // Stop recording
  const handleStop = () => {
    stopRecording();
  };
};
```

### Implementation Details

1. **Audio Processing**
   ```typescript
   // Convert chunks to audio buffers
   const audioBuffers = await Promise.all(
     chunks.map(async (chunk: AudioChunk) => {
       const arrayBuffer = await chunk.blob.arrayBuffer();
       return audioContext.decodeAudioData(arrayBuffer);
     })
   );

   // Calculate total length
   const totalLength = audioBuffers.reduce(
     (acc: number, buffer: AudioBuffer) => acc + buffer.length, 
     0
   );

   // Merge buffers
   audioBuffers.forEach((buffer: AudioBuffer) => {
     channelData.set(buffer.getChannelData(0), offset);
     offset += buffer.length;
   });
   ```

2. **MediaRecorder Configuration**
   ```typescript
   const recorder = new MediaRecorder(audioStream);
   recorder.ondataavailable = (event) => {
     if (event.data.size > 0) {
       const chunk: AudioChunk = {
         id: Date.now().toString(),
         blob: event.data,
         duration: CHUNK_DURATION,
         timestamp: Date.now(),
       };
       dispatch(addChunk(chunk));
     }
   };
   ```

### Dependencies

1. **React Hooks**
   - useCallback
   - useEffect
   - useRef
   - useState

2. **Redux**
   - useDispatch
   - useSelector
   - RootState type

3. **Audio Types**
   ```typescript
   import { AudioChunk } from '../types/audio';
   ```

### Best Practices

1. **Type Safety**
   - Use explicit types for all parameters
   - Avoid implicit 'any' types
   - Properly type audio processing functions

2. **State Management**
   - Use Redux for global recording state
   - Keep MediaRecorder instance in useRef
   - Clean up resources properly

3. **Error Handling**
   - Provide clear error messages
   - Handle all potential MediaRecorder errors
   - Clean up on error conditions

### Common Issues and Solutions

1. **Type Issues**
   - Always import AudioChunk type
   - Use explicit types for audio buffers
   - Type parameters in reduce/map/forEach

2. **Browser Compatibility**
   - Handle different audio formats
   - Check MediaRecorder support
   - Provide fallback options

### Testing

1. **Unit Tests**
   - Test hook initialization
   - Test state transitions
   - Test error conditions

2. **Integration Tests**
   - Test with Redux store
   - Test MediaRecorder integration
   - Test cleanup behavior

### Future Improvements

1. Add pause/resume functionality
2. Support different audio formats
3. Add audio visualization
4. Implement custom chunk duration
5. Add audio effects processing

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/
