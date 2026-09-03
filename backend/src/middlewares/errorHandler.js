const env = require('../config/env');

/**
 * Centralized Express Error Handler
 * Ensures no stack traces or secrets leak in production responses
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, {
    message: err.message,
    code: err.code,
    statusCode,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle unique constraint violations
  if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('UNIQUE constraint')) {
    return res.status(409).json({
      success: false,
      error: 'Conflict',
      message: 'A record with this identifier or email already exists.'
    });
  }

  // Handle foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      error: 'ForeignKeyViolation',
      message: 'Referenced related record does not exist.'
    });
  }

  // Safe error payload
  res.status(statusCode).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server.',
    ...(env.NODE_ENV === 'development' && { details: err.stack })
  });
}

/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
