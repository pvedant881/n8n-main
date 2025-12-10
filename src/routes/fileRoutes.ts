import express, { Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/multerConfig';
import { fileService } from '../services/fileService';

const router = express.Router();

/**
 * POST /files/upload
 * Upload a single file or multiple files
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    const multerFile = (req as any).file;
    if (!multerFile) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE',
        timestamp: new Date().toISOString(),
      });
    }

    const { path: uploadPath, mimetype, size, originalname } = multerFile;

    // Generate summary from extracted text
    const extractedText = await fileService.extractText(uploadPath, mimetype);
    const summary = fileService.generateSummary(extractedText);

    // Store file metadata
    const userFile = await fileService.storeFile(userId, originalname, uploadPath, mimetype, size, summary);

    res.json({
      success: true,
      file: {
        id: userFile.id,
        filename: userFile.originalName,
        mimeType: userFile.mimeType,
        uploadedAt: userFile.uploadedAt,
        fileSize: userFile.fileSize,
        tokenCount: userFile.tokenCount,
        summary: userFile.summary,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /files/upload-multiple
 * Upload multiple files
 */
router.post('/upload-multiple', upload.array('files', 10), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    const multerFiles = (req as any).files;
    if (!multerFiles || multerFiles.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        code: 'NO_FILES',
        timestamp: new Date().toISOString(),
      });
    }

    const uploadedFiles = [];
    const errors = [];

    for (const file of multerFiles as Express.Multer.File[]) {
      try {
        const { path: uploadPath, mimetype, size, originalname } = file;

        // Generate summary from extracted text
        const extractedText = await fileService.extractText(uploadPath, mimetype);
        const summary = fileService.generateSummary(extractedText);

        // Store file metadata
        const userFile = await fileService.storeFile(userId, originalname, uploadPath, mimetype, size, summary);

        uploadedFiles.push({
          id: userFile.id,
          filename: userFile.originalName,
          mimeType: userFile.mimeType,
          uploadedAt: userFile.uploadedAt,
          fileSize: userFile.fileSize,
          tokenCount: userFile.tokenCount,
          summary: userFile.summary,
        });
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: (error as Error).message,
        });
      }
    }

    res.json({
      success: uploadedFiles.length > 0,
      uploadedFiles,
      errors,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /files/list
 * List all files for a user
 */
router.get('/list', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    const userFiles = fileService.getUserFiles(userId);

    res.json({
      success: true,
      files: userFiles.map((f) => ({
        id: f.id,
        filename: f.originalName,
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt,
        fileSize: f.fileSize,
        tokenCount: f.tokenCount,
        summary: f.summary,
      })),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /files/:fileId
 * Delete a file
 */
router.delete('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    const success = fileService.deleteFile(userId, fileId);

    if (!success) {
      return res.status(404).json({
        error: 'File not found',
        code: 'FILE_NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /files/:fileId
 * Get file details
 */
router.get('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    const file = fileService.getFile(userId, fileId);

    if (!file) {
      return res.status(404).json({
        error: 'File not found',
        code: 'FILE_NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      file: {
        id: file.id,
        filename: file.originalName,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt,
        fileSize: file.fileSize,
        tokenCount: file.tokenCount,
        summary: file.summary,
        extractedText: file.extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
