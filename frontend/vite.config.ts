// Import Vite configuration function
import { defineConfig, loadEnv } from 'vite';
// Import React plugin for Vite
import react from '@vitejs/plugin-react';
import path from 'path';

// Configuration for Vite build tool
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from config directory
  const env = loadEnv(mode, path.resolve(__dirname, '../config'), '');
  
  return {
    // Configure Vite plugins
    plugins: [react()],
    // Set root directory
    root: path.resolve(__dirname, './'),
    // Configure alias for resolving modules
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Configure server settings
    server: {
      port: parseInt(env.FRONTEND_PORT || '3000'),
      open: true,
    },
    // Make env variables available to frontend
    define: {
      'import.meta.env.BACKEND_PORT': JSON.stringify(env.BACKEND_PORT),
      'import.meta.env.FRONTEND_PORT': JSON.stringify(env.FRONTEND_PORT)
    }
  };
});
