# Manual Testing Guide

This guide demonstrates how to test the Backend Auth & Storage API manually using curl commands.

## Prerequisites

1. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

2. Open API Swagger documentation:
```
http://localhost:3000/api-docs
```

## Test Scenarios

### 1. User Registration

Register a new user with email and password:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

**Expected Response (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "newuser@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### 2. User Login

Login with the same credentials:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

**Expected Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "newuser@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

Save the token for use in subsequent requests.

### 3. Get Current User Information

Get the profile of the authenticated user:

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
{
  "id": "user-id",
  "email": "newuser@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### 4. Token Refresh

Refresh the JWT token to get a new one:

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
{
  "token": "new-jwt-token-here"
}
```

### 5. Upload a File

Upload a file with optional metadata:

```bash
TOKEN="your-jwt-token-here"

# Create a test file
echo "This is a test document" > test-doc.txt

curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-doc.txt" \
  -F "extractedText=This is test content" \
  -F "summary=A simple test document" \
  -F "documentType=text"
```

**Expected Response (201)**:
```json
{
  "file": {
    "id": "file-id",
    "userId": "user-id",
    "originalName": "test-doc.txt",
    "mimeType": "text/plain",
    "storagePath": "./uploads/user-id/filename",
    "fileSize": 23,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "document": {
    "id": "doc-id",
    "userId": "user-id",
    "fileId": "file-id",
    "extractedText": "This is test content",
    "summary": "A simple test document",
    "documentType": "text",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

Save the file ID for use in subsequent requests.

### 6. List User's Files

Get all files uploaded by the user:

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/files \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
[
  {
    "id": "file-id",
    "userId": "user-id",
    "originalName": "test-doc.txt",
    "mimeType": "text/plain",
    "storagePath": "./uploads/user-id/filename",
    "fileSize": 23,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### 7. Get File Details

Get details of a specific file:

```bash
TOKEN="your-jwt-token-here"
FILE_ID="file-id-from-previous-step"

curl -X GET http://localhost:3000/api/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 8. Update File Metadata

Update the filename of a file:

```bash
TOKEN="your-jwt-token-here"
FILE_ID="file-id-from-previous-step"

curl -X PATCH http://localhost:3000/api/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "originalName": "updated-filename.txt"
  }'
```

### 9. Download File

Download a file:

```bash
TOKEN="your-jwt-token-here"
FILE_ID="file-id-from-previous-step"

curl -X GET http://localhost:3000/api/files/$FILE_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded-file.txt
```

### 10. List Documents

Get all documents with their metadata:

```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
[
  {
    "id": "doc-id",
    "userId": "user-id",
    "fileId": "file-id",
    "extractedText": "Document content here...",
    "summary": "Document summary here...",
    "documentType": "text",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "file": {
      "id": "file-id",
      "userId": "user-id",
      "originalName": "test-doc.txt",
      "mimeType": "text/plain",
      "storagePath": "./uploads/user-id/filename",
      "fileSize": 23,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
]
```

### 11. Update Document Metadata

Update extracted text or summary for a document:

```bash
TOKEN="your-jwt-token-here"
DOC_ID="doc-id-from-previous-step"

curl -X PATCH http://localhost:3000/api/documents/$DOC_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extractedText": "Updated extracted content",
    "summary": "Updated summary",
    "documentType": "invoice"
  }'
```

### 12. Delete File

Delete a file (and its associated document):

```bash
TOKEN="your-jwt-token-here"
FILE_ID="file-id-from-previous-step"

curl -X DELETE http://localhost:3000/api/files/$FILE_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
{
  "message": "File deleted successfully"
}
```

### 13. Delete Document

Delete just the document metadata:

```bash
TOKEN="your-jwt-token-here"
DOC_ID="doc-id-from-previous-step"

curl -X DELETE http://localhost:3000/api/documents/$DOC_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 14. Logout

Logout the user (invalidates the token):

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response (200)**:
```json
{
  "message": "Logout successful"
}
```

## Testing Access Control

### Verify Per-User Access Control

1. Create two different users
2. Have user 1 upload a file
3. Try to access user 1's file with user 2's token

```bash
# This should return 403 Forbidden
TOKEN_USER2="user2-jwt-token"
FILE_ID_USER1="file-id-from-user1"

curl -X GET http://localhost:3000/api/files/$FILE_ID_USER1 \
  -H "Authorization: Bearer $TOKEN_USER2"
```

**Expected Response (403)**:
```json
{
  "error": "Access denied"
}
```

## Testing Error Scenarios

### Invalid Token
```bash
curl -X GET http://localhost:3000/api/files \
  -H "Authorization: Bearer invalid-token"
```
**Expected Response (403)**: `{"error": "Invalid or expired token"}`

### Missing Token
```bash
curl -X GET http://localhost:3000/api/files
```
**Expected Response (401)**: `{"error": "Access token required"}`

### Invalid Credentials
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "wrongpassword"
  }'
```
**Expected Response (401)**: `{"error": "Invalid credentials"}`

### Duplicate Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "password123"
  }'
```
**Expected Response (400)**: `{"error": "User already exists"}`

## Automated Testing

Run the automated tests:

```bash
npm test
```

This runs all tests in `src/tests/` directory using Vitest.

## Database Inspection

To inspect the database contents:

```bash
npm run prisma:studio
```

This opens an interactive GUI where you can view and edit all records.

## Pre-seeded Test Data

The database comes with pre-seeded test data:

- **User 1**: `test@example.com` / `password123`
- **User 2**: `another@example.com` / `securepass456`
- **Sample File**: `sample-document.pdf` (uploaded by user 1)
- **Sample Document**: Extracted text and summary for the sample file

You can use these credentials to test the API without registering new users.
