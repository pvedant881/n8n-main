# Backend Auth & Storage API

A comprehensive backend system for user authentication, file storage, and document management using Express.js, Prisma, and SQLite.

## Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Password Security**: Bcrypt password hashing
- **Token Refresh**: Refresh JWT tokens without re-authenticating
- **File Management**: Upload, download, and manage files with metadata
- **Document Management**: Store extracted text, summaries, and document types
- **Access Control**: Per-user file and document access control
- **File Storage**: Secure local file storage with user-specific directories
- **API Documentation**: OpenAPI/Swagger documentation available at `/api-docs`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Create and seed the database:
```bash
npm run prisma:migrate
npm run prisma:seed
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Server
PORT=3000
NODE_ENV="development"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800  # 50MB in bytes
```

### Required Variables

- **DATABASE_URL**: SQLite database file path (must use `file:` protocol)
- **JWT_SECRET**: Secret key for signing JWT tokens (minimum 32 characters recommended)
- **PORT**: Server port (default: 3000)

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start with automatic reload on file changes.

### Production Mode

```bash
npm start
```

## Database Setup

### Create and Run Migrations

```bash
npm run prisma:migrate
```

This command will:
1. Create the SQLite database file
2. Run all pending migrations
3. Generate the Prisma Client

### View Database (Prisma Studio)

```bash
npm run prisma:studio
```

Opens an interactive GUI to view and edit database records.

## API Endpoints

### Authentication

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "token": "new-jwt-token"
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "message": "Logout successful"
}
```

### Files

#### List User's Files
```bash
GET /api/files
Authorization: Bearer <token>
```

**Response (200)**:
```json
[
  {
    "id": "file-id",
    "userId": "user-id",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "storagePath": "./uploads/user-id/filename",
    "fileSize": 102400,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Upload File
```bash
POST /api/files
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary file data>
extractedText: (optional) extracted text from file
summary: (optional) summary of the document
documentType: (optional) type of document
```

**Response (201)**:
```json
{
  "file": {
    "id": "file-id",
    "userId": "user-id",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "storagePath": "./uploads/user-id/filename",
    "fileSize": 102400,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "document": {
    "id": "doc-id",
    "userId": "user-id",
    "fileId": "file-id",
    "extractedText": "...",
    "summary": "...",
    "documentType": "pdf",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get File Details
```bash
GET /api/files/{id}
Authorization: Bearer <token>
```

#### Update File
```bash
PATCH /api/files/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "originalName": "new-filename.pdf"
}
```

#### Download File
```bash
GET /api/files/{id}/download
Authorization: Bearer <token>
```

#### Delete File
```bash
DELETE /api/files/{id}
Authorization: Bearer <token>
```

### Documents

#### List User's Documents
```bash
GET /api/documents
Authorization: Bearer <token>
```

#### Get Document Details
```bash
GET /api/documents/{id}
Authorization: Bearer <token>
```

#### Update Document Metadata
```bash
PATCH /api/documents/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "extractedText": "...",
  "summary": "...",
  "documentType": "invoice"
}
```

#### Delete Document
```bash
DELETE /api/documents/{id}
Authorization: Bearer <token>
```

## Database Schema

### User Model
```
- id: String (Primary Key)
- email: String (Unique)
- password: String (Hashed)
- createdAt: DateTime
- updatedAt: DateTime
- files: File[] (Relation)
- documents: UploadedDocument[] (Relation)
```

### File Model
```
- id: String (Primary Key)
- userId: String (Foreign Key)
- originalName: String
- mimeType: String
- storagePath: String
- fileSize: Int
- createdAt: DateTime
- updatedAt: DateTime
- user: User (Relation)
- document: UploadedDocument? (Relation)
```

### UploadedDocument Model
```
- id: String (Primary Key)
- userId: String (Foreign Key)
- fileId: String (Foreign Key, Unique)
- extractedText: String? (Nullable)
- summary: String? (Nullable)
- documentType: String? (Nullable)
- createdAt: DateTime
- updatedAt: DateTime
- user: User (Relation)
- file: File (Relation)
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds of 10
2. **JWT Authentication**: Token-based authentication for all protected endpoints
3. **Access Control**: Per-user ownership verification for files and documents
4. **File Storage**: Files are stored in user-specific directories
5. **CORS**: CORS is enabled for cross-origin requests
6. **Error Handling**: Comprehensive error handling with appropriate HTTP status codes

## Testing

To manually test the API:

1. Start the server:
```bash
npm run dev
```

2. Access the API documentation:
```
http://localhost:3000/api-docs
```

3. Test endpoints using cURL or a tool like Postman:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual JWT)
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

# List files
curl -X GET http://localhost:3000/api/files \
  -H "Authorization: Bearer TOKEN"

# Upload a file
curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "documentType=pdf"
```

## Directory Structure

```
.
├── src/
│   ├── index.js                 # Main application file
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── files.js            # File management endpoints
│   │   └── documents.js        # Document management endpoints
│   └── lib/
│       └── prisma.js           # Prisma client instance
├── prisma/
│   └── schema.prisma           # Database schema definition
├── uploads/                    # User file storage (created at runtime)
├── .env.example                # Example environment variables
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies
└── README.md                   # This file
```

## Error Handling

The API returns appropriate HTTP status codes:

- **200**: Successful GET, PATCH, POST (logout)
- **201**: Successful POST (create)
- **400**: Bad request (missing fields, validation error)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (access denied to resource)
- **404**: Not found
- **413**: Payload too large (file size exceeds limit)
- **500**: Internal server error

## Development Notes

### Adding New Routes

1. Create a new file in `src/routes/`
2. Import it in `src/index.js`
3. Register it with `app.use()`
4. Add Swagger/OpenAPI documentation using JSDoc comments

### Database Migrations

When making schema changes:

1. Update `prisma/schema.prisma`
2. Run `npm run prisma:migrate`
3. Follow the prompts to name the migration

### JWT Token Management

- Tokens expire after the `JWT_EXPIRES_IN` period
- Use the `/api/auth/refresh` endpoint to get a new token
- Include token in `Authorization: Bearer <token>` header for protected endpoints

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is set correctly in `.env`
- Check that the database file path is writable
- Try deleting the database file and running migrations again

### File Upload Issues
- Check that `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` is large enough for your files
- Ensure multer storage is configured correctly

### JWT Issues
- Verify `JWT_SECRET` is set in `.env`
- Check token expiration with JWT decoder tools
- Use `/api/auth/refresh` to get new tokens

## License

ISC
