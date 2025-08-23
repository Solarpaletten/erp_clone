// b/src/routes/company/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../../controllers/company/salesController');
const { logger } = require('../../config/logger');

// Добавим отладку
logger.info('💰 Sales routes initialized');

// ===============================================
// 💰 SALES ROUTES - Company Level
// ===============================================

// 📊 GET /api/company/sales/stats - Статистика продаж
router.get('/stats', salesController.getSalesStats);

// 📋 GET /api/company/sales - Получить все продажи
router.get('/', salesController.getAllSales);

// 📄 GET /api/company/sales/:id - Получить продажу по ID
router.get('/:id', salesController.getSaleById);

// ➕ POST /api/company/sales - Создать новую продажу
router.post('/', salesController.createSale);

// ✏️ PUT /api/company/sales/:id - Обновить продажу
router.put('/:id', salesController.updateSale);

// 🗑️ DELETE /api/company/sales/:id - Удалить продажу
router.delete('/:id', salesController.deleteSale);

// ===============================================
// 🧪 TEST ROUTE
// ===============================================

router.get('/test/health', (req, res) => {
    res.json({
        message: '💰 Sales API is working!',
        companyId: req.companyContext?.companyId || 'Not set',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/company/sales - List all sales',
            'GET /api/company/sales/stats - Sales statistics',
            'GET /api/company/sales/:id - Get sale by ID',
            'POST /api/company/sales - Create new sale',
            'PUT /api/company/sales/:id - Update sale',
            'DELETE /api/company/sales/:id - Delete sale'
        ]
    });
});

module.exports = router;