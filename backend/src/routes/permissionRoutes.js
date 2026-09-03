const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/permissionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');

// Permissions catalog requires authentication and Admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

router.get('/', PermissionController.getPermissions);
router.get('/:id', PermissionController.getPermissionById);

module.exports = router;
