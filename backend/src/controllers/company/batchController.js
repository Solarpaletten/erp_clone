// 🎯 API CONTROLLERS ДЛЯ ПАРТИЙНОЙ СИСТЕМЫ
// b/src/controllers/batchController.js

const { PrismaClient } = require('@prisma/client');
const logger = require('../../config/logger'); 

const prisma = new PrismaClient();

// ===============================================
// 📦 ПОЛУЧИТЬ ПАРТИИ ТОВАРА НА СКЛАДЕ
// ===============================================

const getBatchesByProduct = async (req, res) => {
  try {
    const { productId, warehouseId } = req.params;
    const companyId = req.user.current_company_id;

    const batches = await prisma.product_batches.findMany({
      where: {
        company_id: companyId,
        product_id: parseInt(productId),
        warehouse_id: parseInt(warehouseId),
        status: 'ACTIVE',
        current_quantity: { gt: 0 }
      },
      include: {
        supplier: {
          select: { name: true, code: true }
        },
        product: {
          select: { name: true, code: true, unit: true }
        }
      },
      orderBy: {
        purchase_date: 'asc' // FIFO - старые первыми
      }
    });

    logger.info(`Found ${batches.length} active batches for product ${productId}`);
    
    res.json({
      success: true,
      data: batches,
      message: `Found ${batches.length} active batches`
    });

  } catch (error) {
    logger.error('Error getting batches by product:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения партий товара'
    });
  }
};

// ===============================================
// 🎯 FIFO АЛГОРИТМ - АВТОМАТИЧЕСКОЕ РАСПРЕДЕЛЕНИЕ
// ===============================================

