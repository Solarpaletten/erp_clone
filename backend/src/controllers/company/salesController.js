// b/src/controllers/company/salesController.js
const { prisma } = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// 📊 GET /api/company/sales/stats - Статистика продаж
const getSalesStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    logger.info(`📊 Fetching sales stats for company: ${companyId}`);

    const [
      totalSales,
      totalRevenue,
      avgOrderValue,
      statusStats,
      deliveryStats,
      topClients,
      monthlyStats
    ] = await Promise.all([
      // Общее количество продаж
      prisma.sales.count({
        where: { company_id: companyId }
      }),
      
      // Общая выручка
      prisma.sales.aggregate({
        where: { company_id: companyId },
        _sum: { total_amount: true }
      }),
      
      // Средний чек
      prisma.sales.aggregate({
        where: { company_id: companyId },
        _avg: { total_amount: true }
      }),
      
      // Статистика по статусам платежей
      prisma.sales.groupBy({
        by: ['payment_status'],
        where: { company_id: companyId },
        _count: true
      }),
      
      // Статистика по доставке
      prisma.sales.groupBy({
        by: ['delivery_status'],
        where: { company_id: companyId },
        _count: true
      }),
      
      // Топ клиенты
      prisma.sales.groupBy({
        by: ['client_id'],
        where: { company_id: companyId },
        _count: true,
        _sum: { total_amount: true },
        orderBy: { _sum: { total_amount: 'desc' } },
        take: 5
      }),
      
      // Продажи по месяцам (последние 12 месяцев)
      prisma.sales.groupBy({
        by: ['document_date'],
        where: {
          company_id: companyId,
          document_date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        },
        _sum: { total_amount: true },
        _count: true
      })
    ]);

    const stats = {
      total: totalSales,
      pending: statusStats.find(s => s.payment_status === 'PENDING')?._count || 0,
      paid: statusStats.find(s => s.payment_status === 'PAID')?._count || 0,
      overdue: statusStats.find(s => s.payment_status === 'OVERDUE')?._count || 0,
      cancelled: statusStats.find(s => s.payment_status === 'CANCELLED')?._count || 0,
      delivered: deliveryStats.find(s => s.delivery_status === 'DELIVERED')?._count || 0,
      pending_delivery: deliveryStats.find(s => s.delivery_status === 'PENDING')?._count || 0,
      totalRevenue: totalRevenue._sum.total_amount || 0,
      averageOrderValue: avgOrderValue._avg.total_amount || 0,
      topClients: topClients.length,
      monthlyRevenue: monthlyStats
    };

    res.json({
      success: true,
      stats,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching sales statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching sales statistics'
    });
  }
};

// 📋 GET /api/company/sales - Получить все продажи
const getAllSales = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const { 
      page = 1, 
      limit = 50, 
      search, 
      payment_status, 
      delivery_status,
      client_id,
      date_from,
      date_to,
      sort_by = 'document_date',
      sort_order = 'desc'
    } = req.query;

    logger.info(`📋 Fetching sales for company: ${companyId}`);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Построение условий фильтрации
    const whereConditions = {
      company_id: companyId
    };

    if (search) {
      whereConditions.OR = [
        { document_number: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (payment_status) {
      whereConditions.payment_status = payment_status;
    }

    if (delivery_status) {
      whereConditions.delivery_status = delivery_status;
    }

    if (client_id) {
      whereConditions.client_id = parseInt(client_id);
    }

    if (date_from || date_to) {
      whereConditions.document_date = {};
      if (date_from) whereConditions.document_date.gte = new Date(date_from);
      if (date_to) whereConditions.document_date.lte = new Date(date_to);
    }

    const [sales, totalCount] = await Promise.all([
      prisma.sales.findMany({
        where: whereConditions,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          sales_manager: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          _count: {
            select: {
              items: true
            }
          }
        },
        orderBy: {
          [sort_by]: sort_order
        },
        skip,
        take: parseInt(limit)
      }),
      
      prisma.sales.count({ where: whereConditions })
    ]);

    res.json({
      success: true,
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      },
      companyId
    });
  } catch (error) {
    logger.error('Error fetching sales:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching sales'
    });
  }
};

// 📄 GET /api/company/sales/:id - Получить продажу по ID
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`📄 Fetching sale ${id} for company: ${companyId}`);

    const sale = await prisma.sales.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      },
      include: {
        client: true,
        warehouse: true,
        sales_manager: true,
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
            product: true
          },
          orderBy: {
            line_number: 'asc'
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    res.json({
      success: true,
      sale,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching sale:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching sale'
    });
  }
};

