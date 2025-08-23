// src/middleware/companySelector.js
const { getPrismaManager } = require('../companyContext');

/**
 * Middleware для определения уровня доступа (Account vs Company)
 * и подключения соответствующего Prisma клиента
 */
function companyContextMiddleware(req, res, next) {
  const prismaManager = getPrismaManager();
  
  // Проверяем маршрут - Account Level или Company Level
  const isAccountLevel = req.path.startsWith('/api/account') || 
                        req.path.includes('/companies') ||
                        req.path.includes('/users') ||
                        req.path.includes('/company-context') ||  // Добавлено!
                        req.path.includes('/health') ||           // Добавлено!
                        req.path.includes('/auth') ||             // Добавлено!
                        req.path.includes('/onboarding');         // Добавлено!
  
  if (isAccountLevel) {
    // Account Level - используем обычный Prisma без фильтрации
    req.prisma = prismaManager.getAccountPrisma();
    req.companyContext = {
      level: 'account',
      companyId: null
    };
    
    console.log(`[Account Level] ${req.method} ${req.path}`);
    return next();
  }
  
  // Company Level - нужен company_id
  let companyId = null;
  
  // Способы получения company_id:
  // 1. Из заголовка x-company-id
  if (req.headers['x-company-id']) {
    companyId = parseInt(req.headers['x-company-id']);
  }
  
  // 2. Из query параметра
  if (!companyId && req.query.company_id) {
    companyId = parseInt(req.query.company_id);
  }
  
  // 3. Из body запроса
  if (!companyId && req.body && req.body.company_id) {
    companyId = parseInt(req.body.company_id);
  }
  
  // 4. Из сессии пользователя (если есть)
  if (!companyId && req.user && req.user.current_company_id) {
    companyId = req.user.current_company_id;
  }
  
  if (!companyId) {
    return res.status(400).json({
      error: 'Company ID is required for this operation',
      hint: 'Add x-company-id header or company_id parameter'
    });
  }
  
  // Company Level - используем Prisma с автоматической фильтрацией
  req.prisma = prismaManager.getCompanyPrisma(companyId);
  req.companyContext = {
    level: 'company',
    companyId: companyId
  };
  
  console.log(`[Company Level] ${req.method} ${req.path} - Company: ${companyId}`);
  next();
}

module.exports = {
  companyContextMiddleware
};