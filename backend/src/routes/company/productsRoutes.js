// b/src/routes/company/productsRoutes.js
const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/company/productsController');
const { logger } = require('../../config/logger');

// Добавим отладку
logger.info('📦 Products routes initialized');

// ===============================================
// 📦 PRODUCTS ROUTES - Company Level
// ===============================================

// 📊 GET /api/company/products/stats - Статистика товаров
router.get('/stats', productsController.getProductsStats);

// 📋 GET /api/company/products - Получить все товары
router.get('/', productsController.getAllProducts);

// 📄 GET /api/company/products/:id - Получить товар по ID
router.get('/:id', productsController.getProductById);

// ➕ POST /api/company/products - Создать новый товар
router.post('/', productsController.createProduct);

// ✏️ PUT /api/company/products/:id - Обновить товар
router.put('/:id', productsController.updateProduct);

// 🗑️ DELETE /api/company/products/:id - Удалить товар
router.delete('/:id', productsController.deleteProduct);

// ===============================================
// 🧪 TEST ROUTE
// ===============================================

router.get('/test/health', (req, res) => {
  res.json({
    message: '📦 Products API is working!',
    companyId: req.companyContext?.companyId || 'Not set',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/company/products - List all products',
      'GET /api/company/products/stats - Products statistics',
      'GET /api/company/products/:id - Get product by ID',
      'POST /api/company/products - Create new product',
      'PUT /api/company/products/:id - Update product',
      'DELETE /api/company/products/:id - Delete product'
    ]
  });
});

module.exports = router;