// ➕ POST /api/company/sales - Создать новую продажу С АВТОСПИСАНИЕМ СО СКЛАДА
const createSale = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    const {
      document_number,
      document_date,
      document_type = 'INVOICE',
      delivery_date,
      due_date,
      client_id,
      warehouse_id,
      sales_manager_id,
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

    logger.info(`➕ Creating sale for company: ${companyId}`);
    logger.info(`📝 Sale data:`, {
      document_number,
      client_id,
      warehouse_id,
      items: items.length,
      companyId,
      userId
    });

    // Валидация
    if (!document_number || !document_date || !client_id) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: document_number, document_date, client_id'
      });
    }

    // Проверяем уникальность номера документа
    const existingSale = await prisma.sales.findFirst({
      where: {
        company_id: companyId,
        document_number
      }
    });

    if (existingSale) {
      return res.status(400).json({
        success: false,
        error: 'Sale with this document number already exists'
      });
    }

    // Проверяем что клиент существует
    const client = await prisma.clients.findFirst({
      where: { id: parseInt(client_id), company_id: companyId }
    });

    if (!client) {
      logger.error('❌ Client not found:', client_id);
      return res.status(400).json({
        success: false,
        error: `Client ${client_id} not found`
      });
    }

    logger.info(`✅ Client found: ${client.name}`);

    // 🔥 ПРЕДВАРИТЕЛЬНАЯ ПРОВЕРКА ОСТАТКОВ НА СКЛАДЕ
    logger.info(`📦 Checking stock availability for ${items.length} items...`);
    
    for (const item of items) {
      const product = await prisma.products.findUnique({
        where: { id: parseInt(item.product_id) },
        select: { 
          id: true,
          code: true, 
          name: true, 
          current_stock: true,
          unit: true 
        }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product with ID ${item.product_id} not found`
        });
      }

      const currentStock = parseFloat(product.current_stock || 0);
      const requestedQuantity = parseFloat(item.quantity);

      if (currentStock < requestedQuantity) {
        logger.error(`❌ Insufficient stock for ${product.name}`);
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}" (${product.code}). Available: ${currentStock} ${product.unit}, requested: ${requestedQuantity} ${product.unit}`
        });
      }

      logger.info(`✅ Stock OK: ${product.name} - Available: ${currentStock}, Requested: ${requestedQuantity}`);
    }

    // Расчёт сумм
    let subtotal = 0;
    let vat_amount = 0;
    let discount_amount = 0;

    const processedItems = items.map((item, index) => {
      const lineSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price_base);
      const lineDiscount = parseFloat(item.total_discount || 0);
      const lineAfterDiscount = lineSubtotal - lineDiscount;
      const vatAmount = lineAfterDiscount * (parseFloat(item.vat_rate || 0) / 100);
      const lineTotal = lineAfterDiscount + vatAmount;
      
      subtotal += lineSubtotal;
      vat_amount += vatAmount;
      discount_amount += lineDiscount;

      return {
        product_id: parseInt(item.product_id),
        line_number: index + 1,
        quantity: parseFloat(item.quantity),
        unit_price_base: parseFloat(item.unit_price_base),
        discount_percent: parseFloat(item.discount_percent || 0),
        total_discount: lineDiscount,
        vat_rate: parseFloat(item.vat_rate || 0),
        vat_amount: vatAmount,
        line_total: lineTotal,
        description: item.description || null
      };
    });

    const total_amount = subtotal - discount_amount + vat_amount;

    logger.info(`💰 Calculated amounts:`, {
      subtotal,
      vat_amount,
      discount_amount,
      total_amount,
      items: processedItems.length
    });

    // 🔥 СОЗДАНИЕ ПРОДАЖИ С АВТОМАТИЧЕСКИМ СПИСАНИЕМ СО СКЛАДА
    const sale = await prisma.$transaction(async (tx) => {
      // 1. Создаём продажу
      const newSale = await tx.sales.create({
        data: {
          company_id: companyId,
          document_number,
          document_date: new Date(document_date),
          document_type,
          delivery_date: delivery_date ? new Date(delivery_date) : null,
          due_date: due_date ? new Date(due_date) : null,
          client_id: parseInt(client_id),
          warehouse_id: warehouse_id ? parseInt(warehouse_id) : null,
          sales_manager_id: sales_manager_id ? parseInt(sales_manager_id) : null,
          subtotal,
          vat_amount,
          discount_amount,
          total_amount,
          currency,
          payment_status,
          delivery_status,
          document_status,
          created_by: userId,
          created_at: new Date()
        }
      });

      logger.info(`✅ Created sale: ${newSale.id}`);

      // 2. Создаём элементы продажи
      if (processedItems.length > 0) {
        await tx.sale_items.createMany({
          data: processedItems.map(item => ({
            sale_id: newSale.id,
            product_id: item.product_id,
            line_number: item.line_number,
            quantity: item.quantity,
            unit_price_base: item.unit_price_base,
            discount_percent: item.discount_percent,
            total_discount: item.total_discount,
            vat_rate: item.vat_rate,
            vat_amount: item.vat_amount,
            line_total: item.line_total,
            description: item.description
          }))
        });
        
        logger.info(`✅ Created ${processedItems.length} sale items`);

        // 🔥 3. АВТОМАТИЧЕСКОЕ СПИСАНИЕ СО СКЛАДА
        logger.info(`📦 Starting automatic stock decrease for ${processedItems.length} items...`);
        
        for (const item of processedItems) {
          // Получаем текущий товар
          const currentProduct = await tx.products.findUnique({
            where: { id: item.product_id },
            select: { 
              id: true,
              code: true, 
              name: true, 
              current_stock: true,
              unit: true 
            }
          });

          if (currentProduct) {
            const currentStock = parseFloat(currentProduct.current_stock || 0);
            const newStock = currentStock - item.quantity; // ПРОДАЖА = УМЕНЬШЕНИЕ

            // Обновляем остаток товара
            await tx.products.update({
              where: { id: item.product_id },
              data: { 
                current_stock: newStock,
                updated_at: new Date()
              }
            });

            logger.info(`📦 STOCK UPDATE: ${currentProduct.name} (${currentProduct.code})`);
            logger.info(`   Current: ${currentStock} ${currentProduct.unit || 'pcs'}`);
            logger.info(`   - Sale: ${item.quantity} ${currentProduct.unit || 'pcs'}`);
            logger.info(`   = New Stock: ${newStock} ${currentProduct.unit || 'pcs'}`);
          } else {
            logger.warn(`⚠️ Product ${item.product_id} not found for stock update`);
          }
        }

        logger.info(`🎉 All stock quantities decreased automatically!`);
      }

      return newSale;
    });

    // Получение созданной продажи с обновлёнными остатками
    const createdSale = await prisma.sales.findUnique({
      where: { id: sale.id },
      include: {
        client: true,
        warehouse: true,
        sales_manager: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                current_stock: true, // 🔥 ОБНОВЛЕННЫЙ ОСТАТОК
                unit: true,
                min_stock: true
              }
            }
          }
        }
      }
    });

    logger.info(`🎉 Sale created successfully: ${sale.id}`);

    // 🔥 ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О ДВИЖЕНИИ ТОВАРОВ
    const stockUpdates = processedItems.map(item => {
      const productItem = createdSale.items.find(i => i.product_id === item.product_id);
      const currentStock = parseFloat(productItem?.product?.current_stock || '0');
      const minStock = parseFloat(productItem?.product?.min_stock || '0');
      
      // Определяем статус остатка
      let stockStatus = 'OK';
      if (currentStock <= 0) stockStatus = 'OUT_OF_STOCK';
      else if (currentStock <= minStock) stockStatus = 'LOW_STOCK';
      
      return {
        product_id: item.product_id,
        product_name: productItem?.product?.name || 'Unknown',
        product_code: productItem?.product?.code || '',
        quantity_sold: item.quantity,
        new_stock: currentStock,
        min_stock: minStock,
        stock_status: stockStatus,
        unit: productItem?.product?.unit || 'pcs',
        operation: 'STOCK_DECREASE',
        warehouse_id: warehouse_id || null
      };
    });

    // Проверяем есть ли товары с низким остатком
    const lowStockWarnings = stockUpdates.filter(update => 
      update.stock_status === 'LOW_STOCK' || update.stock_status === 'OUT_OF_STOCK'
    );

    res.status(201).json({
      success: true,
      sale: createdSale,
      message: 'Sale created successfully and stock updated automatically',
      stock_updates: stockUpdates,
      warnings: lowStockWarnings.length > 0 ? {
        message: `${lowStockWarnings.length} products have low or zero stock`,
        items: lowStockWarnings
      } : null,
      summary: {
        total_items: processedItems.length,
        total_amount: total_amount,
        currency: currency,
        warehouse: warehouse_id ? `Warehouse ID: ${warehouse_id}` : 'No specific warehouse',
        stock_updated: true,
        low_stock_warnings: lowStockWarnings.length
      },
      companyId
    });
  } catch (error) {
    logger.error('❌ Error creating sale:', error);
    logger.error('Stack trace:', error.stack);
    
    if (error.code) {
      logger.error('Prisma error code:', error.code);
      logger.error('Prisma error meta:', error.meta);
    }
    
    res.status(500).json({
      success: false,
      error: 'Error creating sale',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🎯 SALES CONTROLLER - ВЫБОР ПАРТИЙ ДЛЯ ОТГРУЗКИ

// ===============================================
// 📦 ПОЛУЧЕНИЕ ДОСТУПНЫХ ПАРТИЙ ДЛЯ ТОВАРА
// ===============================================

const getAvailableBatches = async (req, res) => {
  try {
    const { productId, warehouseId } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`📦 Getting available batches for product ${productId} at warehouse ${warehouseId}`);

    // Получаем все доступные партии товара на складе
    const batches = await prisma.$queryRaw`
      SELECT 
        pb.id as batch_id,
        pb.batch_number,
        pb.supplier_id,
        c.name as supplier_name,
        pb.purchase_date,
        pb.expiry_date,
        pb.current_quantity,
        pb.unit_cost,
        pb.current_quantity * pb.unit_cost as total_value,
        p.unit,
        w.name as warehouse_name
      FROM product_batches pb
      JOIN clients c ON pb.supplier_id = c.id
      JOIN products p ON pb.product_id = p.id
      JOIN warehouses w ON pb.warehouse_id = w.id
      WHERE pb.company_id = ${companyId}
        AND pb.product_id = ${parseInt(productId)}
        AND pb.warehouse_id = ${parseInt(warehouseId)}
        AND pb.current_quantity > 0
        AND pb.status = 'ACTIVE'
      ORDER BY pb.purchase_date ASC, pb.id ASC
    `;

    // Дополнительная информация по товару
    const product = await prisma.products.findFirst({
      where: { 
        id: parseInt(productId), 
        company_id: companyId 
      },
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        current_stock: true
      }
    });

    res.json({
      success: true,
      product,
      batches: batches.map(batch => ({
        ...batch,
        // Форматируем даты
        purchase_date: new Date(batch.purchase_date).toLocaleDateString(),
        expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : null,
        // Форматируем числа
        current_quantity: parseFloat(batch.current_quantity),
        unit_cost: parseFloat(batch.unit_cost),
        total_value: parseFloat(batch.total_value)
      })),
      totalAvailable: batches.reduce((sum, batch) => sum + parseFloat(batch.current_quantity), 0),
      companyId
    });

  } catch (error) {
    logger.error('Error fetching available batches:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching available batches'
    });
  }
};

