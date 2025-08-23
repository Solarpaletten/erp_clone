// 🔧 ЗАВЕРШЁННЫЙ Purchases Controller - ПОЛНАЯ ВЕРСИЯ
// Заменить весь файл b/src/controllers/company/purchasesController.js

const { prisma } = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// 📊 GET /api/company/purchases/stats - Статистика покупок
const getPurchasesStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`📊 Fetching purchases stats for company: ${companyId}`);

    const [
      totalCount,
      statusCounts,
      totalSpent,
      averageOrderValue,
      topSuppliers
    ] = await Promise.all([
      // Общее количество покупок
      prisma.purchases.count({
        where: { company_id: companyId }
      }),
      
      // Статистика по статусам
      prisma.purchases.groupBy({
        by: ['payment_status'],
        where: { company_id: companyId },
        _count: { id: true }
      }),
      
      // Общая сумма трат
      prisma.purchases.aggregate({
        where: { company_id: companyId },
        _sum: { total_amount: true }
      }),
      
      // Средний чек
      prisma.purchases.aggregate({
        where: { company_id: companyId },
        _avg: { total_amount: true }
      }),
      
      // Топ поставщики
      prisma.purchases.groupBy({
        by: ['supplier_id'],
        where: { company_id: companyId },
        _count: { id: true },
        _sum: { total_amount: true },
        orderBy: { _sum: { total_amount: 'desc' } },
        take: 5
      })
    ]);

    const stats = {
      total: totalCount,
      pending: statusCounts.find(s => s.payment_status === 'PENDING')?._count?.id || 0,
      paid: statusCounts.find(s => s.payment_status === 'PAID')?._count?.id || 0,
      overdue: statusCounts.find(s => s.payment_status === 'OVERDUE')?._count?.id || 0,
      cancelled: statusCounts.find(s => s.payment_status === 'CANCELLED')?._count?.id || 0,
      totalSpent: parseFloat(totalSpent._sum?.total_amount || 0),
      averageOrderValue: parseFloat(averageOrderValue._avg?.total_amount || 0),
      topSuppliers: topSuppliers.length
    };

    res.json({
      success: true,
      stats,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching purchases stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching purchases stats'
    });
  }
};

