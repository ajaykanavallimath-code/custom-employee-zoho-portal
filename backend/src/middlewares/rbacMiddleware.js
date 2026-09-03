const AuditService = require('../services/auditService');
const zohoService = require('../services/zohoService');

/**
 * Middleware factory: Require user to have at least one of the specified roles
 * @param {string|string[]} requiredRoles - Role name or array of role names (e.g. ['Admin', 'HR'])
 */
function requireRole(requiredRoles) {
  const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    const userRoles = req.user.roleNames || [];
    // Admin always has bypass privilege unless explicitly restricted
    const hasAllowedRole = userRoles.includes('Admin') || rolesArray.some(role => userRoles.includes(role));

    if (!hasAllowedRole) {
      await AuditService.log({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ROLE_ACCESS_DENIED',
        resource: req.originalUrl,
        details: {
          userRoles,
          requiredRoles: rolesArray,
          method: req.method
        },
        req
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. This resource requires one of the following roles: ${rolesArray.join(', ')}. Your roles: [${userRoles.join(', ')}].`
      });
    }

    next();
  };
}

/**
 * Middleware factory: Require user to have at least one of the specified granular permissions
 * @param {string|string[]} requiredPermissions - Permission name or array of permission names
 */
function requirePermission(requiredPermissions) {
  const permsArray = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    const userRoles = req.user.roleNames || [];
    // Admin role has all permissions implicitly
    if (userRoles.includes('Admin')) {
      return next();
    }

    const userPermissions = req.user.permissionNames || [];
    const hasAllowedPermission = permsArray.some(perm => userPermissions.includes(perm));

    if (!hasAllowedPermission) {
      await AuditService.log({
        userId: req.user.id,
        action: 'UNAUTHORIZED_PERMISSION_ACCESS_DENIED',
        resource: req.originalUrl,
        details: {
          userPermissions,
          requiredPermissions: permsArray,
          method: req.method
        },
        req
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. You lack the necessary permission(s): [${permsArray.join(', ')}].`
      });
    }

    next();
  };
}

/**
 * Middleware: Verify user is authorized to access a specific Zoho application
 */
function requireZohoAppAccess(appNameParam = 'appName') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    const appName = req.params[appNameParam] || req.body[appNameParam];
    if (!appName) {
      return res.status(400).json({
        success: false,
        error: 'BadRequest',
        message: 'Application identifier is required.'
      });
    }

    const canAccess = zohoService.canUserAccessApp(req.user, appName);

    if (!canAccess) {
      await AuditService.log({
        userId: req.user.id,
        action: 'UNAUTHORIZED_APP_ACCESS_DENIED',
        resource: `/api/apps/${appName}`,
        details: {
          attemptedApp: appName,
          userRoles: req.user.roleNames,
          userPermissions: req.user.permissionNames
        },
        req
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. Your role [${req.user.roleNames.join(', ')}] is not authorized to access Zoho application '${appName}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requirePermission,
  requireZohoAppAccess
};