// ===============================================
// 🔥 СОЗДАНИЕ ПРОДАЖИ С АВТОМАТИЧЕСКИМ FIFO СПИСАНИЕМ
// ===============================================

const createSaleWithBatchTracking = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id;

    const {
      document_number,
      document_date,
      document_type = 'INVOICE',
      delivery_date,
      due_date,
      client_id,
      warehouse_id,
      sales_manager_id,
      currency = 'EUR',
      payment_status = 'PENDING',
      delivery_status = 'PENDING',
      document_status = 'DRAFT',
      items = []
    } = req.body;

    logger.info(`🛒 Creating sale with batch tracking for company: ${companyId}`);

    // Создаём продажу с FIFO списанием партий
    const sale = await prisma.$transaction(async (tx) => {
      
      // 1. Создаём продажу
      const newSale = await tx.sales.create({
        data: {
          company_id: companyId,
          document_number,
          document_date: new Date(document_date),
          document_type,
          delivery_date: delivery_date ? new Date(delivery_date) : null,
          due_date: due_date ? new Date(due_date) : null,
          client_id: parseInt(client_id),
          warehouse_id: warehouse_id ? parseInt(warehouse_id) : null,
          sales_manager_id: sales_manager_id ? parseInt(sales_manager_id) : null,
          subtotal: 0, // Пересчитаем после обработки партий
          vat_amount: 0,
          discount_amount: 0,
          total_amount: 0,
          currency,
          payment_status,
          delivery_status,
          document_status,
          created_by: userId
        }
      });

      let totalSubtotal = 0;
      let totalVatAmount = 0;
      let totalDiscountAmount = 0;

      // 2. Обрабатываем каждую позицию продажи
      for (const [index, item] of items.entries()) {
        const requestedQuantity = parseFloat(item.quantity);
        const salePrice = parseFloat(item.unit_price_base);
        
        logger.info(`📦 Processing sale item: Product ${item.product_id}, Qty: ${requestedQuantity}`);

        // 🔥 АВТОМАТИЧЕСКОЕ FIFO СПИСАНИЕ ПАРТИЙ
        const batchAllocations = await tx.$queryRaw`
          SELECT 
            pb.id as batch_id,
            pb.batch_number,
            pb.supplier_id,
            pb.unit_cost,
            pb.current_quantity,
            LEAST(${requestedQuantity}, pb.current_quantity) as allocated_quantity
          FROM product_batches pb
          WHERE pb.company_id = ${companyId}
            AND pb.product_id = ${parseInt(item.product_id)}
            AND pb.warehouse_id = ${warehouse_id}
            AND pb.current_quantity > 0
            AND pb.status = 'ACTIVE'
          ORDER BY pb.purchase_date ASC, pb.id ASC
        `;

        let remainingQuantity = requestedQuantity;
        let weightedAverageCost = 0;
        let totalAllocatedValue = 0;

        // Списываем товар с партий по FIFO
        for (const allocation of batchAllocations) {
          if (remainingQuantity <= 0) break;

          const allocatedQty = Math.min(remainingQuantity, parseFloat(allocation.current_quantity));
          const allocationValue = allocatedQty * parseFloat(allocation.unit_cost);
          
          // Обновляем остаток в партии
          await tx.product_batches.update({
            where: { id: allocation.batch_id },
            data: {
              current_quantity: parseFloat(allocation.current_quantity) - allocatedQty,
              updated_at: new Date(),
              status: (parseFloat(allocation.current_quantity) - allocatedQty) === 0 ? 'SOLD_OUT' : 'ACTIVE'
            }
          });

          // Записываем движение партии
          await tx.batch_movements.create({
            data: {
              company_id: companyId,
              batch_id: allocation.batch_id,
              product_id: parseInt(item.product_id),
              warehouse_id: warehouse_id,
              sale_id: newSale.id,
              movement_type: 'OUT',
              quantity: -allocatedQty, // Отрицательное значение = расход
              unit_cost: parseFloat(allocation.unit_cost),
              description: `Sale ${document_number} - FIFO allocation`,
              reference_document: document_number,
              movement_date: new Date(document_date),
              created_by: userId
            }
          });

          totalAllocatedValue += allocationValue;
          remainingQuantity -= allocatedQty;

          logger.info(`📦 FIFO: Allocated ${allocatedQty} from batch ${allocation.batch_number} at cost €${allocation.unit_cost}`);
        }

        // Проверяем что весь товар размещён
        if (remainingQuantity > 0) {
          throw new Error(`Insufficient stock: Product ${item.product_id}, requested ${requestedQuantity}, available ${requestedQuantity - remainingQuantity}`);
        }

        // Средневзвешенная себестоимость
        weightedAverageCost = totalAllocatedValue / requestedQuantity;

        // Расчёты по позиции продажи
        const lineSubtotal = requestedQuantity * salePrice;
        const lineDiscount = parseFloat(item.total_discount || 0);
        const lineAfterDiscount = lineSubtotal - lineDiscount;
        const lineVat = lineAfterDiscount * (parseFloat(item.vat_rate || 0) / 100);
        const lineTotal = lineAfterDiscount + lineVat;

        // Создаём позицию продажи
        await tx.sale_items.create({
          data: {
            sale_id: newSale.id,
            product_id: parseInt(item.product_id),
            line_number: index + 1,
            quantity: requestedQuantity,
            unit_price_base: salePrice,
            discount_percent: parseFloat(item.discount_percent || 0),
            total_discount: lineDiscount,
            vat_rate: parseFloat(item.vat_rate || 0),
            vat_amount: lineVat,
            line_total: lineTotal,
            description: item.description || null,
            // ДОБАВЛЯЕМ ИНФОРМАЦИЮ О СЕБЕСТОИМОСТИ
            cost_price: weightedAverageCost, // Средневзвешенная себестоимость
            margin_amount: lineTotal - (requestedQuantity * weightedAverageCost) // Маржа
          }
        });

        totalSubtotal += lineSubtotal;
        totalVatAmount += lineVat;
        totalDiscountAmount += lineDiscount;

        // Обновляем общий остаток товара
        await tx.products.update({
          where: { id: parseInt(item.product_id) },
          data: {
            current_stock: {
              decrement: requestedQuantity
            },
            updated_at: new Date()
          }
        });

        logger.info(`✅ Sale item processed: Qty ${requestedQuantity}, Cost €${weightedAverageCost.toFixed(2)}, Price €${salePrice}`);
      }

      // 3. Обновляем итоги продажи
      const totalAmount = totalSubtotal - totalDiscountAmount + totalVatAmount;
      
      await tx.sales.update({
        where: { id: newSale.id },
        data: {
          subtotal: totalSubtotal,
          vat_amount: totalVatAmount,
          discount_amount: totalDiscountAmount,
          total_amount: totalAmount
        }
      });

      return newSale;
    });

    logger.info(`🎉 Sale created successfully with batch tracking: ${sale.id}`);

    res.status(201).json({
      success: true,
      sale,
      message: 'Sale created successfully with batch tracking',
      inventory_info: {
        items_processed: items.length,
        warehouse_id: warehouse_id,
        fifo_applied: true
      }
    });

  } catch (error) {
    logger.error('Error creating sale with batch tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error creating sale'
    });
  }
};

