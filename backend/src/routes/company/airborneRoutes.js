// =====================================================
// 🛣️ airborneRoutes.js - Все роуты "Воздушной Бухгалтерии"
// Файл: b/src/routes/company/airborneRoutes.js
// =====================================================

const express = require('express');
const router = express.Router();

// Controllers
const { 
  initCompanyTemplates, 
  checkTemplatesExist 
} = require('../../controllers/company/airborneController');

const {
  flexibleCopy,
  getTemplatesForFlexibleCopy
} = require('../../controllers/company/flexibleCopyController');

const {
  getAllTemplates,
  getTemplatesForQuickAccess,
  reorderTemplates,
  deleteTemplate,
  getTemplateUsageStats
} = require('../../controllers/company/templatesController');

// =====================================================
// 🏗️ ИНИЦИАЛИЗАЦИЯ ШАБЛОНОВ
// =====================================================

/**
 * POST /api/airborne/company/init-templates
 * 🚀 Создание базового набора шаблонов для компании
 */
router.post('/company/init-templates', initCompanyTemplates);

/**
 * GET /api/airborne/company/:id/templates/check  
 * 🔍 Проверка существования базовых шаблонов
 */
router.get('/company/:id/templates/check', checkTemplatesExist);

// =====================================================
// ⚡ ГИБКОЕ КОПИРОВАНИЕ (ГЛАВНАЯ ФИЧА!)
// =====================================================

/**
 * POST /api/airborne/flexible-copy
 * 🎯 Гибкое копирование с флагами - РЕВОЛЮЦИОННЫЙ API!
 */
router.post('/flexible-copy', flexibleCopy);

/**
 * GET /api/airborne/templates/for-flexible-copy
 * 📋 Получение шаблонов для модального окна копирования
 */
router.get('/templates/for-flexible-copy', getTemplatesForFlexibleCopy);

// =====================================================
// 📋 УПРАВЛЕНИЕ ШАБЛОНАМИ
// =====================================================

/**
 * GET /api/airborne/templates
 * 📋 Получение всех шаблонов компании
 */
router.get('/templates', getAllTemplates);

/**
 * GET /api/airborne/templates/quick-access
 * ⚡ Получение шаблонов для быстрого доступа
 */
router.get('/templates/quick-access', getTemplatesForQuickAccess);

/**
 * POST /api/airborne/templates/reorder
 * 🔄 Изменение порядка шаблонов (drag-and-drop)
 */
router.post('/templates/reorder', reorderTemplates);

/**
 * DELETE /api/airborne/templates/:type/:id
 * 🗑️ Удаление шаблона
 */
router.delete('/templates/:type/:id', deleteTemplate);

/**
 * GET /api/airborne/templates/usage-stats
 * 📊 Статистика использования шаблонов
 */
router.get('/templates/usage-stats', getTemplateUsageStats);

// =====================================================
// 📊 СТАТИСТИКА И АНАЛИТИКА
// =====================================================

/**
 * GET /api/airborne/stats/time-saved
 * ⏱️ Статистика экономии времени
 */
router.get('/stats/time-saved', async (req, res) => {
  try {
    const companyId = req.companyContext.companyId;
    
    // Подсчитываем сколько документов было скопировано
    const [copiedPurchases, copiedSales, totalDocuments] = await Promise.all([
      req.prisma.purchases.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' }
        }
      }),
      req.prisma.sales.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' }
        }
      }),
      req.prisma.purchases.count({
        where: { company_id: companyId }
      }) + await req.prisma.sales.count({
        where: { company_id: companyId }
      })
    ]);
    
    const totalCopies = copiedPurchases + copiedSales;
    const timesSaved = totalCopies * 5; // 5 минут на документ
    
    res.json({
      success: true,
      stats: {
        totalCopies,
        copiedPurchases,
        copiedSales,
        minutesSaved: timesSaved,
        hoursSaved: Math.floor(timesSaved / 60),
        daysSaved: Math.floor(timesSaved / (60 * 8)), // 8 часовой рабочий день
        efficiency: totalDocuments > 0 ? ((totalCopies / totalDocuments) * 100).toFixed(1) + '%' : '0%',
        message: `Сэкономлено ${timesSaved} минут благодаря Воздушной Бухгалтерии!`
      }
    });
    
  } catch (error) {
    console.error('Error getting time saved stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

/**
 * GET /api/airborne/stats/dashboard
 * 📈 Dashboard статистика для главной страницы
 */
router.get('/stats/dashboard', async (req, res) => {
  try {
    const companyId = req.companyContext.companyId;
    
    const [
      todayCopies,
      weekCopies,
      monthCopies,
      totalTemplates,
      mostUsedClient
    ] = await Promise.all([
      // Копии сегодня
      req.prisma.purchases.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }) + await req.prisma.sales.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Копии за неделю
      req.prisma.purchases.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }) + await req.prisma.sales.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Копии за месяц
      req.prisma.purchases.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }) + await req.prisma.sales.count({
        where: {
          company_id: companyId,
          notes: { contains: 'Копия от' },
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Всего шаблонов
      req.prisma.warehouses.count({
        where: { company_id: companyId, is_template: true }
      }) + await req.prisma.products.count({
        where: { company_id: companyId, is_template: true }
      }) + await req.prisma.clients.count({
        where: { company_id: companyId, is_template: true }
      }),
      
      // Самый используемый клиент
      req.prisma.clients.findFirst({
        where: { company_id: companyId, is_template: true },
        select: { name: true },
        orderBy: [
          { purchases: { _count: 'desc' } },
          { sales: { _count: 'desc' } }
        ]
      })
    ]);

    res.json({
      success: true,
      dashboard: {
        today: {
          copies: todayCopies,
          timeSaved: `${todayCopies * 5} мин`
        },
        week: {
          copies: weekCopies,
          timeSaved: `${Math.floor(weekCopies * 5 / 60)} ч ${weekCopies * 5 % 60} мин`
        },
        month: {
          copies: monthCopies,
          timeSaved: `${Math.floor(monthCopies * 5 / 60)} ч ${monthCopies * 5 % 60} мин`
        },
        templates: {
          total: totalTemplates,
          ready: totalTemplates > 0
        },
        mostUsed: mostUsedClient?.name || 'Нет данных',
        airborneStatus: totalTemplates > 0 ? 'READY' : 'SETUP_REQUIRED'
      }
    });
    
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard stats'
    });
  }
});

