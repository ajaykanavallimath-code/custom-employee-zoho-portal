const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const UserModel = require('../models/userModel');

class AuthService {
  /**
   * Hash plain text password using bcrypt
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Verify password against bcrypt hash
   */
  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  /**
   * Generate signed JWT token containing user identity and roles
   */
  static generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      roles: user.roleNames || [],
      primaryRole: user.primaryRole || 'Employee'
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }

  /**
   * Prepare safe user profile object for client (excluding password_hash)
   */
  static formatSafeUser(user, authorizedApps = []) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.is_active,
      roles: user.roles || [],
      roleNames: user.roleNames || [],
      primaryRole: user.primaryRole || (user.roleNames && user.roleNames[0]) || 'Employee',
      permissions: user.permissions || [],
      permissionNames: user.permissionNames || [],
      authorizedApps,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}

module.exports = AuthService;
