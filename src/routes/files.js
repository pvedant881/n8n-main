import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../lib/prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10);

// Ensure upload directory exists
try {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
} catch (error) {
  console.error('Failed to create upload directory:', error);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userDir = path.join(UPLOAD_DIR, req.user.id);
    try {
      await fs.mkdir(userDir, { recursive: true });
      cb(null, userDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: List all files for the current user
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(files);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Upload a new file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               extractedText:
 *                 type: string
 *               summary:
 *                 type: string
 *               documentType:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 file:
 *                   $ref: '#/components/schemas/File'
 *                 document:
 *                   $ref: '#/components/schemas/UploadedDocument'
 *       400:
 *         description: No file provided
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large
 */
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const file = await prisma.file.create({
      data: {
        userId: req.user.id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        storagePath: req.file.path,
        fileSize: req.file.size,
      },
    });

    let document = null;
    if (req.body.extractedText || req.body.summary || req.body.documentType) {
      document = await prisma.uploadedDocument.create({
        data: {
          userId: req.user.id,
          fileId: file.id,
          extractedText: req.body.extractedText || null,
          summary: req.body.summary || null,
          documentType: req.body.documentType || null,
        },
      });
    }

    res.status(201).json({
      file,
      document,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Get file details by ID
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(file);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   patch:
 *     summary: Update file metadata
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalName:
 *                 type: string
 *     responses:
 *       200:
 *         description: File updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedFile = await prisma.file.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.originalName && { originalName: req.body.originalName }),
      },
    });

    res.json(updatedFile);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete physical file
    try {
      await fs.unlink(file.storagePath);
    } catch (error) {
      console.error('Failed to delete physical file:', error);
    }

    // Delete from database (cascades to UploadedDocument)
    await prisma.file.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/files/{id}/download:
 *   get:
 *     summary: Download a file
 *     tags:
 *       - Files
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File content
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: File not found
 */
router.get('/:id/download', async (req, res, next) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.download(file.storagePath, file.originalName);
  } catch (error) {
    next(error);
  }
});

export default router;
