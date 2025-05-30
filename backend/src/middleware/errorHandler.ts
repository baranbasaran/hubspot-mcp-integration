// src/middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ApiResponse } from '../utils/ApiResponse';

// Base application error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    public service: string,
    public originalError?: any
  ) {
    super(502, message, false);
    this.name = 'ExternalServiceError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, public originalError?: any) {
    super(500, message, false);
    this.name = 'DatabaseError';
  }
}

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req,
  res,
  next
): void => {
  // Log all errors
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    ...(err instanceof ExternalServiceError && { service: err.service }),
    ...(err instanceof ExternalServiceError && err.originalError && { originalError: err.originalError }),
    ...(err instanceof DatabaseError && err.originalError && { originalError: err.originalError })
  });

  // Handle known error types
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ApiResponse.error(
        err.message,
        // Only include error details in development
        process.env.NODE_ENV === 'development' && !err.isOperational
          ? err.stack
          : undefined
      )
    );
    return;
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json(
    ApiResponse.error(
      'An unexpected error occurred',
      isDevelopment ? err.stack : undefined
    )
  );
};