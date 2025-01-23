# Frontend Documentation

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx           # Portfolio home page with skills and experience
│   │   └── Recording.tsx      # Audio recording interface
│   ├── hooks/
│   │   └── useAudioRecorder.ts # Custom hook for audio recording
│   ├── store/
│   │   ├── index.ts           # Redux store configuration
│   │   └── slices/
│   │       └── audioSlice.ts  # Audio state management
│   ├── types/
│   │   └── audio.ts           # TypeScript definitions for audio
│   └── utils/
│       └── fileStorage.ts     # Core storage utility
├── components/
│   └── AudioRecorder.tsx      # UI component for recording
└── ...
```

## Components

### Home Component
The Home component (`src/pages/Home.tsx`) displays a portfolio page with:
- Technical skills with categorized items
- Professional experience timeline
- Animated transitions using Framer Motion
- Material UI components for layout and styling

### Dependencies
```json
{
  "@emotion/react": "^11.11.3",
  "@emotion/styled": "^11.11.0",
  "@mui/material": "^5.15.10",
  "@reduxjs/toolkit": "^2.2.1",
  "framer-motion": "^11.0.5",
  "lucide-react": "^0.344.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-redux": "^9.1.0",
  "react-router-dom": "^6.22.1",
  "react-toastify": "^9.0.8"
}
```

## TypeScript Configuration

### tsconfig.app.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*", "src/pages/**/*"],
  "exclude": ["node_modules"]
}
```

## File Storage Implementation

The frontend implements a sophisticated multi-tier approach for storing audio recordings, providing both local and cloud storage options.

### Storage Components

1. **Core Storage Utility (`src/utils/fileStorage.ts`)**:
   - Implements three-tier storage strategy
   - Handles automatic failover between methods
   - Provides type-safe interfaces
   - Manages error handling and user feedback

2. **UI Integration (`src/components/AudioRecorder.tsx`)**:
   - Provides user interface for recording
   - Integrates with storage utility
   - Handles recording state management
   - Shows progress and status feedback

### Storage Methods (In Order of Priority)

1. **File System Access API**
   - Modern browser API for direct file system access
   - Provides native file picker experience
   - Requires modern browser support
   - Most user-friendly option

2. **Electron File System API**
   - Available in desktop application mode
   - Uses Node.js native file system
   - Provides OS-native dialog boxes
   - Full file system access capabilities

3. **Server Upload**
   - Fallback method for all platforms
   - Uses FormData for file transfer
   - Ensures universal compatibility
   - Automatic backup option

### Key Features

1. **Automatic Failover**:
   - Seamlessly tries each method in sequence
   - Falls back to next method on failure
   - Provides appropriate user feedback
   - Maintains data integrity

2. **Redundant Storage**:
   - Attempts server backup after local save
   - Ensures data availability across devices
   - Protects against data loss
   - User notified of backup status

3. **Type Safety**:
   - Full TypeScript implementation
   - Interface definitions for APIs
   - Proper error typing
   - Compile-time checks

4. **Error Handling**:
   - Comprehensive error capture
   - User-friendly error messages
   - Detailed console logging
   - Graceful degradation

### Usage in Components

The storage functionality is primarily used in:
- `AudioRecorder.tsx`: Main recording interface
- Related components handling audio playback and management

### Dependencies

- React-Toastify: For user notifications
- Electron (optional): For desktop functionality
- TypeScript: For type safety
- Browser File System Access API (modern browsers)

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Troubleshooting

If you encounter TypeScript errors:

1. Clear npm cache and reinstall dependencies:
```bash
npm cache clean --force
rm -r node_modules
npm install
```

2. Restart TypeScript server in your editor
3. Make sure you're working in the correct directory structure
4. Verify that all imports use the correct paths

## State Management

The application uses Redux Toolkit for state management:
- Store configuration in `src/store/index.ts`
- Audio state slice in `src/store/slices/audioSlice.ts`
- Typed hooks (`useAppDispatch`, `useAppSelector`) for type-safe Redux usage

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/
