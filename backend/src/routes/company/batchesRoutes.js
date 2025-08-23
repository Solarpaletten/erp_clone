// b/src/routes/company/batches.js
const express = require('express');
const router = express.Router();

const {
  getBatches,
  createBatches,
  updateBatches,
  deleteBatches,
  getBatchesStats,
  testHealth
} = require('../../controllers/company/batchController');

// ✅ ЗАМЕНИТЬ НА:
const {
  allocateBatchesForSale,
  getBatchMovements,
  createBatchMovement,
  getWarehouseBatchesReport
} = require('../../controllers/company/batchController');

router.post('/allocate', allocateBatchesForSale);
router.get('/:batchId/movements', getBatchMovements);
router.post('/movements', createBatchMovement);
router.get('/warehouses/:warehouseId/report', getWarehouseBatchesReport);

module.exports = router;