import express, { Request, Response, NextFunction } from 'express';
import { openaiService } from '../services/openaiService';
import { fileService } from '../services/fileService';

const router = express.Router();

// Rate limiting store: userId -> { count, timestamp }
const requestCounts = new Map<string, { count: number; timestamp: number }>();

/**
 * POST /chat
 * Chat endpoint that uses uploaded files as context
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, prompt, maxTokens, temperature } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'prompt is required and must be a non-empty string',
        code: 'MISSING_PROMPT',
        timestamp: new Date().toISOString(),
      });
    }

    // Check rate limiting
    if (!openaiService.checkRateLimit(userId, requestCounts)) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
    }

    // Get user files
    const userFiles = fileService.getUserFiles(userId);

    // Call OpenAI Chat API
    const chatResult = await openaiService.chat(
      prompt,
      userFiles,
      maxTokens || 1000,
      temperature || 0.7
    );

    res.json({
      success: true,
      response: chatResult.response,
      tokensUsed: chatResult.tokensUsed,
      filesReferenced: chatResult.filesReferenced,
    });
  } catch (error) {
    const appError = error as Record<string, unknown>;
    const message = typeof appError.message === 'string' ? appError.message : '';

    // Handle specific error cases
    if (message.includes('rate_limit_exceeded')) {
      return res.status(429).json({
        error: 'OpenAI rate limit exceeded. Please try again later.',
        code: 'OPENAI_RATE_LIMIT',
        timestamp: new Date().toISOString(),
      });
    }

    if (message.includes('exceeds maximum token limit')) {
      return res.status(400).json({
        error: message,
        code: 'TOKEN_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      });
    }

    if (message.includes('OPENAI_API_KEY')) {
      return res.status(500).json({
        error: 'OpenAI API key is not configured',
        code: 'OPENAI_CONFIG_ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    next(error);
  }
});

/**
 * GET /chat/history
 * Get chat history for a user (placeholder for future implementation)
 */
router.get('/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'userId is required',
        code: 'MISSING_USER_ID',
        timestamp: new Date().toISOString(),
      });
    }

    // For now, return empty history
    // In production, this would fetch from a database
    res.json({
      success: true,
      history: [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
