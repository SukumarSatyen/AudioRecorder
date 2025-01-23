# Pages Directory

This directory contains the main page components of the application.

## Recording Page

The Recording page (`Recording.tsx`) is responsible for audio recording functionality.

### Component Structure

```tsx
pages/
└── Recording.tsx       # Main recording page component
```

### State Management

The Recording page uses Redux for state management with the following state:

```typescript
interface AudioState {
  isRecording: boolean;    // Current recording status
  chunks: Blob[];         // Array of recorded audio chunks
  error: string | null;   // Error message if any
  mergedAudio: Blob | null; // Merged audio result
  isProcessing: boolean;  // Processing status
}
```

### Component Hierarchy

```
Recording
└── Container (MUI)
    └── Paper
        └── AudioRecorder
            ├── Recording Controls
            ├── Error Display
            └── Audio Playback
```

### Features

1. **Audio Recording**
   - Start/Stop recording
   - Automatic chunking (10-second intervals)
   - Error handling for permissions/device issues

2. **UI Elements**
   - Recording status indicator
   - Error messages display
   - Recording controls
   - Playback functionality

3. **Animations**
   - Page entry animation using Framer Motion
   - Smooth transitions between states

### Dependencies

- Material-UI (`@mui/material`)
- Framer Motion (`framer-motion`)
- Redux for state management
- Custom hooks:
  - `useAudioRecorder`: Handles recording logic

### Usage Example

```tsx
import { Recording } from './pages/Recording';

// In your router
<Route path="/recording" element={<Recording />} />
```

### State Flow

1. **Recording Start**
   ```typescript
   isRecording: false -> true
   chunks: [] -> [chunk1, chunk2, ...]
   ```

2. **Recording Stop**
   ```typescript
   isRecording: true -> false
   // chunks remain until merged
   ```

3. **Error Handling**
   ```typescript
   error: null -> "Error message"
   ```

4. **Audio Processing**
   ```typescript
   isProcessing: false -> true
   chunks: [chunk1, chunk2] -> []
   mergedAudio: null -> Blob
   isProcessing: true -> false
   ```

### Component Integration

The Recording page integrates with:
1. Redux store for state management
2. AudioRecorder component for UI
3. useAudioRecorder hook for functionality
4. Material-UI for styling

### Error States

The component handles various error states:
1. Microphone permission denied
2. Device not found
3. Recording initialization failures
4. Processing errors

### Best Practices

1. **State Management**
   - Use Redux for global state
   - Keep UI state local where possible
   - Clean up resources on unmount

2. **Error Handling**
   - Display user-friendly error messages
   - Provide recovery options
   - Log errors for debugging

3. **Performance**
   - Chunk audio data for better memory management
   - Clean up unused blobs
   - Optimize re-renders

### Future Improvements

1. Add waveform visualization
2. Support multiple audio formats
3. Add audio effects processing
4. Implement pause/resume functionality
5. Add recording time limit options