// =====================================================
// 🚨 ERROR HANDLING
// =====================================================

// Middleware для обработки ошибок специфичных для Airborne API
router.use((error, req, res, next) => {
  if (error.code === 'TEMPLATE_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: 'Template not found',
      message: 'Шаблон не найден. Создайте базовые шаблоны через /init-templates'
    });
  }
  
  if (error.code === 'COPY_FAILED') {
    return res.status(500).json({
      success: false,
      error: 'Copy operation failed',
      message: 'Ошибка копирования документа. Попробуйте еще раз.'
    });
  }
  
  if (error.code === 'INSUFFICIENT_PERMISSIONS') {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions',
      message: 'Недостаточно прав для выполнения операции'
    });
  }
  
  next(error);
});

// =====================================================
// 📚 DOCUMENTATION ENDPOINT
// =====================================================

/**
 * GET /api/airborne/docs
 * 📚 Документация по Воздушной Бухгалтерии API
 */
router.get('/docs', (req, res) => {
  res.json({
    title: '🚀 Воздушная Бухгалтерия API',
    version: '1.0.0',
    description: 'Революционное копирование документов за 10 секунд',
    
    endpoints: {
      initialization: {
        'POST /company/init-templates': 'Создание базового набора шаблонов',
        'GET /company/:id/templates/check': 'Проверка существования шаблонов'
      },
      
      flexibleCopy: {
        'POST /flexible-copy': '🎯 ГЛАВНАЯ ФИЧА - Гибкое копирование с флагами',
        'GET /templates/for-flexible-copy': 'Шаблоны для модального окна'
      },
      
      templates: {
        'GET /templates': 'Все шаблоны компании',
        'GET /templates/quick-access': 'Быстрый доступ к шаблонам',
        'POST /templates/reorder': 'Drag-and-drop сортировка',
        'DELETE /templates/:type/:id': 'Удаление шаблона',
        'GET /templates/usage-stats': 'Статистика использования'
      },
      
      stats: {
        'GET /stats/time-saved': 'Статистика экономии времени',
        'GET /stats/dashboard': 'Dashboard статистика'
      }
    },
    
    revolutionaryFeatures: [
      '⚡ 10 секунд вместо 5 минут на документ',
      '🎯 Гибкое копирование с галочками выбора',
      '📋 Полный баланс за 10 минут вместо 2-3 часов',
      '🚀 Конкурентное преимущество над всеми ERP',
      '💫 Drag-and-drop интерфейс',
      '📊 Детальная аналитика экономии времени'
    ],
    
    usage: {
      flexibleCopyRequest: {
        templateId: 123,
        copyPurchase: true,
        copySale: false,
        copySupplierPayment: false,
        copyCustomerPayment: true,
        changes: {
          quantity: 25,
          unit_price: 680
        }
      }
    },
    
    oilTradingOptimized: {
      defaultProduct: 'Residues technical rapeseed oil',
      defaultQuantity: '23 тонны',
      defaultPrice: '650 EUR/тонна',
      defaultVAT: '23%',
      accounts: {
        suppliers: '4430',
        customers: '2410', 
        bank: '2710',
        inventory: '2041'
      }
    }
  });
});

module.exports = router;