const express = require('express');
const router = express.Router();
const authController = require('../../controllers/account/authController');
const auth = require('../../middleware/auth');
const prismaManager = require('../../utils/prismaManager');

// Основные маршруты аутентификации
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.post('/validate-token', authController.validateToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Маршруты для подтверждения email
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/confirm', authController.confirmEmail);

module.exports = router;