// ✏️ PUT /api/company/sales/:id - Обновить продажу
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const userId = req.user.id;
    const updateData = req.body;

    logger.info(`✏️ Updating sale ${id} for company: ${companyId}`);

    // Проверяем существование продажи
    const existingSale = await prisma.sales.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    // Подготовка данных для обновления
    const {
      items,
      ...saleFields
    } = updateData;

    // Обновляем продажу
    const updatedSale = await prisma.$transaction(async (tx) => {
      // Обновляем основные поля продажи
      const sale = await tx.sales.update({
        where: { id: parseInt(id) },
        data: {
          ...saleFields,
          updated_by: userId,
          updated_at: new Date()
        }
      });

      // Если есть items, обновляем их
      if (items && Array.isArray(items)) {
        // Удаляем старые items
        await tx.sale_items.deleteMany({
          where: { sale_id: parseInt(id) }
        });

        // Создаём новые items
        if (items.length > 0) {
          let subtotal = 0;
          let vat_amount = 0;
          let discount_amount = 0;

          const processedItems = items.map((item, index) => {
            const lineSubtotal = parseFloat(item.quantity) * parseFloat(item.unit_price_base);
            const lineDiscount = parseFloat(item.total_discount || 0);
            const lineAfterDiscount = lineSubtotal - lineDiscount;
            const vatAmount = lineAfterDiscount * (parseFloat(item.vat_rate || 0) / 100);
            const lineTotal = lineAfterDiscount + vatAmount;
            
            subtotal += lineSubtotal;
            vat_amount += vatAmount;
            discount_amount += lineDiscount;

            return {
              sale_id: parseInt(id),
              product_id: parseInt(item.product_id),
              line_number: index + 1,
              quantity: parseFloat(item.quantity),
              unit_price_base: parseFloat(item.unit_price_base),
              discount_percent: parseFloat(item.discount_percent || 0),
              total_discount: lineDiscount,
              vat_rate: parseFloat(item.vat_rate || 0),
              vat_amount: vatAmount,
              line_total: lineTotal,
              description: item.description || null
            };
          });

          const total_amount = subtotal - discount_amount + vat_amount;

          await tx.sale_items.createMany({
            data: processedItems
          });

          // Обновляем итоговые суммы
          await tx.sales.update({
            where: { id: parseInt(id) },
            data: {
              subtotal,
              vat_amount,
              discount_amount,
              total_amount
            }
          });
        }
      }

      return sale;
    });

    // Получаем обновлённую продажу
    const sale = await prisma.sales.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        warehouse: true,
        sales_manager: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json({
      success: true,
      sale,
      message: 'Sale updated successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error updating sale:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating sale'
    });
  }
};

// 🗑️ DELETE /api/company/sales/:id - Удалить продажу
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`🗑️ Deleting sale ${id} for company: ${companyId}`);

    // Проверяем существование продажи
    const existingSale = await prisma.sales.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingSale) {
      return res.status(404).json({
        success: false,
        error: 'Sale not found'
      });
    }

    // Удаляем продажу (items удалятся автоматически по CASCADE)
    await prisma.sales.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Sale deleted successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error deleting sale:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting sale'
    });
  }
};

module.exports = {
  getSalesStats,
  getAllSales,
  getSaleById,
  createSale,
  getAvailableBatches,
  createSaleWithBatchTracking,
  updateSale,
  deleteSale
};