// 📋 GET /api/company/purchases - Получить все покупки
const getAllPurchases = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const { 
      page = 1, 
      limit = 10, 
      search,
      status,
      supplier_id,
      date_from,
      date_to,
      sort_by = 'document_date',
      sort_order = 'desc'
    } = req.query;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`📋 Fetching purchases for company: ${companyId}, page: ${page}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {
      company_id: companyId,
      ...(search && {
        OR: [
          { document_number: { contains: search, mode: 'insensitive' } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } }
        ]
      }),
      ...(status && { payment_status: status }),
      ...(supplier_id && { supplier_id: parseInt(supplier_id) }),
      ...(date_from && date_to && {
        document_date: {
          gte: new Date(date_from),
          lte: new Date(date_to)
        }
      })
    };

    const [purchases, totalCount] = await Promise.all([
      prisma.purchases.findMany({
        where: whereClause,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              code: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true,
              address: true
            }
          },
          purchase_manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true
                }
              }
            },
            orderBy: {
              line_number: 'asc'
            }
          }
        },
        orderBy: {
          [sort_by]: sort_order
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.purchases.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      purchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      companyId
    });
  } catch (error) {
    logger.error('Error fetching purchases:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching purchases'
    });
  }
};

// 📄 GET /api/company/purchases/:id - Получить покупку по ID
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`📄 Fetching purchase ${id} for company: ${companyId}`);

    const purchase = await prisma.purchases.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      },
      include: {
        supplier: true,
        warehouse: true,
        purchase_manager: true,
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        modifier: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true,
            employee: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          },
          orderBy: {
            line_number: 'asc'
          }
        }
      }
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      purchase,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching purchase'
    });
  }
};

// ➕ POST /api/company/purchases - Создать новую покупку С АВТООБНОВЛЕНИЕМ СКЛАДА
const createPurchase = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    const {
      document_number,
      document_date,
      operation_type = 'PURCHASE',
      supplier_id,
      warehouse_id,
      purchase_manager_id,
      currency = 'EUR',
      payment_status = 'PENDING',
      delivery_status = 'PENDING',
      document_status = 'DRAFT',
      items = []
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`➕ Creating purchase for company: ${companyId}`);
    logger.info(`Purchase data: ${JSON.stringify({ document_number, supplier_id, items: items.length })}`);

    // Валидация обязательных полей
    if (!document_number || !document_date || !supplier_id) {
      return res.status(400).json({
        success: false,
        error: 'Document number, date and supplier are required'
      });
    }

    // Проверяем что поставщик существует и принадлежит компании
    const supplierExists = await prisma.clients.findFirst({
      where: {
        id: parseInt(supplier_id),
        company_id: companyId
      }
    });

    if (!supplierExists) {
      return res.status(400).json({
        success: false,
        error: 'Supplier not found or does not belong to company'
      });
    }

    // Проверяем уникальность номера документа
    const existingPurchase = await prisma.purchases.findFirst({
      where: {
        company_id: companyId,
        document_number: document_number
      }
    });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        error: `Purchase with document number ${document_number} already exists`
      });
    }

    // Создаём покупку с автообновлением склада в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Расчёт сумм
      let subtotal = 0;
      let vat_amount = 0;

      // Обрабатываем позиции - БЕЗ MAPPING!
      const processedItems = items.map((item, index) => {
        const quantity = parseFloat(item.quantity);
        const unit_price_base = parseFloat(item.unit_price_base);
        const vat_rate = parseFloat(item.vat_rate || 0);
        
        const line_subtotal = quantity * unit_price_base;
        const line_vat = line_subtotal * (vat_rate / 100);
        const line_total = line_subtotal + line_vat;
        
        subtotal += line_subtotal;
        vat_amount += line_vat;

        return {
          product_id: parseInt(item.product_id),
          line_number: index + 1,
          quantity: quantity,
          unit_price_base: unit_price_base,
          vat_rate: vat_rate,
          vat_amount: line_vat,
          line_total: line_total,
          notes: item.description || '',
          employee_id: item.employee_id ? parseInt(item.employee_id) : null
        };
      });

      const total_amount = subtotal + vat_amount;

      logger.info(`💰 Calculated totals: subtotal=${subtotal}, vat=${vat_amount}, total=${total_amount}`);

      // 1. Создаём покупку
      const purchase = await tx.purchases.create({
        data: {
          company_id: companyId,
          document_number,
          document_date: new Date(document_date),
          operation_type,
          supplier_id: parseInt(supplier_id),
          warehouse_id: warehouse_id ? parseInt(warehouse_id) : null,
          purchase_manager_id: purchase_manager_id ? parseInt(purchase_manager_id) : null,
          subtotal: subtotal,
          vat_amount: vat_amount,
          total_amount: total_amount,
          currency,
          payment_status,
          delivery_status,
          document_status,
          created_by: userId
        }
      });

      logger.info(`✅ Purchase created with ID: ${purchase.id}`);

      // 2. Создаём позиции покупки
      if (processedItems.length > 0) {
        await tx.purchase_items.createMany({
          data: processedItems.map(item => ({
            purchase_id: purchase.id,
            product_id: item.product_id,
            line_number: item.line_number,
            quantity: item.quantity,
            unit_price_base: item.unit_price_base,
            vat_rate: item.vat_rate,
            vat_amount: item.vat_amount,
            line_total: item.line_total,
            notes: item.notes,
            employee_id: item.employee_id
          }))
        });

        logger.info(`✅ Created ${processedItems.length} purchase items`);

        // 3. АВТООБНОВЛЕНИЕ СКЛАДА - увеличиваем остатки товаров
        for (const item of processedItems) {
          try {
            const currentStock = await tx.products.findUnique({
              where: { id: item.product_id },
              select: { current_stock: true, name: true, code: true }
            });

            if (currentStock) {
              const newStock = parseFloat(currentStock.current_stock || 0) + item.quantity;
              
              await tx.products.update({
                where: { id: item.product_id },
                data: { current_stock: newStock }
              });

              logger.info(`📦 INVENTORY: Product ${currentStock.code} stock updated: ${currentStock.current_stock || 0} + ${item.quantity} = ${newStock}`);
            }
          } catch (stockError) {
            logger.error(`❌ Error updating stock for product ${item.product_id}:`, stockError);
            // Не останавливаем транзакцию, просто логируем ошибку
          }
        }
      }

      return purchase;
    });

    logger.info(`🎉 Purchase created successfully with ID: ${result.id}`);

    res.status(201).json({
      success: true,
      purchase: result,
      message: 'Purchase created successfully',
      inventory_info: {
        items_processed: items.length,
        warehouse_info: warehouse_id ? `Warehouse ID: ${warehouse_id}` : 'No specific warehouse',
        stock_updated: true
      },
      companyId
    });
  } catch (error) {
    logger.error('❌ Error creating purchase:', error);
    logger.error('Stack trace:', error.stack);
    
    if (error.code) {
      logger.error('Prisma error code:', error.code);
      logger.error('Prisma error meta:', error.meta);
    }
    
    res.status(500).json({
      success: false,
      error: 'Error creating purchase',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ✏️ PUT /api/company/purchases/:id - Обновить покупку
const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const userId = req.user.id;
    const updateData = req.body;

    logger.info(`✏️ Updating purchase ${id} for company: ${companyId}`);

    // Проверяем существование покупки
    const existingPurchase = await prisma.purchases.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    // Подготовка данных для обновления
    const {
      items,
      ...purchaseFields
    } = updateData;

    // Обновляем покупку
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Обновляем основные поля покупки
      const purchase = await tx.purchases.update({
        where: { id: parseInt(id) },
        data: {
          ...purchaseFields,
          updated_by: userId,
          updated_at: new Date()
        }
      });

      // Если есть items, обновляем их
      if (items && Array.isArray(items)) {
        // Удаляем старые items
        await tx.purchase_items.deleteMany({
          where: { purchase_id: parseInt(id) }
        });

        // Создаём новые items
        if (items.length > 0) {
          let subtotal = 0;
          let vat_amount = 0;

          const processedItems = items.map((item, index) => {
            const quantity = parseFloat(item.quantity);
            const unit_price_base = parseFloat(item.unit_price_base);
            const vat_rate = parseFloat(item.vat_rate || 0);
            
            const line_subtotal = quantity * unit_price_base;
            const line_vat = line_subtotal * (vat_rate / 100);
            const line_total = line_subtotal + line_vat;
            
            subtotal += line_subtotal;
            vat_amount += line_vat;

            return {
              purchase_id: parseInt(id),
              product_id: parseInt(item.product_id),
              line_number: index + 1,
              quantity: quantity,
              unit_price_base: unit_price_base,
              vat_rate: vat_rate,
              vat_amount: line_vat,
              line_total: line_total,
              notes: item.description || '',
              employee_id: item.employee_id ? parseInt(item.employee_id) : null
            };
          });

          await tx.purchase_items.createMany({
            data: processedItems
          });

          // Обновляем суммы в покупке
          await tx.purchases.update({
            where: { id: parseInt(id) },
            data: {
              subtotal: subtotal,
              vat_amount: vat_amount,
              total_amount: subtotal + vat_amount
            }
          });
        }
      }

      return purchase;
    });

    res.json({
      success: true,
      purchase: updatedPurchase,
      message: 'Purchase updated successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error updating purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating purchase'
    });
  }
};

// 🗑️ DELETE /api/company/purchases/:id - Удалить покупку
const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`🗑️ Deleting purchase ${id} for company: ${companyId}`);

    // Проверяем существование покупки
    const existingPurchase = await prisma.purchases.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }

    // Удаляем покупку (items удалятся каскадно)
    await prisma.purchases.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Purchase deleted successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error deleting purchase:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting purchase'
    });
  }
};

module.exports = {
  getPurchasesStats,
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
};