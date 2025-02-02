/**
 * Navigation bar component for application routing
 * Provides consistent navigation interface across all views
 * Related: App.tsx, pages/Home.tsx, pages/Recording.tsx
 * Navigation components in React handle routing and provide a consistent way for users to move between different views
 */

import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { Home, Mic, BarChart, File, Layers } from 'lucide-react';

/**
 * Navigation component implementation
 * Renders Material-UI AppBar with navigation buttons
 * Related: App.tsx, components/AudioRecorder.tsx
 * Material-UI components provide pre-built, customizable UI elements that follow Material Design principles
 */
export const Navigation: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            startIcon={<Home />}
          >
            Home
          </Button>
          <Button
            component={RouterLink}
            to="/record"
            color="inherit"
            startIcon={<Mic />}
          >
            Record
          </Button>
          <Button
            component={RouterLink}
            to="/codeflow"
            color="inherit"
            startIcon={<BarChart />}
          >
            Code Flow
          </Button>
          <Button
            component={RouterLink}
            to="/lld"
            color="inherit"
            startIcon={<File />}
          >
            Low Level Design
          </Button>
          <Button
            component={RouterLink}
            to="/hld"
            color="inherit"
            startIcon={<Layers />}
          >
            High Level Design
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};