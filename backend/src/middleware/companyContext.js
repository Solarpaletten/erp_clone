const prismaManager = require('../utils/prismaManager');
const { logger } = require('../config/logger');

const companyContext = async (req, res, next) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({
        error: 'Company context required',
        hint: 'Add x-company-id header'
      });
    }

    req.companyContext = { companyId: parseInt(companyId) };
    req.prisma = prismaManager.getCompanyPrisma(companyId);
    
    logger.info(`✅ Company context: ${companyId}`);
    next();
    
  } catch (error) {
    logger.error('❌ Company Context Error:', error);
    res.status(500).json({
      error: 'Failed to establish company context',
      details: error.message
    });
  }
};

module.exports = companyContext;
