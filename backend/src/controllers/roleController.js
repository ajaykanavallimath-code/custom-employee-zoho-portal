const RoleModel = require('../models/roleModel');
const AuditService = require('../services/auditService');

class RoleController {
  /**
   * GET /api/roles
   * List all roles with associated permissions & user counts
   */
  static async getRoles(req, res, next) {
    try {
      const roles = await RoleModel.getAllRolesWithPermissions();
      res.status(200).json({
        success: true,
        data: roles
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/roles/:id
   * Get single role details with permissions
   */
  static async getRoleById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const role = await RoleModel.getRoleById(id);

      if (!role) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Role not found.'
        });
      }

      res.status(200).json({
        success: true,
        role
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/roles
   * Create role and assign initial permissions
   */
  static async createRole(req, res, next) {
    try {
      const { name, description, permissionIds = [] } = req.body;

      const existing = await RoleModel.findByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Conflict',
          message: 'A role with this name already exists.'
        });
      }

      const newRole = await RoleModel.createRole({ name, description });

      if (permissionIds && permissionIds.length) {
        await RoleModel.setRolePermissions(newRole.id, permissionIds);
      }

      const fullRole = await RoleModel.getRoleById(newRole.id);

      await AuditService.log({
        userId: req.user.id,
        action: 'ROLE_CREATED',
        resource: `/api/roles/${newRole.id}`,
        details: { roleName: name, permissionsCount: permissionIds.length },
        req
      });

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        role: fullRole
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/roles/:id
   * Update role metadata and assign permissions
   */
  static async updateRole(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, description, permissionIds } = req.body;

      const existing = await RoleModel.getRoleById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Role not found.'
        });
      }

      // If renaming, check conflict
      if (name && name.toLowerCase() !== existing.name.toLowerCase()) {
        const nameConflict = await RoleModel.findByName(name);
        if (nameConflict) {
          return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: 'A role with this name already exists.'
          });
        }
      }

      await RoleModel.updateRole(id, { name, description });

      if (permissionIds !== undefined && Array.isArray(permissionIds)) {
        await RoleModel.setRolePermissions(id, permissionIds);
      }

      const updatedRole = await RoleModel.getRoleById(id);

      await AuditService.log({
        userId: req.user.id,
        action: 'ROLE_UPDATED',
        resource: `/api/roles/${id}`,
        details: { roleId: id, roleName: updatedRole.name },
        req
      });

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        role: updatedRole
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/roles/:id
   * Delete custom role
   */
  static async deleteRole(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await RoleModel.getRoleById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Role not found.'
        });
      }

      const defaultRoles = ['Admin', 'HR', 'Sales', 'Support', 'Finance'];
      if (defaultRoles.some(r => r.toLowerCase() === existing.name.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'OperationNotAllowed',
          message: `System default role '${existing.name}' cannot be deleted.`
        });
      }

      await RoleModel.deleteRole(id);

      await AuditService.log({
        userId: req.user.id,
        action: 'ROLE_DELETED',
        resource: `/api/roles/${id}`,
        details: { deletedRoleId: id, deletedRoleName: existing.name },
        req
      });

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = RoleController;
