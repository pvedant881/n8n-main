import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('File Management', () => {
  let userId;
  let fileId;
  const testEmail = `test-file-${Date.now()}@example.com`;
  const testPassword = 'password123';

  beforeAll(async () => {
    const hashedPassword = await bcryptjs.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Clean up files and documents
    if (fileId) {
      await prisma.file.delete({ where: { id: fileId } }).catch(() => {});
    }
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  });

  it('should create a file record', async () => {
    const file = await prisma.file.create({
      data: {
        userId,
        originalName: 'test.pdf',
        mimeType: 'application/pdf',
        storagePath: './uploads/test.pdf',
        fileSize: 102400,
      },
    });

    expect(file).toBeDefined();
    expect(file.userId).toBe(userId);
    expect(file.originalName).toBe('test.pdf');
    fileId = file.id;
  });

  it('should retrieve file by ID', async () => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    expect(file).toBeDefined();
    expect(file.id).toBe(fileId);
    expect(file.userId).toBe(userId);
  });

  it('should list all files for user', async () => {
    const files = await prisma.file.findMany({
      where: { userId },
    });

    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.id === fileId)).toBe(true);
  });

  it('should update file metadata', async () => {
    const newName = 'updated-test.pdf';
    const file = await prisma.file.update({
      where: { id: fileId },
      data: { originalName: newName },
    });

    expect(file.originalName).toBe(newName);
  });

  it('should create related document', async () => {
    const document = await prisma.uploadedDocument.create({
      data: {
        userId,
        fileId,
        extractedText: 'This is extracted text from the PDF',
        summary: 'This is a summary of the document',
        documentType: 'invoice',
      },
    });

    expect(document).toBeDefined();
    expect(document.fileId).toBe(fileId);
    expect(document.userId).toBe(userId);
    expect(document.documentType).toBe('invoice');
  });

  it('should query file with related document', async () => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { document: true },
    });

    expect(file.document).toBeDefined();
    expect(file.document.extractedText).toBeTruthy();
  });

  it('should verify user ownership of file', async () => {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    expect(file.userId).toBe(userId);
  });

  it('should delete document', async () => {
    const document = await prisma.uploadedDocument.findFirst({
      where: { fileId },
    });

    if (document) {
      await prisma.uploadedDocument.delete({
        where: { id: document.id },
      });

      const deleted = await prisma.uploadedDocument.findUnique({
        where: { id: document.id },
      }).catch(() => null);

      expect(deleted).toBeNull();
    }
  });
});
