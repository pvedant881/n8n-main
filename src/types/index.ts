export interface UserFile {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  uploadedAt: Date;
  extractedText: string;
  summary: string;
  tokenCount: number;
  fileSize: number;
}

export interface ChatRequest {
  userId: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  response: string;
  tokensUsed: number;
  filesReferenced: string[];
}

export interface FileUploadRequest {
  userId: string;
}

export interface ListFilesRequest {
  userId: string;
}

export interface DeleteFileRequest {
  userId: string;
  fileId: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  timestamp: string;
}
