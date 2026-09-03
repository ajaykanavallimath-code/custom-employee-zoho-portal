const PermissionModel = require('../models/permissionModel');

class PermissionController {
  /**
   * GET /api/permissions
   * List all available permissions in the system
   */
  static async getPermissions(req, res, next) {
    try {
      const permissions = await PermissionModel.getAllPermissions();
      res.status(200).json({
        success: true,
        data: permissions
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/permissions/:id
   * Get single permission details
   */
  static async getPermissionById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10);
      const permission = await PermissionModel.getById(id);

      if (!permission) {
        return res.status(404).json({
          success: false,
          error: 'NotFound',
          message: 'Permission not found.'
        });
      }

      res.status(200).json({
        success: true,
        permission
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PermissionController;
