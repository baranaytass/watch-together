export class CustomError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (error: Error, req: any, res: any, next: any) => {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
  }

  console.error('Unhandled error:', error);
  return res.status(500).json({
    error: 'Internal server error'
  });
}; 