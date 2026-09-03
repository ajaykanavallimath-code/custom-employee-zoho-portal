const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/rbacMiddleware');
const { validateRoleInput } = require('../middlewares/validator');

// All role management endpoints require authentication and Admin role
router.use(authenticateToken);
router.use(requireRole(['Admin']));

router.get('/', RoleController.getRoles);
router.get('/:id', RoleController.getRoleById);
router.post('/', validateRoleInput, RoleController.createRole);
router.put('/:id', validateRoleInput, RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);

module.exports = router;