const allocateBatchesForSale = async (req, res) => {
  try {
    const { productId, warehouseId, quantity } = req.body;
    const companyId = req.user.current_company_id;

    // Получаем доступные партии с FIFO сортировкой
    const availableBatches = await prisma.product_batches.findMany({
      where: {
        company_id: companyId,
        product_id: parseInt(productId),
        warehouse_id: parseInt(warehouseId),
        status: 'ACTIVE',
        current_quantity: { gt: 0 }
      },
      orderBy: {
        purchase_date: 'asc' // FIFO
      }
    });

    // FIFO алгоритм распределения
    const allocations = [];
    let remainingQuantity = parseFloat(quantity);

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const batchAvailable = parseFloat(batch.current_quantity);
      const quantityToTake = Math.min(remainingQuantity, batchAvailable);

      allocations.push({
        batch_id: batch.id,
        batch_number: batch.batch_number,
        quantity: quantityToTake,
        unit_cost: parseFloat(batch.unit_cost),
        total_cost: quantityToTake * parseFloat(batch.unit_cost),
        purchase_date: batch.purchase_date
      });

      remainingQuantity -= quantityToTake;
    }

    // Проверка достаточности товара
    if (remainingQuantity > 0) {
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Недостаёт: ${remainingQuantity}`
      });
    }

    // Рассчитываем средневзвешенную себестоимость
    const totalCost = allocations.reduce((sum, alloc) => sum + alloc.total_cost, 0);
    const averageUnitCost = totalCost / parseFloat(quantity);

    logger.info(`FIFO allocation completed for ${quantity} units`);

    res.json({
      success: true,
      data: {
        allocations,
        totalQuantity: parseFloat(quantity),
        totalCost,
        averageUnitCost,
        batchesUsed: allocations.length
      },
      message: 'FIFO распределение выполнено успешно'
    });

  } catch (error) {
    logger.error('Error in FIFO allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка FIFO распределения'
    });
  }
};

// ===============================================
// 📋 ПОЛУЧИТЬ ИСТОРИЮ ДВИЖЕНИЙ ПАРТИИ
// ===============================================

const getBatchMovements = async (req, res) => {
  try {
    const { batchId } = req.params;
    const companyId = req.user.current_company_id;

    const movements = await prisma.batch_movements.findMany({
      where: {
        company_id: companyId,
        batch_id: parseInt(batchId)
      },
      include: {
        creator: {
          select: { first_name: true, last_name: true }
        }
      },
      orderBy: {
        movement_date: 'desc'
      }
    });

    logger.info(`Found ${movements.length} movements for batch ${batchId}`);

    res.json({
      success: true,
      data: movements,
      message: `История движений партии`
    });

  } catch (error) {
    logger.error('Error getting batch movements:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения истории движений'
    });
  }
};

// ===============================================
// 📊 СОЗДАТЬ ДВИЖЕНИЕ ПАРТИИ (КОРРЕКЦИЯ)
// ===============================================

const createBatchMovement = async (req, res) => {
  try {
    const { 
      batchId, 
      movementType, 
      quantity, 
      description, 
      notes 
    } = req.body;
    const companyId = req.user.current_company_id;
    const userId = req.user.id;

    // Получаем текущую партию
    const batch = await prisma.product_batches.findFirst({
      where: {
        id: parseInt(batchId),
        company_id: companyId
      }
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Партия не найдена'
      });
    }

    // Транзакция для безопасного обновления
    const result = await prisma.$transaction(async (tx) => {
      // Создаём движение
      const movement = await tx.batch_movements.create({
        data: {
          company_id: companyId,
          batch_id: parseInt(batchId),
          movement_type: movementType,
          quantity: parseFloat(quantity),
          description,
          notes,
          movement_date: new Date(),
          created_by: userId
        }
      });

      // Обновляем остаток партии
      let newQuantity = parseFloat(batch.current_quantity);
      
      if (movementType === 'IN' || movementType === 'CORRECTION') {
        newQuantity += parseFloat(quantity);
      } else if (movementType === 'OUT') {
        newQuantity -= parseFloat(quantity);
      }

      await tx.product_batches.update({
        where: { id: parseInt(batchId) },
        data: { 
          current_quantity: newQuantity,
          status: newQuantity <= 0 ? 'SOLD_OUT' : 'ACTIVE'
        }
      });

      return { movement, newQuantity };
    });

    logger.info(`Created batch movement: ${movementType} ${quantity} for batch ${batchId}`);

    res.json({
      success: true,
      data: result.movement,
      message: 'Движение партии создано успешно'
    });

  } catch (error) {
    logger.error('Error creating batch movement:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания движения партии'
    });
  }
};

// ===============================================
// 📈 ОТЧЁТ ПО ПАРТИЯМ НА СКЛАДЕ
// ===============================================

const getWarehouseBatchesReport = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const companyId = req.user.current_company_id;

    const batches = await prisma.product_batches.findMany({
      where: {
        company_id: companyId,
        warehouse_id: parseInt(warehouseId),
        current_quantity: { gt: 0 }
      },
      include: {
        product: {
          select: { name: true, code: true, unit: true }
        },
        supplier: {
          select: { name: true, code: true }
        }
      },
      orderBy: [
        { product_id: 'asc' },
        { purchase_date: 'asc' }
      ]
    });

    // Группируем по товарам
    const groupedByProduct = batches.reduce((acc, batch) => {
      const productId = batch.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          totalQuantity: 0,
          totalValue: 0,
          batches: []
        };
      }

      acc[productId].totalQuantity += parseFloat(batch.current_quantity);
      acc[productId].totalValue += parseFloat(batch.current_quantity) * parseFloat(batch.unit_cost);
      acc[productId].batches.push(batch);

      return acc;
    }, {});

    const summary = {
      totalProducts: Object.keys(groupedByProduct).length,
      totalBatches: batches.length,
      totalValue: Object.values(groupedByProduct).reduce((sum, group) => sum + group.totalValue, 0)
    };

    logger.info(`Generated warehouse batches report for warehouse ${warehouseId}`);

    res.json({
      success: true,
      data: {
        summary,
        productGroups: groupedByProduct
      },
      message: 'Отчёт по партиям склада сформирован'
    });

  } catch (error) {
    logger.error('Error generating warehouse batches report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка формирования отчёта'
    });
  }
};

// ===============================================
// 📅 ПАРТИИ С ИСТЕКАЮЩИМ СРОКОМ
// ===============================================

// ===============================================
// 📅 ПАРТИИ С ИСТЕКАЮЩИМ СРОКОМ
// ===============================================

const getExpiringBatches = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const companyId = req.user.current_company_id;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));

    const expiringBatches = await prisma.product_batches.findMany({
      where: {
        company_id: companyId,
        status: 'ACTIVE',
        current_quantity: { gt: 0 },
        expiry_date: {
          lte: expiryDate,
          gte: new Date()
        }
      },
      include: {
        product: { select: { name: true, code: true } },
        warehouse: { select: { name: true, code: true } },
        supplier: { select: { name: true, code: true } }
      },
      orderBy: { expiry_date: 'asc' }
    });

    logger.info(`Found ${expiringBatches.length} expiring batches`);

    res.json({
      success: true,
      data: expiringBatches,
      message: `Найдено ${expiringBatches.length} партий с истекающим сроком`
    });

  } catch (error) {
    logger.error('Error getting expiring batches:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка истекающих партий'
    });
  }
};

// ===============================================
// 🏭 ПАРТИИ ОТ ПОСТАВЩИКА
// ===============================================

const getBatchesBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const companyId = req.user.current_company_id;

    const supplierBatches = await prisma.product_batches.findMany({
      where: {
        company_id: companyId,
        supplier_id: parseInt(supplierId),
        current_quantity: { gt: 0 }
      },
      include: {
        product: { select: { name: true, code: true, unit: true } },
        warehouse: { select: { name: true, code: true } }
      },
      orderBy: { purchase_date: 'desc' }
    });

    // Статистика
    const stats = {
      totalBatches: supplierBatches.length,
      totalValue: supplierBatches.reduce((sum, batch) => 
        sum + (parseFloat(batch.current_quantity) * parseFloat(batch.unit_cost)), 0
      ),
      totalQuantity: supplierBatches.reduce((sum, batch) => 
        sum + parseFloat(batch.current_quantity), 0
      )
    };

    logger.info(`Found ${supplierBatches.length} batches for supplier ${supplierId}`);

    res.json({
      success: true,
      data: {
        batches: supplierBatches,
        statistics: stats
      },
      message: `Партии от поставщика`
    });

  } catch (error) {
    logger.error('Error getting supplier batches:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения партий поставщика'
    });
  }
};

// ===============================================
// 📊 АНАЛИЗ СЕБЕСТОИМОСТИ
// ===============================================

const getCostAnalytics = async (req, res) => {
  try {
    const { productId } = req.query;
    const companyId = req.user.current_company_id;

    const whereCondition = {
      company_id: companyId,
      current_quantity: { gt: 0 }
    };

    if (productId) {
      whereCondition.product_id = parseInt(productId);
    }

    const batches = await prisma.product_batches.findMany({
      where: whereCondition,
      include: {
        product: { select: { name: true, code: true } },
        supplier: { select: { name: true, code: true } }
      },
      orderBy: { purchase_date: 'desc' }
    });

    // Анализ по товарам
    const costAnalysis = batches.reduce((acc, batch) => {
      const productId = batch.product_id;
      const unitCost = parseFloat(batch.unit_cost);

      if (!acc[productId]) {
        acc[productId] = {
          product: batch.product,
          minCost: unitCost,
          maxCost: unitCost,
          avgCost: 0,
          totalQuantity: 0,
          totalValue: 0,
          batchCount: 0,
          suppliers: new Set()
        };
      }

      const item = acc[productId];
      item.minCost = Math.min(item.minCost, unitCost);
      item.maxCost = Math.max(item.maxCost, unitCost);
      item.totalQuantity += parseFloat(batch.current_quantity);
      item.totalValue += parseFloat(batch.current_quantity) * unitCost;
      item.batchCount++;
      item.suppliers.add(batch.supplier?.name || 'Unknown');

      return acc;
    }, {});

    // Рассчитываем средние цены
    Object.keys(costAnalysis).forEach(productId => {
      const item = costAnalysis[productId];
      item.avgCost = item.totalValue / item.totalQuantity;
      item.suppliers = Array.from(item.suppliers);
      item.costVariance = ((item.maxCost - item.minCost) / item.avgCost * 100).toFixed(2);
    });

    logger.info(`Cost analysis completed for ${Object.keys(costAnalysis).length} products`);

    res.json({
      success: true,
      data: costAnalysis,
      message: 'Анализ себестоимости выполнен'
    });

  } catch (error) {
    logger.error('Error in cost analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка анализа себестоимости'
    });
  }
};

module.exports = {
  getBatchesByProduct,
  allocateBatchesForSale,
  getBatchMovements,
  createBatchMovement,
  getWarehouseBatchesReport,
  getExpiringBatches,
  getBatchesBySupplier,  
  getCostAnalytics
};