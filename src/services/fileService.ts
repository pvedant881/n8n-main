import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { UserFile } from '../types';

const filesStore: Map<string, UserFile[]> = new Map();

export const fileService = {
  /**
   * Extract text from different file types
   */
  async extractText(filePath: string, mimeType: string): Promise<string> {
    if (mimeType === 'text/csv' || mimeType === 'text/plain' && filePath.endsWith('.csv')) {
      return this.extractCsvText(filePath);
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filePath.endsWith('.docx')
    ) {
      return this.extractDocxText(filePath);
    } else if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
      return this.extractTextFile(filePath);
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  },

  /**
   * Extract text from CSV file
   */
  extractCsvText(filePath: string): string {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      return records
        .map((record: Record<string, string>) =>
          Object.entries(record)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        )
        .join('\n');
    } catch (error) {
      throw new Error(`Failed to extract CSV text: ${(error as Error).message}`);
    }
  },

  /**
   * Extract text from DOCX file
   */
  async extractDocxText(filePath: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract DOCX text: ${(error as Error).message}`);
    }
  },

  /**
   * Extract text from plain text file
   */
  extractTextFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to extract text file: ${(error as Error).message}`);
    }
  },

  /**
   * Store file metadata and extracted content
   */
  async storeFile(
    userId: string,
    originalName: string,
    uploadPath: string,
    mimeType: string,
    fileSize: number,
    summary: string
  ): Promise<UserFile> {
    const extractedText = await this.extractText(uploadPath, mimeType);
    const tokenCount = this.estimateTokenCount(extractedText);

    const userFile: UserFile = {
      id: uuidv4(),
      userId,
      filename: path.basename(uploadPath),
      originalName,
      mimeType,
      uploadedAt: new Date(),
      extractedText,
      summary,
      tokenCount,
      fileSize,
    };

    // Store in memory (in production, use a database)
    if (!filesStore.has(userId)) {
      filesStore.set(userId, []);
    }
    filesStore.get(userId)!.push(userFile);

    return userFile;
  },

  /**
   * Get all files for a user
   */
  getUserFiles(userId: string): UserFile[] {
    return filesStore.get(userId) || [];
  },

  /**
   * Delete a file
   */
  deleteFile(userId: string, fileId: string): boolean {
    const userFiles = filesStore.get(userId);
    if (!userFiles) {
      return false;
    }

    const index = userFiles.findIndex((f) => f.id === fileId);
    if (index === -1) {
      return false;
    }

    const file = userFiles[index];
    userFiles.splice(index, 1);

    // Delete physical file
    try {
      if (fs.existsSync(file.filename)) {
        fs.unlinkSync(file.filename);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${(error as Error).message}`);
    }

    return true;
  },

  /**
   * Get file by ID
   */
  getFile(userId: string, fileId: string): UserFile | undefined {
    const userFiles = filesStore.get(userId);
    return userFiles?.find((f) => f.id === fileId);
  },

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  },

  /**
   * Chunk text for processing
   */
  chunkText(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const words = text.split(/\s+/);
    for (const word of words) {
      if ((currentChunk + word).length > chunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = word;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + word;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  },

  /**
   * Generate summary from extracted text (basic implementation)
   */
  generateSummary(text: string): string {
    const lines = text.split('\n').filter((line) => line.trim());
    const summary = lines.slice(0, 5).join(' ');
    return summary.substring(0, 200) + (summary.length > 200 ? '...' : '');
  },
};
