const jwt = require('jsonwebtoken');
const env = require('../config/env');
const UserModel = require('../models/userModel');
const AuditService = require('../services/auditService');

/**
 * Middleware: Verify Bearer JWT Token and populate req.user with fresh roles & permissions
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Access token is missing. Please provide a valid Bearer token.'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Fetch full user record to verify account is still active and roles are up-to-date
    const user = await UserModel.getUserWithRolesAndPermissions(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'The user account associated with this token no longer exists.'
      });
    }

    if (!user.is_active) {
      await AuditService.log({
        userId: user.id,
        action: 'DEACTIVATED_USER_ACCESS_BLOCKED',
        resource: req.originalUrl,
        details: { email: user.email },
        req
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TokenExpired',
        message: 'Your session has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'InvalidToken',
      message: 'Authentication token is invalid or malformed.'
    });
  }
}

module.exports = {
  authenticateToken
};
