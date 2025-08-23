// b/src/routes/company/purchasesRoutes.js
const express = require('express');
const router = express.Router();
const purchasesController = require('../../controllers/company/purchasesController');
const { logger } = require('../../config/logger');

// Добавим отладку
logger.info('🛒 Purchases routes initialized');

// ===============================================
// 🛒 PURCHASES ROUTES - Company Level
// ===============================================

// 📊 GET /api/company/purchases/stats - Статистика покупок
router.get('/stats', purchasesController.getPurchasesStats);

// 📋 GET /api/company/purchases - Получить все покупки
router.get('/', purchasesController.getAllPurchases);

// 📄 GET /api/company/purchases/:id - Получить покупку по ID
router.get('/:id', purchasesController.getPurchaseById);

// ➕ POST /api/company/purchases - Создать новую покупку
router.post('/', purchasesController.createPurchase);

// ✏️ PUT /api/company/purchases/:id - Обновить покупку
router.put('/:id', purchasesController.updatePurchase);

// 🗑️ DELETE /api/company/purchases/:id - Удалить покупку
router.delete('/:id', purchasesController.deletePurchase);

// ===============================================
// 🧪 TEST ROUTE
// ===============================================

router.get('/test/health', (req, res) => {
  res.json({
    message: '🛒 Purchases API is working!',
    companyId: req.companyContext?.companyId || 'Not set',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/company/purchases - List all purchases',
      'GET /api/company/purchases/stats - Purchases statistics',
      'GET /api/company/purchases/:id - Get purchase by ID',
      'POST /api/company/purchases - Create new purchase',
      'PUT /api/company/purchases/:id - Update purchase',
      'DELETE /api/company/purchases/:id - Delete purchase'
    ]
  });
});

module.exports = router;