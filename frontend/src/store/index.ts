/**
 * Redux store configuration and setup
 * Central state management configuration for the application
 * Related: store/slices/audioSlice.ts, components/AudioRecorder.tsx, App.tsx
 * Redux store serves as a centralized state container for managing application data flow
 */

// Import Redux store configuration function
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// Import audio reducer from slice
import audioReducer from './slices/audioSlice';

/**
 * Store configuration implementation
 * Sets up Redux store with middleware and reducers
 * Related: store/slices/audioSlice.ts, types/audio.ts
 * Redux store configuration defines how state is managed and updated throughout the application
 */
export const store = configureStore({
  // Define root reducer
  reducer: {
    // Add audio reducer to store
    audio: audioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['audio.mediaRecorder', 'audio.stream', 'audio.chunks'],
        // Ignore these action paths
        ignoredActionPaths: ['payload.mediaRecorder', 'payload.stream', 'payload.blob'],
      },
    }),
});

/**
 * Type definitions for Redux store integration
 * Enables TypeScript support for state and dispatch operations
 * Used across all components for type-safe state access
 * @see {@link https://redux.js.org/usage/usage-with-typescript} - Redux TypeScript Guide
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Custom typed hooks for Redux state management
 * Provides type-safe access to Redux store and dispatch
 * Used in all components needing access to Redux state
 * @see {@link https://react-redux.js.org/using-react-redux/usage-with-typescript} - React-Redux TypeScript
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;