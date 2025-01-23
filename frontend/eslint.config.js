// Import the base ESLint configuration for JavaScript
import js from '@eslint/js';

// Import predefined global variables for different environments (browser, node, etc.)
import globals from 'globals';

// Import ESLint rules for React Hooks to enforce hooks usage patterns
import reactHooks from 'eslint-plugin-react-hooks';

// Import plugin for React Fast Refresh to ensure proper component exports
import reactRefresh from 'eslint-plugin-react-refresh';

// Import TypeScript ESLint configuration for TypeScript-specific linting
import tseslint from 'typescript-eslint';

// Export the complete ESLint configuration using TypeScript ESLint's config builder
export default tseslint.config(
  // First configuration object: ignore patterns
  { ignores: ['dist'] }, // Ignore the dist directory which contains built files

  // Second configuration object: main ESLint settings
  {
    // Extend recommended configurations from both JavaScript and TypeScript ESLint
    extends: [js.configs.recommended, ...tseslint.configs.recommended],

    // Apply these rules to TypeScript and TSX files only
    files: ['**/*.{ts,tsx}'],

    // Language options for parsing and global variables
    languageOptions: {
      ecmaVersion: 2020, // Use ECMAScript 2020 features
      globals: globals.browser, // Include browser global variables (window, document, etc.)
    },

    // Configure ESLint plugins for React development
    plugins: {
      'react-hooks': reactHooks, // Enable React Hooks linting
      'react-refresh': reactRefresh, // Enable Fast Refresh linting
    },

    // Specific rule configurations
    rules: {
      // Include all recommended React Hooks rules
      ...reactHooks.configs.recommended.rules,

      // Configure Fast Refresh rule to allow constant exports
      'react-refresh/only-export-components': [
        'warn', // Set rule severity to warning
        { allowConstantExport: true }, // Allow exporting constants alongside components
      ],
    },
  }
);

// ESLint configuration is specifically tailored for:

// TypeScript React development
// Modern JavaScript features (ECMAScript 2020)
// React Hooks and Fast Refresh support
// Browser-based development