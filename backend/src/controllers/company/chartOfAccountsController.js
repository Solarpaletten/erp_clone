// b/src/controllers/company/chartOfAccountsController.js
const { logger } = require('../../config/logger');

// 📊 GET /api/company/chart-of-accounts - Получить план счетов
const getChartOfAccounts = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    const { account_type, search, is_active } = req.query;

    logger.info(`📊 Fetching chart of accounts for company: ${companyId}`);

    // Построение фильтров
    const where = {
      company_id: parseInt(companyId)
    };

    if (account_type) {
      where.account_type = account_type;
    }

    if (search) {
      where.OR = [
        { account_code: { contains: search, mode: 'insensitive' } },
        { account_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    const accounts = await req.prisma.chart_of_accounts.findMany({
      where,
      orderBy: [
        { account_code: 'asc' }
      ],
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    logger.info(`✅ Found ${accounts.length} accounts for company ${companyId}`);

    res.json({
      success: true,
      accounts,
      total: accounts.length,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching chart of accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching chart of accounts',
      details: error.message
    });
  }
};

// ➕ POST /api/company/chart-of-accounts - Создать счёт
const createAccount = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id;

    if (!companyId || !userId) {
      return res.status(400).json({ 
        error: 'Company context and user authentication required'
      });
    }

    const {
      account_code,
      account_name,
      account_type,
      currency,
      is_active = true
    } = req.body;

    // Валидация обязательных полей
    if (!account_code || !account_name || !account_type) {
      return res.status(400).json({
        error: 'account_code, account_name, and account_type are required'
      });
    }

    logger.info(`➕ Creating account: ${account_code} - ${account_name} for company ${companyId}`);

    // Проверка уникальности кода счёта в рамках компании
    const existingAccount = await req.prisma.chart_of_accounts.findFirst({
      where: {
        company_id: parseInt(companyId),
        account_code: account_code.trim()
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        error: `Account code '${account_code}' already exists`
      });
    }

    const account = await req.prisma.chart_of_accounts.create({
      data: {
        company_id: parseInt(companyId),
        account_code: account_code.trim(),
        account_name: account_name.trim(),
        account_type: account_type.toUpperCase(),
        currency: currency || null,
        is_active: Boolean(is_active),
        created_by: parseInt(userId)
      },
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    logger.info(`✅ Account created: ${account.account_code} - ${account.account_name} (ID: ${account.id})`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      account,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error creating account:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating account',
      details: error.message
    });
  }
};

// ✏️ PUT /api/company/chart-of-accounts/:id - Обновить счёт
const updateAccount = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id;
    const accountId = parseInt(req.params.id);

    if (!companyId || !userId) {
      return res.status(400).json({ 
        error: 'Company context and user authentication required'
      });
    }

    const {
      account_code,
      account_name,
      account_type,
      currency,
      is_active
    } = req.body;

    logger.info(`✏️ Updating account ID: ${accountId} for company ${companyId}`);

    // Проверяем что счёт принадлежит компании
    const existingAccount = await req.prisma.chart_of_accounts.findFirst({
      where: {
        id: accountId,
        company_id: parseInt(companyId)
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        error: 'Account not found'
      });
    }

    // Если изменяется код счёта, проверяем уникальность
    if (account_code && account_code.trim() !== existingAccount.account_code) {
      const duplicateAccount = await req.prisma.chart_of_accounts.findFirst({
        where: {
          company_id: parseInt(companyId),
          account_code: account_code.trim(),
          id: { not: accountId }
        }
      });

      if (duplicateAccount) {
        return res.status(400).json({
          error: `Account code '${account_code}' already exists`
        });
      }
    }

    const updateData = {};
    
    if (account_code !== undefined) updateData.account_code = account_code.trim();
    if (account_name !== undefined) updateData.account_name = account_name.trim();
    if (account_type !== undefined) updateData.account_type = account_type.toUpperCase();
    if (currency !== undefined) updateData.currency = currency;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const account = await req.prisma.chart_of_accounts.update({
      where: { id: accountId },
      data: updateData,
      include: {
        creator: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    logger.info(`✅ Account updated: ${account.account_code} - ${account.account_name}`);

    res.json({
      success: true,
      message: 'Account updated successfully',
      account,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error updating account:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating account',
      details: error.message
    });
  }
};

// 🗑️ DELETE /api/company/chart-of-accounts/:id - Удалить счёт
const deleteAccount = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const accountId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`🗑️ Deleting account ID: ${accountId} for company ${companyId}`);

    // Проверяем что счёт принадлежит компании
    const existingAccount = await req.prisma.chart_of_accounts.findFirst({
      where: {
        id: accountId,
        company_id: parseInt(companyId)
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        error: 'Account not found'
      });
    }

    await req.prisma.chart_of_accounts.delete({
      where: { id: accountId }
    });

    logger.info(`✅ Account deleted: ${existingAccount.account_code} - ${existingAccount.account_name}`);

    res.json({
      success: true,
      message: 'Account deleted successfully',
      deletedAccount: existingAccount,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting account',
      details: error.message
    });
  }
};

