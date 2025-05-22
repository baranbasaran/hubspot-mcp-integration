// src/middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req,
  res,
  next
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode)
      .json(ApiResponse.error(err.message));
    return;
  }

  console.error('❌ Unhandled error:', err);
  res.status(500)
    .json(ApiResponse.error('Internal server error'));
};