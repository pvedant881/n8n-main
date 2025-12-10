import express from 'express';
import { prisma } from '../lib/prisma.js';

const router = express.Router();

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List all documents for the current user
 *     tags:
 *       - Documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UploadedDocument'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res, next) => {
  try {
    const documents = await prisma.uploadedDocument.findMany({
      where: { userId: req.user.id },
      include: { file: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags:
 *       - Documents
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
 *         description: Document details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedDocument'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.get('/:id', async (req, res, next) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({
      where: { id: req.params.id },
      include: { file: true },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   patch:
 *     summary: Update document metadata
 *     tags:
 *       - Documents
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
 *               extractedText:
 *                 type: string
 *               summary:
 *                 type: string
 *               documentType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadedDocument'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedDocument = await prisma.uploadedDocument.update({
      where: { id: req.params.id },
      data: {
        ...(req.body.extractedText !== undefined && { extractedText: req.body.extractedText }),
        ...(req.body.summary !== undefined && { summary: req.body.summary }),
        ...(req.body.documentType !== undefined && { documentType: req.body.documentType }),
      },
      include: { file: true },
    });

    res.json(updatedDocument);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a document
 *     tags:
 *       - Documents
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
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Document not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const document = await prisma.uploadedDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.uploadedDocument.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
