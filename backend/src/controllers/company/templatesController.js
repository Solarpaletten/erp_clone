// =====================================================
// 📋 templatesController.js - Управление шаблонами
// Файл: b/src/controllers/company/templatesController.js
// =====================================================

/**
 * 📋 ПОЛУЧЕНИЕ ВСЕХ ШАБЛОНОВ ДЛЯ КОМПАНИИ
 * GET /api/airborne/templates
 */
const getAllTemplates = async (req, res) => {
    try {
      const companyId = req.companyContext.companyId;
  
      // Получаем все шаблоны компании
      const [warehouseTemplates, productTemplates, clientTemplates, purchaseTemplates, saleTemplates] = await Promise.all([
        req.prisma.warehouses.findMany({
          where: { company_id: companyId, is_template: true },
          orderBy: { created_at: 'desc' }
        }),
        req.prisma.products.findMany({
          where: { company_id: companyId, is_template: true },
          include: { warehouse: true },
          orderBy: { created_at: 'desc' }
        }),
        req.prisma.clients.findMany({
          where: { company_id: companyId, is_template: true },
          orderBy: { created_at: 'desc' }
        }),
        req.prisma.purchases.findMany({
          where: { company_id: companyId, is_template: true },
          include: { 
            client: true, 
            warehouse: true,
            items: { include: { product: true } }
          },
          orderBy: { created_at: 'desc' }
        }),
        req.prisma.sales.findMany({
          where: { company_id: companyId, is_template: true },
          include: { 
            client: true, 
            warehouse: true,
            items: { include: { product: true } }
          },
          orderBy: { created_at: 'desc' }
        })
      ]);
  
      res.json({
        success: true,
        templates: {
          warehouses: warehouseTemplates,
          products: productTemplates,
          clients: clientTemplates,
          purchases: purchaseTemplates,
          sales: saleTemplates
        },
        count: {
          warehouses: warehouseTemplates.length,
          products: productTemplates.length,
          clients: clientTemplates.length,
          purchases: purchaseTemplates.length,
          sales: saleTemplates.length,
          total: warehouseTemplates.length + productTemplates.length + clientTemplates.length + purchaseTemplates.length + saleTemplates.length
        }
      });
  
    } catch (error) {
      console.error('Error getting templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get templates'
      });
    }
  };
  
  /**
   * 🎯 ПОЛУЧЕНИЕ ШАБЛОНОВ ДЛЯ БЫСТРОГО ДОСТУПА (для модального окна)
   * GET /api/airborne/templates/quick-access
   */
  const getTemplatesForQuickAccess = async (req, res) => {
    try {
      const companyId = req.companyContext.companyId;
      
      // Получаем шаблоны и последние документы для быстрого копирования
      const [purchaseTemplates, saleTemplates, recentPurchases, recentSales] = await Promise.all([
        req.prisma.purchases.findMany({
          where: {
            company_id: companyId,
            is_template: true
          },
          include: { 
            client: true,
            items: { include: { product: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 5
        }),
        
        req.prisma.sales.findMany({
          where: {
            company_id: companyId,
            is_template: true
          },
          include: { 
            client: true,
            items: { include: { product: true } }
          },
          orderBy: { created_at: 'desc' },
          take: 5
        }),
        
        // Последние 5 документов для быстрого копирования
        req.prisma.purchases.findMany({
          where: {
            company_id: companyId,
            is_template: false,
            status: { not: 'CANCELLED' }
          },
          include: { 
            client: true,
            items: { include: { product: true } }
          },
          orderBy: { doc_date: 'desc' },
          take: 5
        }),
  
        req.prisma.sales.findMany({
          where: {
            company_id: companyId,
            is_template: false,
            status: { not: 'CANCELLED' }
          },
          include: { 
            client: true,
            items: { include: { product: true } }
          },
          orderBy: { doc_date: 'desc' },
          take: 5
        })
      ]);
  
      // Форматируем для фронтенда
      const formatTemplate = (doc, type) => ({
        id: doc.id,
        name: `${doc.doc_number || 'N/A'} - ${doc.client.name}`,
        amount: doc.total_gross || doc.total_amount || 0,
        date: doc.doc_date || doc.created_at,
        type: type,
        client: doc.client.name,
        itemsCount: doc.items?.length || 0,
        firstProduct: doc.items?.[0]?.product?.name || null
      });
  
      res.json({
        success: true,
        templates: {
          purchases: purchaseTemplates.map(t => formatTemplate(t, 'purchase_template')),
          sales: saleTemplates.map(t => formatTemplate(t, 'sale_template')),
          recentPurchases: recentPurchases.map(d => formatTemplate(d, 'recent_purchase')),
          recentSales: recentSales.map(d => formatTemplate(d, 'recent_sale'))
        },
        defaultFlags: {
          copyPurchase: true,  // По умолчанию только приход
          copySale: false,
          copySupplierPayment: false,
          copyCustomerPayment: false
        }
      });
  
    } catch (error) {
      console.error('Error getting templates for quick access:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get templates for quick access'
      });
    }
  };
  
  /**
   * 🔄 ИЗМЕНЕНИЕ ПОРЯДКА ШАБЛОНОВ (drag-and-drop)
   * POST /api/airborne/templates/reorder
   */
  const reorderTemplates = async (req, res) => {
    try {
      const { items, templateType } = req.body; // items: [{ id, order }]
      const companyId = req.companyContext.companyId;
  
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'Items array is required'
        });
      }
  
      if (!templateType || !['purchases', 'sales', 'clients', 'products', 'warehouses'].includes(templateType)) {
        return res.status(400).json({
          success: false,
          error: 'Valid templateType is required'
        });
      }
  
      // Определяем таблицу для обновления
      const tableMap = {
        purchases: 'purchases',
        sales: 'sales', 
        clients: 'clients',
        products: 'products',
        warehouses: 'warehouses'
      };
  
      const tableName = tableMap[templateType];
  
      // Обновляем порядок в транзакции
      await req.prisma.$transaction(async (tx) => {
        for (const item of items) {
          await tx[tableName].updateMany({
            where: {
              id: item.id,
              company_id: companyId,
              is_template: true
            },
            data: {
              display_order: item.order
            }
          });
        }
      });
  
      res.json({
        success: true,
        message: `Порядок ${templateType} шаблонов обновлен!`,
        updatedCount: items.length
      });
  
    } catch (error) {
      console.error('Error reordering templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reorder templates'
      });
    }
  };
  
  /**
   * 🗑️ УДАЛЕНИЕ ШАБЛОНА
   * DELETE /api/airborne/templates/:type/:id
   */
  const deleteTemplate = async (req, res) => {
    try {
      const { type, id } = req.params;
      const companyId = req.companyContext.companyId;
      const userId = req.user.id;
  
      if (!['warehouse', 'product', 'client', 'purchase', 'sale'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid template type'
        });
      }
  
      // Определяем таблицу
      const tableMap = {
        warehouse: 'warehouses',
        product: 'products',
        client: 'clients', 
        purchase: 'purchases',
        sale: 'sales'
      };
  
      const tableName = tableMap[type];
      const pluralType = tableName;
  
      // Проверяем что шаблон существует и принадлежит компании
      const template = await req.prisma[tableName].findFirst({
        where: {
          id: parseInt(id),
          company_id: companyId,
          is_template: true
        }
      });
  
      if (!template) {
        return res.status(404).json({
          success: false,
          error: 'Template not found'
        });
      }
  
      // Для базовых шаблонов (созданных системой) - запрещаем удаление
      if (template.name === 'масло рапсовое' || 
          template.name === 'Residues technical rapeseed oil' ||
          template.name === 'ASSET BILANS SPOLKA Z O O' ||
          template.name === 'SWAPOIL GMBH') {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete base system template',
          message: 'Нельзя удалить базовый системный шаблон'
        });
      }
  
      // Удаляем шаблон
      await req.prisma[tableName].delete({
        where: { id: parseInt(id) }
      });
  
      res.json({
        success: true,
        message: `${type} template deleted successfully`,
        deletedId: parseInt(id)
      });
  
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete template'
      });
    }
  };
  
  /**
   * 📊 СТАТИСТИКА ИСПОЛЬЗОВАНИЯ ШАБЛОНОВ
   * GET /api/airborne/templates/usage-stats
   */
  const getTemplateUsageStats = async (req, res) => {
    try {
      const companyId = req.companyContext.companyId;
  
      // Подсчитываем использование шаблонов
      const [totalCopies, recentActivity, topTemplates] = await Promise.all([
        // Общее количество копий (документы с пометкой "Копия от")
        req.prisma.purchases.count({
          where: {
            company_id: companyId,
            notes: { contains: 'Копия от' }
          }
        }) + await req.prisma.sales.count({
          where: {
            company_id: companyId,
            notes: { contains: 'Копия от' }
          }
        }),
  
        // Активность за последние 7 дней
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
  
        // Самые используемые шаблоны (приблизительно по клиентам)
        req.prisma.clients.findMany({
          where: {
            company_id: companyId,
            is_template: true
          },
          select: {
            name: true,
            _count: {
              select: {
                purchases: true,
                sales: true
              }
            }
          }
        })
      ]);
  
      const timeSavedMinutes = totalCopies * 5; // 5 минут экономии на документ
  
      res.json({
        success: true,
        stats: {
          totalCopies,
          recentActivity,
          timeSavedMinutes,
          timeSavedHours: Math.floor(timeSavedMinutes / 60),
          topTemplates: topTemplates.map(t => ({
            name: t.name,
            totalUses: t._count.purchases + t._count.sales
          })).sort((a, b) => b.totalUses - a.totalUses).slice(0, 5),
          efficiency: {
            documentsPerDay: (recentActivity / 7).toFixed(1),
            timePerDocument: '10 секунд (vs 5 минут обычно)',
            efficiency: '3000% ускорение'
          }
        }
      });
  
    } catch (error) {
      console.error('Error getting template usage stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get template usage stats'
      });
    }
  };
  
  module.exports = {
    getAllTemplates,
    getTemplatesForQuickAccess,
    reorderTemplates,
    deleteTemplate,
    getTemplateUsageStats
  };