import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error: AppError = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = createError(`Validation error: ${message}`, 400, 'VALIDATION_ERROR');
  }

  // Supabase errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error = createError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
        break;
      case '23503': // Foreign key violation
        error = createError('Referenced resource not found', 400, 'INVALID_REFERENCE');
        break;
      case '23502': // Not null violation
        error = createError('Required field missing', 400, 'MISSING_FIELD');
        break;
      case 'PGRST116': // No rows returned
        error = createError('Resource not found', 404, 'NOT_FOUND');
        break;
      default:
        if (err.message.includes('JWT')) {
          error = createError('Invalid or expired token', 401, 'INVALID_TOKEN');
        }
        break;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = createError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Mongoose/Database errors
  if (err.name === 'CastError') {
    error = createError('Invalid resource ID', 400, 'INVALID_ID');
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err,
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};

// Validation middleware
export const validateRequest = (schema: any, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req[property]);
      req[property] = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  isOperational = true;

  constructor(message: string = 'Access forbidden') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InsufficientFundsError extends Error {
  statusCode = 400;
  code = 'INSUFFICIENT_FUNDS';
  isOperational = true;

  constructor(message: string = 'Insufficient balance') {
    super(message);
    this.name = 'InsufficientFundsError';
  }
}