// 📊 GET /api/company/chart-of-accounts/stats - Статистика плана счетов
const getAccountsStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`📊 Fetching accounts statistics for company: ${companyId}`);

    const accounts = await req.prisma.chart_of_accounts.findMany({
      where: { company_id: parseInt(companyId) }
    });

    const stats = {
      total: accounts.length,
      active: accounts.filter(a => a.is_active).length,
      inactive: accounts.filter(a => !a.is_active).length,
      byType: {
        ASSET: accounts.filter(a => a.account_type === 'ASSET').length,
        LIABILITY: accounts.filter(a => a.account_type === 'LIABILITY').length,
        EQUITY: accounts.filter(a => a.account_type === 'EQUITY').length,
        INCOME: accounts.filter(a => a.account_type === 'INCOME').length,
        EXPENSE: accounts.filter(a => a.account_type === 'EXPENSE').length
      },
      byClass: {}
    };

    // Статистика по классам (первая цифра кода)
    accounts.forEach(account => {
      const accountClass = account.account_code.charAt(0);
      if (accountClass) {
        stats.byClass[accountClass] = (stats.byClass[accountClass] || 0) + 1;
      }
    });

    logger.info(`✅ Accounts statistics calculated for company ${companyId}`);

    res.json({
      success: true,
      stats,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching accounts statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching accounts statistics',
      details: error.message
    });
  }
};

