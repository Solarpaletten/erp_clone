//b/src/routes/cloudide/cloudIdeRoutes.js
// 🌟 Solar Cloud IDE - Routes
const express = require('express');
const router = express.Router();
const cloudIdeController = require('../../controllers/cloudide/cloudIdeController');
const auth = require('../../middleware/auth');

// 🧪 Health Check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Solar Cloud IDE',
    version: '1.0.0',
    features: [
      'GitHub Integration',
      'Live File Comparison',
      'AI Code Analysis',
      'Real-time Diff',
      'Branch Management'
    ],
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

// 🐙 GitHub Integration
router.post('/repo/load', auth, cloudIdeController.loadRepo);
router.get('/repo/file', auth, cloudIdeController.getFile);
router.post('/repo/compare', auth, cloudIdeController.compareFile);
router.get('/repo/branches', auth, cloudIdeController.getBranches);
router.get('/repo/search', auth, cloudIdeController.searchRepos);

module.exports = router;
