/**
 * Root application component with theme and routing setup
 * Entry point for the React application defining core layout and navigation
 * Related: components/Navigation.tsx, pages/Home.tsx, pages/Recording.tsx
 * The App component in React serves as the root component where the application's main structure and global providers are defined
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Home } from './pages/Home';
import { Recording } from './pages/Recording';
import { Navigation } from './pages/Navigation';
import CodeFlow from './pages/CodeFlow';
import LLD from './pages/LLD';
import HLD from './pages/HLD';

/**
 * Theme configuration for Material-UI
 * Defines consistent styling across the application
 * Related: components/Navigation.tsx, components/AudioRecorder.tsx
 * Material-UI's theme system allows for consistent styling and customization across all components
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

console.log('[App.tsx] Theme created with configuration:', { mode: theme.palette.mode });

/**
 * Main App component implementation
 * Wraps the application with necessary providers and routing
 * Related: store/index.ts, components/Navigation.tsx
 * React applications typically have a root component that sets up the application context and routing structure
 */
function App() {
  console.log('[App.tsx, App] Starting App component initialization');
  
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record" element={<Recording />} />
            <Route path="/codeflow" element={<CodeFlow />} />
            <Route path="/lld" element={<LLD />} />
            <Route path="/hld" element={<HLD />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

console.log('[App.tsx] App component defined and ready');

export default App;