// 📤 POST /api/company/chart-of-accounts/import-lithuanian - Импорт литовского плана
const importLithuanianChart = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id;

    if (!companyId || !userId) {
      return res.status(400).json({ 
        error: 'Company context and user authentication required'
      });
    }

    logger.info(`📤 Importing Lithuanian chart of accounts for company: ${companyId}`);

    // Литовский план счетов (основные счета)
    const lithuanianAccounts = [
      // Класс 1: Внеоборотные активы
      { code: '10', name: 'Development', type: 'ASSET' },
      { code: '11', name: 'Concessions, patents, licenses', type: 'ASSET' },
      { code: '12', name: 'Trademarks', type: 'ASSET' },
      { code: '13', name: 'Software', type: 'ASSET' },
      { code: '20', name: 'Land', type: 'ASSET' },
      { code: '21', name: 'Buildings and structures', type: 'ASSET' },
      { code: '22', name: 'Machinery and equipment', type: 'ASSET' },
      { code: '23', name: 'Vehicles', type: 'ASSET' },
      { code: '24', name: 'Computers and IT equipment', type: 'ASSET' },
      { code: '25', name: 'Furniture and fixtures', type: 'ASSET' },
      
      // Класс 2: Оборотные активы
      { code: '200', name: 'Raw materials', type: 'ASSET' },
      { code: '201', name: 'Work in progress', type: 'ASSET' },
      { code: '202', name: 'Finished goods', type: 'ASSET' },
      { code: '203', name: 'Goods for resale', type: 'ASSET' },
      { code: '240', name: 'Trade receivables', type: 'ASSET' },
      { code: '250', name: 'Notes receivable', type: 'ASSET' },
      { code: '270', name: 'Cash on hand', type: 'ASSET' },
      { code: '271', name: 'Cash in national currency', type: 'ASSET' },
      { code: '272', name: 'Cash in foreign currency', type: 'ASSET' },
      { code: '280', name: 'Bank accounts', type: 'ASSET' },
      { code: '281', name: 'Current accounts', type: 'ASSET' },
      { code: '282', name: 'Foreign currency accounts', type: 'ASSET' },
      
      // Класс 4: Капитал
      { code: '40', name: 'Share capital', type: 'EQUITY' },
      { code: '401', name: 'Ordinary shares', type: 'EQUITY' },
      { code: '41', name: 'Share premium', type: 'EQUITY' },
      { code: '43', name: 'Legal reserves', type: 'EQUITY' },
      { code: '45', name: 'Retained earnings', type: 'EQUITY' },
      { code: '47', name: 'Current year profit', type: 'EQUITY' },
      
      // Класс 5: Обязательства
      { code: '50', name: 'Long-term loans', type: 'LIABILITY' },
      { code: '501', name: 'Bank loans', type: 'LIABILITY' },
      { code: '55', name: 'Short-term loans', type: 'LIABILITY' },
      { code: '56', name: 'Trade payables', type: 'LIABILITY' },
      { code: '57', name: 'Tax payables', type: 'LIABILITY' },
      { code: '571', name: 'VAT payable', type: 'LIABILITY' },
      { code: '572', name: 'Income tax payable', type: 'LIABILITY' },
      { code: '58', name: 'Payroll payables', type: 'LIABILITY' },
      
      // Класс 6: Расходы
      { code: '60', name: 'Cost of sales', type: 'EXPENSE' },
      { code: '601', name: 'Materials', type: 'EXPENSE' },
      { code: '602', name: 'Wages and salaries', type: 'EXPENSE' },
      { code: '603', name: 'Social security contributions', type: 'EXPENSE' },
      { code: '604', name: 'Depreciation', type: 'EXPENSE' },
      { code: '61', name: 'Selling expenses', type: 'EXPENSE' },
      { code: '62', name: 'Administrative expenses', type: 'EXPENSE' },
      { code: '65', name: 'Financial expenses', type: 'EXPENSE' },
      { code: '651', name: 'Interest on loans', type: 'EXPENSE' },
      
      // Класс 7: Доходы
      { code: '70', name: 'Sales revenue', type: 'INCOME' },
      { code: '701', name: 'Sale of goods', type: 'INCOME' },
      { code: '702', name: 'Rendering of services', type: 'INCOME' },
      { code: '73', name: 'Other operating income', type: 'INCOME' },
      { code: '75', name: 'Financial income', type: 'INCOME' },
      { code: '751', name: 'Interest received', type: 'INCOME' }
    ];

    const createdAccounts = [];
    let skippedCount = 0;

    for (const accountData of lithuanianAccounts) {
      try {
        // Проверяем существование счёта
        const existingAccount = await req.prisma.chart_of_accounts.findFirst({
          where: {
            company_id: parseInt(companyId),
            account_code: accountData.code
          }
        });

        if (!existingAccount) {
          const account = await req.prisma.chart_of_accounts.create({
            data: {
              company_id: parseInt(companyId),
              account_code: accountData.code,
              account_name: accountData.name,
              account_type: accountData.type,
              is_active: true,
              created_by: parseInt(userId)
            }
          });
          createdAccounts.push(account);
        } else {
          skippedCount++;
        }
      } catch (error) {
        logger.error(`❌ Error creating account ${accountData.code}:`, error.message);
      }
    }

    logger.info(`✅ Lithuanian chart imported: ${createdAccounts.length} created, ${skippedCount} skipped`);

    res.status(201).json({
      success: true,
      message: 'Lithuanian chart of accounts imported successfully',
      imported: createdAccounts.length,
      skipped: skippedCount,
      total: lithuanianAccounts.length,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error importing Lithuanian chart:', error);
    res.status(500).json({
      success: false,
      error: 'Error importing Lithuanian chart of accounts',
      details: error.message
    });
  }
};

// 🧪 GET /api/company/chart-of-accounts/test/health - Health check
const testHealth = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    logger.info(`🧪 Chart of accounts health check for company: ${companyId}`);
    
    res.json({
      success: true,
      message: 'Chart of accounts API is healthy',
      timestamp: new Date().toISOString(),
      companyId: parseInt(companyId || 0)
    });
  } catch (error) {
    logger.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
};

module.exports = {
  getChartOfAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountsStats,
  importLithuanianChart,
  testHealth
};