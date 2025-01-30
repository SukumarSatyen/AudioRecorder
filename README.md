# Voice Recorder Application

A modern web application for recording, managing, and processing audio chunks with a clean Material-UI interface.

## Features

### Audio Recording
- Record audio in chunks (maximum 5 chunks)
- Real-time recording status with animated indicators
- Merge multiple audio chunks into a single file
- Play merged audio directly in the browser
- Send audio chunks to the backend server

### User Interface
- Clean, modern Material-UI design
- Real-time recording status with animated refresh icon
- Dynamic chunk counter (0/5) with smooth animations
- Responsive button states based on recording status
- Detailed audio information dialog showing:
  - File Name
  - File Path
  - File Type
  - Size (KB)
  - Duration (seconds)
  - Timestamp
  - Status (Sent/Ready to Send)

### Technical Features
- Type-safe error handling with TypeScript
- Environment variable configuration for both frontend and backend
- CORS security configuration
- Proper file path handling for audio storage
- Asynchronous audio processing
- Framer Motion animations for smooth transitions

#### Recording Progress Indicator
- Dynamic chunk counter showing "Recorded Chunks: X/5"
- Animated refresh icon that rotates during recording
- Smooth transitions using Framer Motion:
  - Fade in/out animations
  - Scale animations for visual feedback
  - Continuous rotation animation for the refresh icon
  - Counter appears/disappears based on recording state

#### Dialog Improvements
- Optimized DOM structure for better performance
- Enhanced layout and spacing of file information
- Aligned bullet points and text for better readability
- Consistent styling using Material-UI's sx prop
- Detailed file information display with proper formatting

## Technical Stack

### Frontend
- React with TypeScript
- Material-UI for components
- Framer Motion for animations
- Redux for state management
- React-Toastify for notifications

### Backend
- Node.js with TypeScript
- Express for API endpoints
- Type-safe error handling
- CORS configuration for security

## Environment Setup
- Frontend runs on port 3000
- Backend runs on port 3001
- CORS configured for localhost development
- Environment variables handled through Vite's import.meta.env

## Environment Configuration

The application uses a centralized environment configuration approach:

#### Configuration Structure
- **Location**: All environment variables are centralized in `/config/.env`
- **No local env files**: The application does not use local `.env` files in frontend or backend directories

#### Key Environment Variables in /config/.env file
```env
# Server Configuration
BACKEND_PORT=3001    # Port for the backend server
FRONTEND_PORT=3000   # Port for the frontend development server

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your_bucket_name
```

#### How It Works
- **Backend**: Directly reads from `/config/.env` using dotenv
- **Frontend**: 
  - Vite loads variables from `/config/.env` during build/development
  - Variables are accessible via `import.meta.env`
- **Lambda Functions**: Use AWS Lambda environment variables when deployed

#### Important Notes
- **I did not commit the `/config/.env` file to version control**
- I used the provided environment variable names exactly as shown
- I recommend that both frontend and backend must be restarted when changing environment variables
- Github: https://github.com/SukumarSatyen/AudioRecorder.git

## Project Structure
### Shared Configuration

- Location: `/config` directory contains shared configuration files
- Path Utilities: `paths.ts` handles platform-specific path resolution
- TypeScript Configuration: Backend's `tsconfig.json` is configured to:
  - Use shared configuration from parent directory
  - Include both `src` and shared `config` directories
  - Maintain strict type safety across the project

## File Upload System
### Upload Directory Structure

- Platform-Specific Root Directory:
  - Windows: Uses available system drive with write permissions
  - Unix/Linux/Mac: Uses root-level directory with write permissions
- Subdirectories:
  - `recordings/` for audio files
  - Directories are created automatically if they don't exist

### File Naming Strategy

- Preserves original filename
- Ensures uniqueness by appending:
  - Timestamp
  - Random suffix
  - Original file extension

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/