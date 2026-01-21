const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Protected routes
router.get('/auth/profile', authenticate, authController.getProfile);
router.put('/auth/token', authenticate, authController.updatePushToken);

module.exports = router;