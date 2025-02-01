/**
 * Redux store configuration and setup
 * Central state management configuration for the application
 * Related: store/audioReducer.ts, store/audioTypes.ts, components/AudioRecorder.tsx, App.tsx
 * Redux store serves as a centralized state container for managing application data flow
 */

/* Keywords: [Redux, store, configuration, TypeScript, state management]  

Technical: Configures and exports Redux store setup with TypeScript integration.  
Role:
Redux: Central state management library.
store: The global state container.
configuration: Setup for the Redux store.
TypeScript: Provides type safety for state management.
state management: Manages application data flow.
Constraints: Must handle non-serializable audio data carefully.
Actions: Sets up Redux store configuration and type definitions.
Dependencies: Requires @reduxjs/toolkit and react-redux packages.
Outputs: Creates global store instance.
Performance: Middleware configuration affects state updates performance.
Security: State mutations must only occur through defined reducers.
Scalability: Store structure supports addition of new slices.
Errors: TypeScript ensures type safety across the application. */

// Import Redux store configuration function
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// Import audio reducer from slice
import audioReducer from './audioReducer';

console.log('[index.ts, store] Starting store configuration');

/**
 * Store configuration implementation
 * Sets up Redux store with middleware and reducers
 * Related: store/audioReducer.ts, types/audio.ts
 * Redux store configuration defines how state is managed and updated throughout the application
 */

/* Keywords: [configureStore, reducer, middleware, serializableCheck, audioReducer]  

Technical: Creates Redux store instance with middleware configuration.  
Role:
configureStore: Function to create the Redux store.
reducer: Function to manage state updates.
middleware: Enhances store capabilities.
serializableCheck: Ensures state is serializable.
audioReducer: Handles audio-related state.
Constraints: Must handle non-serializable audio data (blobs, mediaRecorder).
Actions: Instantiates Redux store with custom middleware.
Dependencies: Requires audioReducer and middleware configuration.
Outputs: Creates configured store instance.
Performance: Middleware can impact state update performance.
Security: Ensure proper serialization of sensitive data.
Scalability: Can add more reducers and middleware as needed.
Errors: Middleware handles serialization errors. */

console.log('[index.ts, store] Configuring middleware');
// console.log('[index.ts, middleware] Ignoring paths:', ['audio.mediaRecorder', 'audio.stream', 'audio.chunks']);
console.log('[index.ts, middleware] Ignoring paths in serializableCheck');
// console.log('[index.ts, middleware] Ignoring action paths:', ['payload.mediaRecorder', 'payload.stream', 'payload.blob']);
console.log('[index.ts, middleware] Ignoring action paths in serializableCheck');

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

console.log('[index.ts, store] Finished configuring middleware');

/**
 * Type definitions for Redux store integration
 * Enables TypeScript support for state and dispatch operations
 * Used across all components for type-safe state access
 * @see {@link https://redux.js.org/usage/usage-with-typescript} - Redux TypeScript Guide
 */

/* Keywords: [RootState, AppDispatch, TypeScript, store.getState, store.dispatch]  

Technical: Defines TypeScript types for store state and dispatch.  
Role:
RootState: Represents the shape of the entire Redux state.
AppDispatch: Type for the dispatch function.
TypeScript: Provides type safety for state access.
store.getState: Function to access the current state.
store.dispatch: Function to dispatch actions.
Constraints: Types must be updated when store structure changes.
Actions: Creates type definitions for state and dispatch.
Dependencies: Generated from store configuration.
Outputs: Provides compile-time type safety.
Performance: No runtime overhead; types are removed in production.
Security: Types help prevent invalid state access.
Scalability: Types automatically update with store changes.
Errors: Compilation catches type mismatches. */

console.log('[index.ts, RootState] Defining RootState');

export type RootState = ReturnType<typeof store.getState>;

console.log('[index.ts, RootState] Finished defining RootState');

console.log('[index.ts, AppDispatch] Defining AppDispatch');

export type AppDispatch = typeof store.dispatch;

console.log('[index.ts, AppDispatch] Finished defining AppDispatch');

/**
 * Custom typed hooks for Redux state management
 * Provides type-safe access to Redux store and dispatch
 * Used in all components needing access to Redux state
 * @see {@link https://react-redux.js.org/using-react-redux/usage-with-typescript} - React-Redux TypeScript
 */

/* Keywords: [useAppDispatch, useAppSelector, TypedUseSelectorHook, hooks]  

Technical: Creates typed hooks for Redux state access.  
Role:
useAppDispatch: Custom hook for dispatching actions.
useAppSelector: Custom hook for selecting state.
TypedUseSelectorHook: Type-safe version of useSelector.
hooks: Functions for accessing Redux state.
Constraints: Must be used instead of standard Redux hooks.
Actions: Exports typed versions of useDispatch and useSelector.
Dependencies: Requires RootState and AppDispatch types.
Outputs: Enables type-safe state access.
Performance: Minimal overhead from hook usage.
Security: Prevents access to invalid state properties.
Scalability: Works with any number of state slices.
Errors: TypeScript catches invalid state access. */

console.log('[index.ts, useAppDispatch] Defining useAppDispatch');

export const useAppDispatch: () => AppDispatch = useDispatch;

console.log('[index.ts, useAppDispatch] Finished defining useAppDispatch');

console.log('[index.ts, useAppSelector] Defining useAppSelector');

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

console.log('[index.ts, useAppSelector] Finished defining useAppSelector');

/* Execution Order:  

1. Import necessary functions and reducers.  
2. Configure the Redux store.  
   - Set up reducers and middleware.  
3. Define types for RootState and AppDispatch.  
4. Create custom hooks for dispatch and selector.  
   - Provide type-safe access to Redux store. */