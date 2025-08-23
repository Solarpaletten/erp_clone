// b/src/routes/company/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/company/inventoryController');
const { logger } = require('../../config/logger');

logger.info('📦 Inventory routes initialized');

// ===============================================
// 📦 INVENTORY ROUTES - ТОЛЬКО инвентаризация
// ===============================================

// 📊 GET /api/company/inventory/stats - Статистика инвентаризаций
router.get('/stats', inventoryController.getInventoryStats);

// 📋 GET /api/company/inventory - Список инвентаризаций
router.get('/', inventoryController.getAllInventories);

// 📄 GET /api/company/inventory/:id - Инвентаризация по ID
router.get('/:id', inventoryController.getInventoryById);

// ➕ POST /api/company/inventory - Создать инвентаризацию
router.post('/', inventoryController.createInventory);

// ✏️ PUT /api/company/inventory/:id - Обновить инвентаризацию
router.put('/:id', inventoryController.updateInventory);

// 🗑️ DELETE /api/company/inventory/:id - Удалить инвентаризацию
router.delete('/:id', inventoryController.deleteInventory);

// 📊 POST /api/company/inventory/:id/process - Провести инвентаризацию
router.post('/:id/process', inventoryController.processInventory);

// ===============================================
// 🧪 TEST ROUTE
// ===============================================

router.get('/test/health', (req, res) => {
  res.json({
    message: '📦 Inventory API is working!',
    companyId: req.companyContext?.companyId || 'Not set',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/company/inventory - List inventories',
      'GET /api/company/inventory/stats - Inventory statistics', 
      'GET /api/company/inventory/:id - Get inventory by ID',
      'POST /api/company/inventory - Create inventory',
      'PUT /api/company/inventory/:id - Update inventory',
      'DELETE /api/company/inventory/:id - Delete inventory',
      'POST /api/company/inventory/:id/process - Process inventory'
    ]
  });
});

module.exports = router;