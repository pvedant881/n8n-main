# File Parsing & OpenAI Chat API

A Node.js/Express backend API that enables users to upload multiple file types (CSV, DOCX, TXT), extract their content, and use them as context for OpenAI Chat Completions API interactions.

## Features

- **Multi-format File Upload**: Support for CSV, DOCX (Word documents), and TXT files
- **Text Extraction**: Automatic text extraction from uploaded files using specialized libraries
- **File Management**: List, retrieve, and delete uploaded files
- **AI-Powered Chat**: Chat endpoint that uses uploaded file content as context for OpenAI responses
- **Rate Limiting**: Built-in rate limiting to prevent abuse
- **Token Management**: Token count estimation and validation
- **Error Handling**: Comprehensive error handling with meaningful error messages
- **Retry Logic**: Automatic retry mechanism for OpenAI API calls

## Supported File Types

- **CSV** (.csv) - Comma-separated values
- **DOCX** (.docx) - Microsoft Word documents
- **TXT** (.txt) - Plain text files

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the project root:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
MAX_TOKENS_PER_REQUEST=4000
UPLOAD_DIR=./uploads
```

## Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## API Endpoints

### File Management

#### Upload a File
```
POST /files/upload
Content-Type: multipart/form-data

Parameters:
- file: (required) File to upload
- userId: (required) User identifier
```

#### Upload Multiple Files
```
POST /files/upload-multiple
Content-Type: multipart/form-data

Parameters:
- files: (required) Array of files to upload (up to 10)
- userId: (required) User identifier
```

#### List User Files
```
GET /files/list?userId=user123
```

#### Get File Details
```
GET /files/:fileId?userId=user123
```

#### Delete a File
```
DELETE /files/:fileId?userId=user123
```

### Chat

#### Send Chat Message
```
POST /chat
Content-Type: application/json

Body:
{
  "userId": "user123",
  "prompt": "What is in the documents?",
  "maxTokens": 1000,
  "temperature": 0.7
}
```

#### Get Chat History
```
GET /chat/history?userId=user123
```

### Health Check
```
GET /health
```

## Response Examples

### Successful File Upload
```json
{
  "success": true,
  "file": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document.docx",
    "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "fileSize": 2048,
    "tokenCount": 512,
    "summary": "This document contains information about..."
  }
}
```

### Successful Chat Response
```json
{
  "success": true,
  "response": "Based on your uploaded documents, here is the information...",
  "tokensUsed": 250,
  "filesReferenced": ["document1.docx", "document2.csv"]
}
```

### Error Response
```json
{
  "error": "Invalid file type. Allowed types: CSV, TXT, DOCX",
  "code": "FILE_TYPE_ERROR",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Codes

- `MISSING_USER_ID` - User ID is required but not provided
- `NO_FILE` / `NO_FILES` - No files were uploaded
- `FILE_NOT_FOUND` - Requested file does not exist
- `FILE_TYPE_ERROR` - Invalid file type
- `RATE_LIMIT_EXCEEDED` - Rate limit has been exceeded
- `TOKEN_LIMIT_EXCEEDED` - Request exceeds maximum token limit
- `OPENAI_CONFIG_ERROR` - OpenAI API key is not configured
- `OPENAI_RATE_LIMIT` - OpenAI API rate limit exceeded

## Development

### Code Style

The project uses ESLint and Prettier for code quality:

```bash
npm run lint
npm run format
```

### Type Safety

Full TypeScript support with strict mode enabled.

## Dependencies

- **express** - Web framework
- **openai** - OpenAI API client
- **multer** - File upload handling
- **mammoth** - DOCX text extraction
- **csv-parse** - CSV parsing
- **dotenv** - Environment variable management
- **uuid** - Unique ID generation

## Token Limits

- Maximum tokens per request: 4000 (configurable via `MAX_TOKENS_PER_REQUEST`)
- Rate limiting: 100 requests per 15 minutes (configurable)

## Error Handling

The API includes:
- Request validation
- File type validation
- Token limit checks
- Rate limiting
- Automatic retries for OpenAI API calls (up to 3 attempts)
- Comprehensive error messages

## Future Enhancements

- Database integration for persistent storage
- Chat history tracking
- Advanced summarization techniques
- Streaming responses
- Advanced rate limiting strategies
- File compression support
- Batch processing
