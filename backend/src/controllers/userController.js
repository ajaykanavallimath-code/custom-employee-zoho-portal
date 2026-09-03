const UserModel = require('../models/userModel');
const AuthService = require('../services/authService');
const AuditService = require('../services/auditService');

class UserController {
  /**
   * GET /api/users
   * List paginated users with optional search, role filter, and status filter
   */
  static async getUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const offset = (page - 1) * limit;
      const { search, role, status } = req.query;

      const [users, total] = await Promise.all([
        UserModel.getAllUsers({ search, role, status, limit, offset }),
        UserModel.countUsers({ search, role, status })
      ]);

      res.status(200).json({
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/stats
   * Summary metrics for Admin dashboard
   */
  static async getUserStats(req, res, next) {
    try {
      const stats = await UserModel.getUserStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/:id
   * Fetch single user with roles and permissions
   */
  static async getUserById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await UserModel.getUserWithRolesAndPermissions(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'User not found.'
        });
      }

      res.status(200).json({
        success: true,
        user: AuthService.formatSafeUser(user)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users
   * Create new user and assign roles
   */
  static async createUser(req, res, next) {
    try {
      const { name, email, password, isActive = true, roleIds = [] } = req.body;

      // Check if email already exists
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'A user with this email address already exists.'
        });
      }

      const passwordHash = await AuthService.hashPassword(password);
      const newUser = await UserModel.createUser({
        name,
        email,
        passwordHash,
        isActive
      });

      // Assign roles if provided
      if (roleIds && roleIds.length) {
        await UserModel.setUserRoles(newUser.id, roleIds);
      }

      const fullUser = await UserModel.getUserWithRolesAndPermissions(newUser.id);

      await AuditService.log({
        userId: req.user.id,
        action: 'USER_CREATED',
        resource: `/api/users/${newUser.id}`,
        details: {
          createdUserId: newUser.id,
          email: newUser.email,
          roles: fullUser.roleNames
        },
        req
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: AuthService.formatSafeUser(fullUser)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user details and roles
   */
  static async updateUser(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, email, password, isActive, roleIds } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'User not found.'
        });
      }

      let passwordHash = undefined;
      if (password && password.trim().length > 0) {
        passwordHash = await AuthService.hashPassword(password.trim());
      }

      await UserModel.updateUser(id, {
        name,
        email,
        isActive,
        passwordHash
      });

      if (roleIds !== undefined && Array.isArray(roleIds)) {
        await UserModel.setUserRoles(id, roleIds);
      }

      const updatedFullUser = await UserModel.getUserWithRolesAndPermissions(id);

      await AuditService.log({
        userId: req.user.id,
        action: 'USER_UPDATED',
        resource: `/api/users/${id}`,
        details: {
          targetUserId: id,
          targetEmail: updatedFullUser.email,
          updatedFields: {
            name: Boolean(name),
            email: Boolean(email),
            password: Boolean(password),
            isActive: isActive !== undefined,
            roles: Boolean(roleIds)
          }
        },
        req
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: AuthService.formatSafeUser(updatedFullUser)
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/users/:id/status
   * Toggle user active/deactivated status
   */
  static async toggleUserStatus(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'isActive boolean is required.'
        });
      }

      // Prevent Admin from deactivating own account
      if (req.user.id === id && !isActive) {
        return res.status(400).json({
          success: false,
          error: 'OperationNotAllowed',
          message: 'You cannot deactivate your own administrative account.'
        });
      }

      const updated = await UserModel.updateUser(id, { isActive });
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'User not found.'
        });
      }

      await AuditService.log({
        userId: req.user.id,
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        resource: `/api/users/${id}/status`,
        details: { targetUserId: id, isActive },
        req
      });

      res.status(200).json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user: updated
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  static async deleteUser(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);

      // Prevent self-deletion
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          error: 'OperationNotAllowed',
          message: 'You cannot delete your own administrative account.'
        });
      }

      const target = await UserModel.findById(id);
      if (!target) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'User not found.'
        });
      }

      await UserModel.deleteUser(id);

      await AuditService.log({
        userId: req.user.id,
        action: 'USER_DELETED',
        resource: `/api/users/${id}`,
        details: {
          deletedUserId: id,
          deletedUserEmail: target.email,
          deletedUserName: target.name
        },
        req
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
