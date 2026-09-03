const UserModel = require('../models/userModel');
const AuthService = require('../services/authService');
const AuditService = require('../services/auditService');
const zohoService = require('../services/zohoService');

class AuthController {
  /**
   * POST /api/auth/login
   * User login with email and password
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserModel.findByEmail(email);

      if (!user) {
        await AuditService.log({
          action: 'LOGIN_FAILED_USER_NOT_FOUND',
          resource: '/api/auth/login',
          details: { email },
          req
        });

        return res.status(401).json({
          success: false,
          error: 'InvalidCredentials',
          message: 'Invalid email or password.'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        await AuditService.log({
          userId: user.id,
          action: 'LOGIN_BLOCKED_DEACTIVATED',
          resource: '/api/auth/login',
          details: { email },
          req
        });

        return res.status(403).json({
          success: false,
          error: 'AccountDeactivated',
          message: 'Your account has been deactivated. Please contact an administrator.'
        });
      }

      // Verify bcrypt password
      const isMatch = await AuthService.verifyPassword(password, user.password_hash);
      if (!isMatch) {
        await AuditService.log({
          userId: user.id,
          action: 'LOGIN_FAILED_WRONG_PASSWORD',
          resource: '/api/auth/login',
          details: { email },
          req
        });

        return res.status(401).json({
          success: false,
          error: 'InvalidCredentials',
          message: 'Invalid email or password.'
        });
      }

      // Load full user with roles and permissions
      const fullUser = await UserModel.getUserWithRolesAndPermissions(user.id);
      
      // Calculate authorized Zoho applications for user's role
      const authorizedApps = zohoService.getAuthorizedApplications(fullUser);

      // Generate JWT token
      const token = AuthService.generateToken(fullUser);

      // Record successful login in audit trail
      await AuditService.log({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: '/api/auth/login',
        details: {
          roles: fullUser.roleNames,
          primaryRole: fullUser.primaryRole,
          authorizedAppsCount: authorizedApps.length
        },
        req
      });

      const safeUser = AuthService.formatSafeUser(fullUser, authorizedApps);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me
   * Return authenticated user profile and authorized applications
   */
  static async getCurrentUser(req, res, next) {
    try {
      const fullUser = await UserModel.getUserWithRolesAndPermissions(req.user.id);
      if (!fullUser) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'User profile not found.'
        });
      }

      const authorizedApps = zohoService.getAuthorizedApplications(fullUser);
      const safeUser = AuthService.formatSafeUser(fullUser, authorizedApps);

      res.status(200).json({
        success: true,
        user: safeUser
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/auth/profile
   * Update own profile or password
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await UserModel.findByEmail(req.user.email);
      let passwordHash = undefined;

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'Current password is required to set a new password.'
          });
        }

        const isMatch = await AuthService.verifyPassword(currentPassword, user.password_hash);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            error: 'InvalidPassword',
            message: 'Current password does not match.'
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            success: false,
            error: 'ValidationError',
            message: 'New password must be at least 6 characters long.'
          });
        }

        passwordHash = await AuthService.hashPassword(newPassword);
      }

      const updated = await UserModel.updateUser(userId, {
        name: name || undefined,
        passwordHash
      });

      await AuditService.log({
        userId,
        action: 'PROFILE_UPDATED',
        resource: '/api/auth/profile',
        details: {
          updatedName: Boolean(name),
          passwordChanged: Boolean(newPassword)
        },
        req
      });

      const fullUser = await UserModel.getUserWithRolesAndPermissions(userId);
      const authorizedApps = zohoService.getAuthorizedApplications(fullUser);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: AuthService.formatSafeUser(fullUser, authorizedApps)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   * Client-side token discard & server-side audit logging
   */
  static async logout(req, res, next) {
    try {
      if (req.user) {
        await AuditService.log({
          userId: req.user.id,
          action: 'LOGOUT',
          resource: '/api/auth/logout',
          details: { email: req.user.email },
          req
        });
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
