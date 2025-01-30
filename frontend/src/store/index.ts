/**
 * Redux store configuration and setup
 * Central state management configuration for the application
 * Related: store/audioReducer.ts, components/AudioRecorder.tsx, App.tsx
 * Redux store serves as a centralized state container for managing application data flow
 */

/*
- Technical mechanics: Configures and exports Redux store setup with TypeScript integration
- Role in broader system: Serves as the central state management configuration hub
- Edge cases/constraints: Must handle non-serializable audio data carefully
- Immediate action: Sets up Redux store configuration and type definitions
- Dependencies/inputs: Requires @reduxjs/toolkit and react-redux packages
- Outputs/state changes: Creates global store instance
- Performance considerations: Middleware configuration affects state updates performance
- Security concerns: State mutations must only occur through defined reducers
- Scalability: Store structure supports addition of new slices
- Error handling: TypeScript ensures type safety across the application
Keywords: [Redux, store, configuration, TypeScript, state management]
*/

// Import Redux store configuration function
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// Import audio reducer from slice
import audioReducer from './audioReducer';

/**
 * Store configuration implementation
 * Sets up Redux store with middleware and reducers
 * Related: store/audioReducer.ts, types/audio.ts
 * Redux store configuration defines how state is managed and updated throughout the application
 */

/*
- Technical mechanics: Creates Redux store instance with middleware configuration
- Role in broader system: Configures store with audio reducer and serialization settings
- Edge cases/constraints: Must handle non-serializable audio data (blobs, mediaRecorder)
- Immediate action: Instantiates Redux store with custom middleware
- Dependencies/inputs: Requires audioReducer and middleware configuration
- Outputs/state changes: Creates configured store instance
- Performance considerations: Middleware can impact state update performance
- Security concerns: Ensure proper serialization of sensitive data
- Scalability: Can add more reducers and middleware as needed
- Error handling: Middleware handles serialization errors
Keywords: [configureStore, reducer, middleware, serializableCheck, audioReducer]
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

/*
- Technical mechanics: Defines TypeScript types for store state and dispatch
- Role in broader system: Provides type safety for state access across components
- Edge cases/constraints: Types must be updated when store structure changes
- Immediate action: Creates type definitions for state and dispatch
- Dependencies/inputs: Generated from store configuration
- Outputs/state changes: No runtime changes, provides compile-time type safety
- Performance considerations: No runtime overhead, types are removed in production
- Security concerns: Types help prevent invalid state access
- Scalability: Types automatically update with store changes
- Error handling: Compilation catches type mismatches
Keywords: [RootState, AppDispatch, TypeScript, store.getState, store.dispatch]
*/

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/**
 * Custom typed hooks for Redux state management
 * Provides type-safe access to Redux store and dispatch
 * Used in all components needing access to Redux state
 * @see {@link https://react-redux.js.org/using-react-redux/usage-with-typescript} - React-Redux TypeScript
 */

/*
- Technical mechanics: Creates typed hooks for Redux state access
- Role in broader system: Provides type-safe hooks for components to access store
- Edge cases/constraints: Must be used instead of standard Redux hooks
- Immediate action: Exports typed versions of useDispatch and useSelector
- Dependencies/inputs: Requires RootState and AppDispatch types
- Outputs/state changes: No direct changes, enables type-safe state access
- Performance considerations: Minimal overhead from hook usage
- Security concerns: Prevents access to invalid state properties
- Scalability: Works with any number of state slices
- Error handling: TypeScript catches invalid state access
Keywords: [useAppDispatch, useAppSelector, TypedUseSelectorHook, hooks]
*/

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;