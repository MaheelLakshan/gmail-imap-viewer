
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { isDevelopment } from '../config/env.config';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  details: unknown;
  isOperational: boolean;

  constructor(statusCode: number, message: string, details: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = 'Not found'): ApiError {
    return new ApiError(404, message);
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }
}

/**
 * Error handler middleware
 */
export const errorHandler = (err: Error | ApiError, req: Request, res: Response, _next: NextFunction): void => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
      details: (err as any).errors?.map((e: any) => ({
        field: e.path,
        message: e.message,
      })),
    });
    return;
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists',
    });
    return;
  }

  // Handle IMAP authentication errors
  if (err.message?.includes('AUTHENTICATIONFAILED')) {
    res.status(401).json({
      error: 'Authentication Failed',
      message: 'Gmail authentication failed. Please re-authenticate.',
    });
    return;
  }

  // Handle API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
    return;
  }

  // Default error response
  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Not found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

export default errorHandler;
