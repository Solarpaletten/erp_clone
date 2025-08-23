// b/src/controllers/accountContextController.js
const prismaManager = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

/**
 * 🔄 ACCOUNT CONTEXT CONTROLLER
 * Управление переключением между Account Level и Company Level
 */

// Переключиться на компанию (Account → Company Level)
const switchToCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    const userId = req.user.id;

    logger.info('Account Context: переключение на компанию', {
      userId,
      companyId
    });

    // Проверяем права доступа к компании
    const access = await prismaManager.getAccountPrisma().company_users.findFirst({
      where: {
        user_id: userId,
        company_id: parseInt(companyId)
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
          }
        }
      }
    });

    if (!access) {
      return res.status(403).json({
        success: false,
        error: 'Нет доступа к этой компании'
      });
    }

    // Получаем метрики компании для дашборда
    try {
      const companyPrisma = prismaManager.getCompanyPrisma(companyId);
      
      const [clientsCount, salesCount, productsCount, recentSales] = await Promise.all([
        companyPrisma.clients.count(),
        companyPrisma.sales.count(),
        companyPrisma.products.count(),
        companyPrisma.sales.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            client: {
              select: { name: true }
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          company: access.company,
          userRole: access.role,
          userPermissions: access.permissions,
          dashboardData: {
            metrics: {
              clients: clientsCount,
              sales: salesCount,
              products: productsCount
            },
            recentSales: recentSales
          }
        },
        message: `Переключились на компанию: ${access.company.name}`
      });

    } catch (companyError) {
      logger.warn('Ошибка получения данных компании, но доступ разрешен:', companyError);
      
      // Возвращаем базовую информацию без метрик
      res.json({
        success: true,
        data: {
          company: access.company,
          userRole: access.role,
          userPermissions: access.permissions,
          dashboardData: {
            metrics: { clients: 0, sales: 0, products: 0 },
            recentSales: []
          }
        },
        message: `Переключились на компанию: ${access.company.name}`
      });
    }

  } catch (error) {
    logger.error('Account Context: ошибка переключения на компанию:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка переключения на компанию'
    });
  }
};

// Получить доступные компании для переключения
const getAvailableCompanies = async (req, res) => {
  try {
    const userId = req.user.id;

    logger.info('Account Context: получение доступных компаний', { userId });

    const companies = await prismaManager.getAccountPrisma().companies.findMany({
      where: {
        company_users: {
          some: {
            user_id: userId
          }
        }
      },
      include: {
        company_users: {
          where: { user_id: userId },
          select: { role: true }
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        company_users: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: {
        companies: companies.map(company => ({
          id: company.id,
          name: company.name,
          code: company.code,
          description: company.description,
          userRole: company.company_users[0]?.role || 'user'
        }))
      }
    });

  } catch (error) {
    logger.error('Account Context: ошибка получения компаний:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка компаний'
    });
  }
};

module.exports = {
  switchToCompany,
  getAvailableCompanies
};
