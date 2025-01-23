# Audio Processor Lambda Functions

This directory contains the serverless implementation of the audio processing service using AWS Lambda and the Serverless Framework.

## Architecture

The service is built using a serverless architecture with the following components:

- **AWS Lambda**: Serverless compute service
- **Amazon API Gateway**: Managed API endpoint service
- **Amazon S3**: Object storage for audio files
- **IAM Roles**: For secure access to AWS services

## Lambda Functions

1. **addAudio** (`/audio/add`)
   - Accepts audio file uploads
   - Stores files in S3 bucket
   - Returns a unique key for the uploaded file

2. **mergeAudio** (`/audio/merge`)
   - Accepts multiple audio file keys
   - Downloads files from S3
   - Merges audio files
   - Uploads merged result back to S3
   - Deletes original files
   - Returns key of merged file

3. **removeAudio** (`/audio/remove/{key}`)
   - Deletes specified audio file from S3

## Deployment

### Prerequisites

1. AWS CLI installed and configured with appropriate credentials
2. Node.js and npm installed
3. Serverless Framework installed globally:
   ```bash
   npm install -g serverless
   ```

### Installation

1. Install core dependencies:
   ```bash
   npm install
   ```

2. Install required TypeScript types and middleware:
   ```bash
   npm install @types/aws-lambda aws-lambda @middy/core @middy/http-json-body-parser uuid @types/uuid
   ```

3. Additional dependencies:
   - TypeScript configuration
   - AWS SDK for S3
   - Serverless plugins

### Configuration

1. Configure environment variables in `serverless.yml` or through AWS Parameter Store:
   - S3_BUCKET: Your S3 bucket name
   - AWS_REGION: Target AWS region

2. TypeScript Configuration:
   The project includes a `tsconfig.json` with:
   - AWS Lambda types
   - ES2020 target
   - Source map support
   - Strict type checking
   - Node.js module resolution

### Deploy

1. Deploy to dev environment:
   ```bash
   npm run deploy
   ```

2. Deploy to specific stage:
   ```bash
   npm run deploy -- --stage prod
   ```

3. Deploy to specific region:
   ```bash
   npm run deploy -- --region us-west-2
   ```

### Testing

After deployment, you can test the endpoints using the provided API Gateway URL:

```bash
# Add audio
curl -X POST https://your-api.execute-api.region.amazonaws.com/dev/audio/add \
  -H "Content-Type: application/json" \
  -d '{"audioData": "base64_encoded_audio", "contentType": "audio/wav"}'

# Merge audio
curl -X POST https://your-api.execute-api.region.amazonaws.com/dev/audio/merge \
  -H "Content-Type: application/json" \
  -d '{"audioKeys": ["key1", "key2"]}'

# Remove audio
curl -X DELETE https://your-api.execute-api.region.amazonaws.com/dev/audio/remove/your-audio-key
```

## Security

- IAM roles are configured with least privilege access
- CORS is enabled for API endpoints
- API Gateway provides request throttling
- S3 bucket policies restrict access to Lambda functions

## Limitations

1. Maximum audio file size: 6MB (API Gateway limit)
2. Lambda timeout: 30 seconds for merge operations
3. Concurrent executions: Based on AWS account limits

## Cost Optimization

The serverless architecture provides cost benefits:
- Pay only for actual usage
- No idle server costs
- Auto-scaling based on demand

## Monitoring

Monitor the application using:
- AWS CloudWatch Logs
- AWS X-Ray for tracing
- CloudWatch Metrics for performance monitoring

## Troubleshooting

Common issues and solutions:

1. **TypeScript Type Errors**:
   ```bash
   # Install required types
   npm install @types/aws-lambda @types/uuid
   ```

2. **Missing Dependencies**:
   ```bash
   # Install middleware and AWS Lambda runtime
   npm install aws-lambda @middy/core @middy/http-json-body-parser
   ```

3. **Build Errors**:
   - Check tsconfig.json configuration
   - Ensure all required dependencies are installed
   - Verify TypeScript version compatibility

## Future Improvements

1. Implement proper audio processing library for merging
2. Add support for different audio formats
3. Implement audio compression
4. Add waveform generation
5. Implement audio chunk processing for larger files
