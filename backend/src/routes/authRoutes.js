const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const { validateLoginInput } = require('../middlewares/validator');

// Public route: Login (with rate limiter and validation)
router.post('/login', authLimiter, validateLoginInput, AuthController.login);

// Protected routes: Me, Update Profile, Logout
router.get('/me', authenticateToken, AuthController.getCurrentUser);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;
