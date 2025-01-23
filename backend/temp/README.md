# Temporary Storage Directory

This directory is used for temporary file storage during audio processing operations.

## Purpose

The `temp` directory serves as a temporary storage location for:
1. Downloaded files from S3 before processing
2. Intermediate files during audio merging
3. Merged output files before uploading to S3

## How It Works

1. **File Download**
   - When files are downloaded from S3, they are stored here with unique UUIDs
   - Example: `123e4567-e89b-12d3-a456-426614174000-audio.wav`

2. **Audio Merging**
   - Multiple audio files are downloaded to this directory
   - FFmpeg processes these files
   - A new merged file is created here
   - Example: `345e6789-e89b-12d3-a456-426614174000-merged.wav`

3. **Cleanup**
   - Files are automatically deleted after processing
   - The `cleanupTempFile` function handles deletion
   - No manual cleanup required

## Directory Structure

```
temp/
├── README.md
└── ... (temporary files that are automatically managed)
```

## Important Notes

1. **Do Not Store Permanent Files**
   - This directory is for temporary storage only
   - All files should be considered temporary
   - Files may be deleted at any time

2. **Automatic Management**
   - Directory is created automatically if it doesn't exist
   - Files are cleaned up automatically after use
   - No manual intervention needed

3. **Storage Limits**
   - Monitor disk space usage
   - Large files are handled in chunks
   - Temporary files are deleted promptly

## Security Considerations

1. Files in this directory are:
   - Temporary
   - Not publicly accessible
   - Automatically cleaned up
   - Given unique names to prevent conflicts

2. Do not store sensitive information here

## Troubleshooting

If you encounter issues:
1. Ensure the directory has proper permissions
2. Check disk space availability
3. Verify that cleanup functions are working
4. Monitor for any lingering files

(c) Sukumar Satyen 2005 CC-BY-NC-ND

This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.

This means:
- Attribution (BY): You must give appropriate credit to the author
- NonCommercial (NC): You may not use this work for commercial purposes
- NoDerivatives (ND): You may not create derivative works or modify this work

For more details, visit: https://creativecommons.org/licenses/by-nc-nd/4.0/
