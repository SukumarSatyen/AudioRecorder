/**
 * Recording page component with audio recording interface
 * Main recording interface providing access to audio recording features
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts, components/Navigation.tsx
 * Page components in React organize related functionality into cohesive views
 */

import React from 'react';
import { Container, Paper } from '@mui/material';
import { AudioRecorder } from '../components/AudioRecorder';
import { motion } from 'framer-motion';

/**
 * Recording page implementation
 * Container for audio recording functionality
 * Related: components/AudioRecorder.tsx, store/slices/audioSlice.ts
 * Container components in React provide layout and data management for feature-specific components
 */
export const Recording: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 3 }}>
          <AudioRecorder />
        </Paper>
      </motion.div>
    </Container>
  );
};