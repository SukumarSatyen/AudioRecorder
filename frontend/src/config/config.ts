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
/*
Keywords: [const, config, BACKEND_URL, FRONTEND_URL, import]

- Technical: This code defines a configuration object that centralizes the backend and frontend URLs.
- Role:
  - `const`: Ensures that `config` is immutable once assigned.
  - `config`: An object that holds all configuration settings for the application.
  - `BACKEND_URL`: Specifies the base URL for backend API requests, allowing for dynamic port assignment.
  - `FRONTEND_URL`: Specifies the base URL for frontend API requests, also allowing for dynamic port assignment.
- Constraints: If the environment variables are not set correctly, the application may fail to connect to the services.
- Actions: Initializes the `config` object with backend and frontend URLs.
- Dependencies: Relies on `import.meta.env` to access environment variables for port numbers.
- Outputs: The `config` object is exported for use in other parts of the application.
- Performance: The use of environment variables allows for flexible configuration but may introduce latency if not cached.
- Security: Ensure that environment variables do not expose sensitive information in the client-side code.
- Scalability: The configuration can easily adapt to different environments (development, production) by changing environment variables.
- Errors: If the environment variables are missing, default values are used, but this may lead to unexpected behavior.
*/

export default config;

/* Execution Order:
1. The `import.meta.env` is accessed to retrieve the port numbers.
2. The `BACKEND_URL` and `FRONTEND_URL` are constructed using the retrieved port numbers.
3. The `config` object is created and exported for use in other modules.
*/

