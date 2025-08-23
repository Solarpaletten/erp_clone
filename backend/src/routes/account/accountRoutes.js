// b/src/routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/account/accountController');
const accountContextController = require('../../controllers/account/accountContextController');
const auth = require('../../middleware/auth');
const { logger } = require('../../config/logger');

// Добавим отладку
logger.info('Account routes initialized');

// ===========================================
// 🏢 ACCOUNT LEVEL ROUTES (Управление компаниями)
// ===========================================

router.get('/companies', auth, accountController.getAllCompanies);
router.post('/companies', auth, accountController.createCompany);
router.get('/companies/stats', auth, accountController.getCompaniesWithStats);
router.get('/analytics', auth, accountController.getSystemAnalytics);

router.post('/switch-to-company', auth, accountContextController.switchToCompany);

// Получить доступные компании
router.get('/available-companies', auth, accountContextController.getAvailableCompanies);

// ===========================================
// 🧪 TEST ROUTES (Тестирование)
// ===========================================

// Тестовый роут для проверки Account Level
router.get('/test', auth, (req, res) => {
  res.json({
    message: 'Account Level API working!',
    level: 'account',
    user: {
      id: req.user.id,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
