import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // PostgreSQL errors
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  if (err.code === '23503') {
    const message = 'Foreign key constraint violation';
    error = { message, statusCode: 400 };
  }

  if (err.code === '23502') {
    const message = 'Required field is missing';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export { errorHandler }; 