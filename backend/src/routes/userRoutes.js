const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole, requirePermission } = require('../middlewares/rbacMiddleware');
const { validateUserInput } = require('../middlewares/validator');

// All user management routes require authentication and Admin role
router.use(authenticateToken);

// User metrics for dashboard
router.get('/stats', requireRole(['Admin']), UserController.getUserStats);

// List users with filtering & search
router.get('/', requireRole(['Admin']), UserController.getUsers);

// Get single user by ID
router.get('/:id', requireRole(['Admin']), UserController.getUserById);

// Create user
router.post('/', requireRole(['Admin']), validateUserInput, UserController.createUser);

// Update user
router.put('/:id', requireRole(['Admin']), validateUserInput, UserController.updateUser);

// Toggle active/deactivated status
router.patch('/:id/status', requireRole(['Admin']), UserController.toggleUserStatus);

// Delete user
router.delete('/:id', requireRole(['Admin']), UserController.deleteUser);

module.exports = router;
