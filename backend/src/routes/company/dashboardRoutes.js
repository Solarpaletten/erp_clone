// b/src/routes/company/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/company/dashboardController');
const auth = require('../../middleware/auth'); // Импортируем middleware для аутентификации
const { logger } = require('../../config/logger');

logger.info('Company dashboard routes initialized');

// Получить полную информацию Dashboard компании
router.get('/', auth, dashboardController.getCompanyDashboard);

// Получить быструю статистику
router.get('/stats', auth, dashboardController.getQuickStats);

module.exports = router;