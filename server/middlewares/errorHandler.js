// Global Error Handler Middleware for Express 5
// Express 5 automatically catches errors in async route handlers
// This middleware handles all errors that reach it

const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    statusCode,
    path: req.path,
    method: req.method
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Multer file upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Maximum size is 5MB';
  }

  if (err.message && err.message.includes('Only image files are allowed')) {
    statusCode = 400;
    message = 'Only image files are allowed';
  }

  // Request entity too large error
  if (err.status === 413 || err.message?.includes('request entity too large') || err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'File size too large. Please upload an image smaller than 5MB';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;

