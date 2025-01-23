/**
 * Application configuration constants
 * Centralizes all configuration values and environment variables
 * Related: App.tsx, components/AudioRecorder.tsx, store/slices/audioSlice.ts
 * Configuration files provide a single source of truth for application settings and constants
 */

/**
 * API endpoint configuration
 * Defines backend service endpoints and connection settings
 * Related: services/audioService.ts, components/AudioRecorder.tsx
 * Environment-specific configuration ensures proper service connectivity across different deployments
 */
const config = {
  /**
   * Backend service URL
   * Defines the base URL for backend API requests
   * Related: services/audioService.ts
   */
  BACKEND_URL: `http://localhost:${import.meta.env.BACKEND_PORT || 3001}`,
  /**
   * Frontend service URL
   * Defines the base URL for frontend API requests
   * Related: components/AudioRecorder.tsx
   */
  FRONTEND_URL: `http://localhost:${import.meta.env.FRONTEND_PORT || 3000}`
};

export default config;
