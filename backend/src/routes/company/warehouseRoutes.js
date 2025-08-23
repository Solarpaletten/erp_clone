// b/src/routes/company/warehouseRoutes.js
const express = require('express');
const router = express.Router();
const warehouseController = require('../../controllers/company/warehouseController');
const { logger } = require('../../config/logger');

// Добавим отладку
logger.info('🏭 Warehouse routes initialized');

// ===============================================
// 🏭 WAREHOUSE ROUTES - Company Level
// ===============================================

// 📊 GET /api/company/warehouses/stats - Статистика складов
router.get('/stats', warehouseController.getWarehouseStats);

// 📋 GET /api/company/warehouses - Получить все склады
router.get('/', warehouseController.getAllWarehouses);

// 📄 GET /api/company/warehouses/:id - Получить склад по ID
router.get('/:id', warehouseController.getWarehouseById);

// ➕ POST /api/company/warehouses - Создать новый склад
router.post('/', warehouseController.createWarehouse);

// ✏️ PUT /api/company/warehouses/:id - Обновить склад
router.put('/:id', warehouseController.updateWarehouse);

// 🗑️ DELETE /api/company/warehouses/:id - Удалить склад
router.delete('/:id', warehouseController.deleteWarehouse);

// 📦 GET /api/company/warehouses/:id/inventory - Остатки на складе
router.get('/:id/inventory', warehouseController.getWarehouseInventory);

// ===============================================
// 🧪 TEST ROUTE
// ===============================================

router.get('/test/health', (req, res) => {
  res.json({
    message: '🏭 Warehouse API is working!',
    companyId: req.companyContext?.companyId || 'Not set',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/company/warehouses - List all warehouses',
      'GET /api/company/warehouses/stats - Warehouse statistics',
      'GET /api/company/warehouses/:id - Get warehouse by ID',
      'GET /api/company/warehouses/:id/inventory - Get warehouse inventory',
      'POST /api/company/warehouses - Create new warehouse',
      'PUT /api/company/warehouses/:id - Update warehouse',
      'DELETE /api/company/warehouses/:id - Delete warehouse'
    ]
  });
});

module.exports = router;