/**
 * Platform-independent path configuration for file storage
 * Critical for ensuring consistent file access across different operating systems
 * Used by audioRoutes.ts and storageService.ts for file operations
 * @see {@link https://nodejs.org/api/path.html} - Node.js Path Module
 */

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Write permission validation for directory access
 * Essential for ensuring storage operations can proceed
 * Used by getRootDir and path utility functions
 * @see {@link https://nodejs.org/api/fs.html#fs_file_access_constants} - Node.js File Access
 */
const hasWritePermission = (dir: string): boolean => {
  try {
    // Try to create a temporary file to test write permissions
    const testFile = path.join(dir, `.write-test-${Date.now()}`);
    fs.writeFileSync(testFile, '');
    fs.unlinkSync(testFile);
    return true;
  } catch {
    return false;
  }
};

/**
 * Platform-specific root directory determination
 * Ensures application has valid writable storage location
 * Used by getUploadsDir for storage path resolution
 * @see {@link https://nodejs.org/api/os.html#os_os_platform} - Node.js OS Platform
 */
const getRootDir = (): string => {
  if (process.platform === 'win32') {
    // On Windows, check drives with write permissions
    const cDrive = 'C:';
    try {
      fs.accessSync(cDrive);
      if (hasWritePermission(cDrive)) {
        return cDrive;
      }
      throw new Error('No write permission on C:');
    } catch {
      // If C: is not accessible or writable, use the home directory's drive
      const homeDrive = path.parse(os.homedir()).root;
      const driveLetter = homeDrive.slice(0, 2); // Get just the drive letter part (e.g., "D:")
      if (hasWritePermission(driveLetter)) {
        return driveLetter;
      }
      // If neither root nor home drive is writable, fall back to user's home directory
      return path.parse(os.homedir()).dir;
    }
  }
  // For Unix-like systems (Linux, macOS)
  if (hasWritePermission('/')) {
    return '';
  }
  // If root is not writable, fall back to user's home directory
  return os.homedir();
};

/**
 * Uploads directory path resolution
 * Provides consistent path for file uploads across platforms
 * Used by audioRoutes.ts for file storage location
 * @see {@link https://nodejs.org/api/path.html#path_path_join_paths} - Node.js Path Join
 */
export const getUploadsDir = (): string => {
  // Always try home directory first for consistent behavior
  let uploadsPath = path.join(os.homedir(), 'uploads');
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    // Verify we can write to the created directory
    if (!hasWritePermission(uploadsPath)) {
      throw new Error('No write permission for home directory uploads');
    }
    return uploadsPath;
  } catch (error) {
    console.warn(`Warning: Could not use home directory ${uploadsPath}, trying system locations`);
    
    // Fall back to original approach using getRootDir
    const root = getRootDir();
    
    if (process.platform === 'win32') {
      // For Windows, check if root is a drive letter or home directory
      uploadsPath = root.endsWith(':') 
        ? path.join(root, 'uploads')
        : path.join(root, 'uploads');
    } else {
      // For Unix-like systems
      uploadsPath = root === '' 
        ? '/uploads'  // Root level
        : path.join(root, 'uploads');  // Home directory
    }

    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }
      // Verify we can write to the created directory
      if (!hasWritePermission(uploadsPath)) {
        throw new Error('No write permission for uploads directory');
      }
    } catch (fallbackError) {
      // If both approaches fail, make one final attempt with home directory
      console.warn(`Warning: Could not use ${uploadsPath}, falling back to home directory`);
      uploadsPath = path.join(os.homedir(), 'uploads');
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }
    }
    
    return uploadsPath;
  }
};

/**
 * Recordings directory path resolution
 * Manages audio recording storage within uploads directory
 * Used by audioRoutes.ts for audio file organization
 * @see {@link https://nodejs.org/api/path.html#path_path_resolve_paths} - Node.js Path Resolve
 */
export const getRecordingsDir = (): string => {
  const recordingsPath = path.join(getUploadsDir(), 'recordings');
  
  try {
    // Create directory if it doesn't exist
    if (!fs.existsSync(recordingsPath)) {
      fs.mkdirSync(recordingsPath, { recursive: true });
    }
    // Verify we can write to the created directory
    if (!hasWritePermission(recordingsPath)) {
      throw new Error('No write permission for recordings directory');
    }
  } catch (error) {
    // If we can't create or write to the directory, fall back to user's home
    const fallbackPath = path.join(os.homedir(), 'uploads', 'recordings');
    console.warn(`Warning: Could not use ${recordingsPath}, falling back to ${fallbackPath}`);
    if (!fs.existsSync(fallbackPath)) {
      fs.mkdirSync(fallbackPath, { recursive: true });
    }
    return fallbackPath;
  }
  
  return recordingsPath;
};
