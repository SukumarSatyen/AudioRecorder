# Services Directory

This directory contains core service modules that handle business logic and external integrations.

## Available Services

### 1. Storage Service (`storageService.ts`)

Handles all AWS S3 storage operations:

```typescript
interface StorageService {
  uploadToS3(file: Express.Multer.File): Promise<string>;
  deleteFromS3(key: string): Promise<void>;
  downloadFromS3(key: string): Promise<string>;
  cleanupTempFile(filePath: string): void;
}
```

Key Features:
- File upload to S3
- File deletion from S3
- File download from S3 to temp directory
- Automatic temporary file cleanup
- Unique file naming using UUID

### 2. Audio Service (`audioService.ts`)

Manages audio processing operations:

```typescript
interface AudioService {
  mergeAudioFiles(filePaths: string[]): Promise<string>;
  processAudio(files: Express.Multer.File[]): Promise<string>;
}
```

Key Features:
- Audio file merging using FFmpeg
- Multi-file processing
- Automatic cleanup of intermediate files
- Error handling for processing failures

## Service Architecture

```
services/
├── README.md
├── storageService.ts
└── audioService.ts
```

## Dependencies

1. **External Services**:
   - AWS S3 for file storage
   - FFmpeg for audio processing

2. **Node.js Packages**:
   - @aws-sdk/client-s3
   - uuid
   - fs (Node.js built-in)
   - path (Node.js built-in)

## Error Handling

All services implement:
- Proper error throwing
- Type checking
- Resource cleanup
- Logging

## Usage Examples

1. **Upload a File**:
```typescript
const key = await storageService.uploadToS3(file);
```

2. **Merge Audio Files**:
```typescript
const mergedFileKey = await audioService.processAudio(files);
```

3. **Delete a File**:
```typescript
await storageService.deleteFromS3(key);
```

## Best Practices

1. **Error Handling**:
   - Always use try-catch blocks
   - Clean up resources in finally blocks
   - Log errors appropriately

2. **File Management**:
   - Use unique file names
   - Clean up temporary files
   - Verify file existence before operations

3. **AWS Integration**:
   - Use environment variables for configuration
   - Implement proper error handling
   - Follow AWS best practices

## Testing

Services can be tested using:
1. Unit tests for individual functions
2. Integration tests for AWS operations
3. Mock S3 operations for local testing

## Future Improvements

1. **Storage Service**:
   - Add file compression
   - Implement file streaming
   - Add file validation

2. **Audio Service**:
   - Support more audio formats
   - Add audio quality settings
   - Implement waveform generation
   - Add audio chunk processing

## Contributing

When adding new services:
1. Follow the existing service pattern
2. Add proper TypeScript interfaces
3. Implement error handling
4. Add documentation
5. Include usage examples

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/
