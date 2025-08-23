// b/src/controllers/company/inventoryController.js
const { prisma } = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// 📊 GET /api/company/inventory/stats - Статистика инвентаризаций
const getInventoryStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    logger.info(`📊 Fetching inventory stats for company: ${companyId}`);

    // Статистика инвентаризаций (не товаров!)
    const [
      totalInventories,
      statusCounts,
      recentInventories
    ] = await Promise.all([
      // Общее количество инвентаризаций
      prisma.inventories.count({
        where: { company_id: companyId }
      }),
      
      // По статусам
      prisma.inventories.groupBy({
        by: ['status'],
        where: { company_id: companyId },
        _count: { id: true }
      }),
      
      // Последние инвентаризации
      prisma.inventories.count({
        where: {
          company_id: companyId,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // последние 30 дней
          }
        }
      })
    ]);

    const stats = {
      total_inventories: totalInventories,
      pending: statusCounts.find(s => s.status === 'PENDING')?._count?.id || 0,
      in_progress: statusCounts.find(s => s.status === 'IN_PROGRESS')?._count?.id || 0,
      completed: statusCounts.find(s => s.status === 'COMPLETED')?._count?.id || 0,
      cancelled: statusCounts.find(s => s.status === 'CANCELLED')?._count?.id || 0,
      recent_inventories: recentInventories
    };

    res.json({
      success: true,
      stats,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching inventory stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching inventory stats'
    });
  }
};

// 📋 GET /api/company/inventory - Список инвентаризаций
const getAllInventories = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const { 
      page = 1, 
      limit = 10, 
      status,
      warehouse_id,
      date_from,
      date_to
    } = req.query;

    logger.info(`📋 Fetching inventories for company: ${companyId}`);

    const whereClause = {
      company_id: companyId,
      ...(status && { status }),
      ...(warehouse_id && { warehouse_id: parseInt(warehouse_id) }),
      ...(date_from && date_to && {
        inventory_date: {
          gte: new Date(date_from),
          lte: new Date(date_to)
        }
      })
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [inventories, totalCount] = await Promise.all([
      prisma.inventories.findMany({
        where: whereClause,
        include: {
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          creator: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.inventories.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      inventories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1
      },
      companyId
    });
  } catch (error) {
    logger.error('Error fetching inventories:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching inventories'
    });
  }
};

// 📄 GET /api/company/inventory/:id - Инвентаризация по ID
const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    const inventory = await prisma.inventories.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      },
      include: {
        warehouse: true,
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
          }
        }
      }
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        error: 'Inventory not found'
      });
    }

    res.json({
      success: true,
      inventory,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching inventory'
    });
  }
};

// ➕ POST /api/company/inventory - Создать инвентаризацию
const createInventory = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    const {
      document_number,
      inventory_date,
      warehouse_id,
      description,
      items = []
    } = req.body;

    logger.info(`➕ Creating inventory for company: ${companyId}`);

    const inventory = await prisma.inventories.create({
      data: {
        company_id: companyId,
        document_number,
        inventory_date: new Date(inventory_date),
        warehouse_id: parseInt(warehouse_id),
        description,
        status: 'PENDING',
        created_by: userId
      }
    });

    res.status(201).json({
      success: true,
      inventory,
      message: 'Inventory created successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error creating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating inventory'
    });
  }
};

// ✏️ PUT /api/company/inventory/:id - Обновить инвентаризацию
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id;
    const updateData = req.body;

    const inventory = await prisma.inventories.update({
      where: { 
        id: parseInt(id),
        company_id: companyId 
      },
      data: {
        ...updateData,
        updated_by: userId,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      inventory,
      message: 'Inventory updated successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating inventory'
    });
  }
};

// 🗑️ DELETE /api/company/inventory/:id - Удалить инвентаризацию
const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    await prisma.inventories.delete({
      where: { 
        id: parseInt(id),
        company_id: companyId 
      }
    });

    res.json({
      success: true,
      message: 'Inventory deleted successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error deleting inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting inventory'
    });
  }
};

// 📊 POST /api/company/inventory/:id/process - Провести инвентаризацию
const processInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const { items } = req.body; // фактические остатки

    // Обновляем остатки товаров на основе инвентаризации
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.products.update({
          where: { id: item.product_id },
          data: { current_stock: item.actual_quantity }
        });
      }

      await tx.inventories.update({
        where: { id: parseInt(id) },
        data: { status: 'COMPLETED' }
      });
    });

    res.json({
      success: true,
      message: 'Inventory processed successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error processing inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing inventory'
    });
  }
};

module.exports = {
  getInventoryStats,
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  processInventory
};