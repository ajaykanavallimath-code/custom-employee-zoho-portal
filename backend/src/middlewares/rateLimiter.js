const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints (e.g. login)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TooManyRequests',
    message: 'API rate limit exceeded. Please throttle your requests.'
  }
});

module.exports = {
  authLimiter,
  apiLimiter
};
