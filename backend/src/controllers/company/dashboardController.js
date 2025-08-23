//b/src/controllers/company/dashboardController.js
const { logger } = require('../../config/logger');
const prismaManager = require('../../utils/prismaManager');
const getCompanyDashboard = async (req, res) => {
  
  try {
    const userId = req.user.id;
    const companyId = req.headers['x-company-id'];

    logger.info(`🏭 Getting company dashboard for user ${userId}, company ${companyId}`);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required in x-company-id header'
      });
    }

    const prisma = prismaManager.prisma;

    // Параллельно получаем все данные
    const [
      company,
      clientsCount,
      productsCount,
      salesCount,
      purchasesCount,
      totalSalesAmount,
      totalPurchasesAmount,
      recentSales,
      recentPurchases
    ] = await Promise.all([
      // Информация о компании
      prisma.companies.findUnique({
        where: { id: parseInt(companyId) },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true
            }
          }
        }
      }),

      // Количество клиентов
      prisma.clients.count({
        where: { company_id: parseInt(companyId) }
      }),

      // Количество продуктов
      prisma.products.count({
        where: { company_id: parseInt(companyId) }
      }),

      // Количество продаж
      prisma.sales.count({
        where: { company_id: parseInt(companyId) }
      }),

      // Количество закупок
      prisma.purchases.count({
        where: { company_id: parseInt(companyId) }
      }),

      // Общая сумма продаж
      prisma.sales.aggregate({
        where: { company_id: parseInt(companyId) },
        _sum: { total_amount: true }
      }),

      // Общая сумма закупок
      prisma.purchases.aggregate({
        where: { company_id: parseInt(companyId) },
        _sum: { total_amount: true }
      }),

      // Последние 5 продаж
      prisma.sales.findMany({
        where: { company_id: parseInt(companyId) },
        include: {
          client: {
            select: { name: true, email: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      }),

      // Последние 5 закупок
      prisma.purchases.findMany({
        where: { company_id: parseInt(companyId) },
        include: {
          supplier: {
            select: { name: true, email: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      })
    ]);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Формируем ответ
    const dashboardData = {
      success: true,
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
        director_name: company.director_name,
        is_active: company.is_active,
        owner: company.owner
      },
      statistics: {
        clients: {
          count: clientsCount,
          label: 'Клиенты'
        },
        products: {
          count: productsCount,
          label: 'Товары'
        },
        sales: {
          count: salesCount,
          amount: totalSalesAmount._sum.total_amount || 0,
          currency: company.base_currency,
          label: 'Продажи'
        },
        purchases: {
          count: purchasesCount,
          amount: totalPurchasesAmount._sum.total_amount || 0,
          currency: company.base_currency,
          label: 'Закупки'
        }
      },
      recent: {
        sales: recentSales.map(sale => ({
          id: sale.id,
          document_number: sale.document_number,
          document_date: sale.document_date,
          total_amount: sale.total_amount,
          currency: sale.currency,
          client: sale.client?.name || 'Не указан',
          status: sale.document_status
        })),
        purchases: recentPurchases.map(purchase => ({
          id: purchase.id,
          document_number: purchase.document_number,
          document_date: purchase.document_date,
          total_amount: purchase.total_amount,
          currency: purchase.currency,
          supplier: purchase.supplier?.name || 'Не указан',
          status: purchase.document_status
        }))
      },
      timestamp: new Date().toISOString()
    };

    logger.info(`✅ Company dashboard loaded successfully for company ${companyId}`);
    res.json(dashboardData);

  } catch (error) {
    logger.error('❌ Error getting company dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

/**
 * Получить быструю статистику компании
 */
const getQuickStats = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    const prisma = prismaManager.prisma;

    // Быстрая статистика за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [todaySales, monthSales, monthPurchases] = await Promise.all([
      // Продажи за сегодня
      prisma.sales.aggregate({
        where: {
          company_id: parseInt(companyId),
          document_date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { total_amount: true },
        _count: true
      }),

      // Продажи за месяц
      prisma.sales.aggregate({
        where: {
          company_id: parseInt(companyId),
          document_date: { gte: thirtyDaysAgo }
        },
        _sum: { total_amount: true },
        _count: true
      }),

      // Закупки за месяц
      prisma.purchases.aggregate({
        where: {
          company_id: parseInt(companyId),
          document_date: { gte: thirtyDaysAgo }
        },
        _sum: { total_amount: true },
        _count: true
      })
    ]);

    res.json({
      success: true,
      stats: {
        today: {
          sales_count: todaySales._count,
          sales_amount: todaySales._sum.total_amount || 0
        },
        month: {
          sales_count: monthSales._count,
          sales_amount: monthSales._sum.total_amount || 0,
          purchases_count: monthPurchases._count,
          purchases_amount: monthPurchases._sum.total_amount || 0
        }
      }
    });

  } catch (error) {
    logger.error('❌ Error getting quick stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getCompanyDashboard,
  getQuickStats
};
//     success: true,
