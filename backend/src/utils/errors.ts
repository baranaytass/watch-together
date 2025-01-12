import { Request, Response, NextFunction } from 'express';

export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any,
    public errorCode?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, details, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 404, undefined, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, 401, undefined, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string) {
    super(message, 403, undefined, 'FORBIDDEN');
  }
}

export class BadRequestError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 400, details, 'BAD_REQUEST');
  }
}

export class ConflictError extends CustomError {
  constructor(message: string, details?: any) {
    super(message, 409, details, 'CONFLICT');
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 500, details, 'INTERNAL_SERVER_ERROR');
  }
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  if (error instanceof CustomError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.errorCode,
        details: error.details,
      },
    };
    return res.status(error.statusCode).json(response);
  }

  // Mongoose validation error handling
  if (error.name === 'ValidationError') {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: error.message,
      },
    };
    return res.status(400).json(response);
  }

  // MongoDB duplicate key error
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: 'Duplicate Entry',
        code: 'DUPLICATE_ERROR',
        details: error.message,
      },
    };
    return res.status(409).json(response);
  }

  // Default error response for unhandled errors
  const response: ErrorResponse = {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
  return res.status(500).json(response);
}; 