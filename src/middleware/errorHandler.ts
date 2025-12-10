import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

interface AppError extends Error {
  code?: string;
  status?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  const errorResponse: ErrorResponse = {
    error: message,
    code,
    timestamp: new Date().toISOString(),
  };

  console.error(`[${new Date().toISOString()}] ${code}: ${message}`, {
    stack: err.stack,
  });

  res.status(status).json(errorResponse);
};

export default errorHandler;
