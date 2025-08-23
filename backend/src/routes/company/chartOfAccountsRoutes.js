// b/src/routes/company/chartOfAccountsRoutes.js
const express = require('express');
const router = express.Router();

const {
  getChartOfAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsStats,
  importLithuanianChart,
  testHealth
} = require('../../controllers/company/chartOfAccountsController');

// 🧪 Test routes
router.get('/test/health', testHealth);

// 📊 Main CRUD routes
router.get('/', getChartOfAccounts);           // GET /api/company/chart-of-accounts
router.post('/', createAccount);               // POST /api/company/chart-of-accounts
router.put('/:id', updateAccount);            // PUT /api/company/chart-of-accounts/:id
router.delete('/:id', deleteAccount);         // DELETE /api/company/chart-of-accounts/:id

// 📊 Statistics and analytics
router.get('/stats', getAccountsStats);       // GET /api/company/chart-of-accounts/stats

// 📤 Import functionality
router.post('/import-lithuanian', importLithuanianChart);  // POST /api/company/chart-of-accounts/import-lithuanian

module.exports = router;