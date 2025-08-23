// b/src/controllers/company/warehouseController.js
const { prisma } = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// 📊 GET /api/company/warehouses/stats - Статистика складов
const getWarehouseStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    logger.info(`📊 Fetching warehouse stats for company: ${companyId}`);

    // Параллельные запросы для статистики
    const [
      totalWarehouses,
      activeWarehouses,
      totalProducts,
      lowStockItems
    ] = await Promise.all([
      // Общее количество складов
      prisma.warehouses.count({
        where: { company_id: companyId }
      }),
      
      // Активные склады
      prisma.warehouses.count({
        where: { 
          company_id: companyId,
          status: 'ACTIVE'
        }
      }),
      
      // Общее количество товаров на складах
      prisma.products.count({
        where: { 
          company_id: companyId,
          is_active: true
        }
      }),
      
      // Товары с низкими остатками
      prisma.products.count({
        where: { 
          company_id: companyId,
          current_stock: {
            lte: prisma.products.fields.min_stock
          }
        }
      })
    ]);

    const stats = {
      total_warehouses: totalWarehouses,
      active_warehouses: activeWarehouses,
      total_products: totalProducts,
      low_stock_items: lowStockItems,
      warehouse_utilization: activeWarehouses > 0 ? (activeWarehouses / totalWarehouses * 100) : 0
    };

    res.json({
      success: true,
      stats,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching warehouse stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching warehouse stats'
    });
  }
};

// 📋 GET /api/company/warehouses - Получить все склады
const getAllWarehouses = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    logger.info(`📋 Fetching warehouses for company: ${companyId}`);

    // Построение условий фильтрации
    const whereConditions = {
      company_id: companyId
    };

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) whereConditions.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [warehouses, totalCount] = await Promise.all([
      prisma.warehouses.findMany({
        where: whereConditions,
        include: {
          manager: {
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
          _count: {
            select: {
              sales: true,
              purchases: true
            }
          }
        },
        orderBy: {
          [sort_by]: sort_order
        },
        skip,
        take: parseInt(limit)
      }),
      prisma.warehouses.count({ where: whereConditions })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      warehouses,
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
    logger.error('Error fetching warehouses:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching warehouses'
    });
  }
};

// 📄 GET /api/company/warehouses/:id - Получить склад по ID
const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`📄 Fetching warehouse ${id} for company: ${companyId}`);

    const warehouse = await prisma.warehouses.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      },
      include: {
        manager: {
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
        sales: {
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            document_number: true,
            total_amount: true,
            created_at: true
          }
        },
        purchases: {
          take: 5,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            document_number: true,
            total_amount: true,
            created_at: true
          }
        }
      }
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        error: 'Warehouse not found'
      });
    }

    res.json({
      success: true,
      warehouse,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching warehouse:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching warehouse'
    });
  }
};

// ➕ POST /api/company/warehouses - Создать новый склад
const createWarehouse = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    const {
      name,
      code,
      description,
      address,
      manager_id,
      status = 'ACTIVE',
      is_main = false
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`➕ Creating warehouse for company: ${companyId}`);

    // Валидация обязательных полей
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Warehouse name is required'
      });
    }

    // Проверяем уникальность кода в рамках компании (если указан)
    if (code) {
      const existingWarehouse = await prisma.warehouses.findFirst({
        where: {
          company_id: companyId,
          code
        }
      });

      if (existingWarehouse) {
        return res.status(400).json({
          success: false,
          error: 'Warehouse with this code already exists'
        });
      }
    }

    // Если это главный склад, убираем флаг с других
    if (is_main) {
      await prisma.warehouses.updateMany({
        where: {
          company_id: companyId,
          is_main: true
        },
        data: {
          is_main: false
        }
      });
    }

    // Создание склада
    const warehouse = await prisma.warehouses.create({
      data: {
        company_id: companyId,
        name: name.trim(),
        code: code?.trim().toUpperCase() || null,
        description: description?.trim() || null,
        address: address?.trim() || null,
        manager_id: manager_id ? parseInt(manager_id) : null,
        status,
        is_main,
        created_by: userId
      },
      include: {
        manager: {
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
        }
      }
    });

    logger.info(`✅ Warehouse created: ${warehouse.id}`);

    res.status(201).json({
      success: true,
      warehouse,
      message: 'Warehouse created successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error creating warehouse:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating warehouse',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ✏️ PUT /api/company/warehouses/:id - Обновить склад
const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    const updateData = req.body;

    logger.info(`✏️ Updating warehouse ${id} for company: ${companyId}`);

    // Проверяем существование склада
    const existingWarehouse = await prisma.warehouses.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingWarehouse) {
      return res.status(404).json({
        success: false,
        error: 'Warehouse not found'
      });
    }

    // Если делаем главным складом, убираем флаг с других
    if (updateData.is_main && !existingWarehouse.is_main) {
      await prisma.warehouses.updateMany({
        where: {
          company_id: companyId,
          is_main: true
        },
        data: {
          is_main: false
        }
      });
    }

    // Обновляем склад
    const warehouse = await prisma.warehouses.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      },
      include: {
        manager: {
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
        }
      }
    });

    res.json({
      success: true,
      warehouse,
      message: 'Warehouse updated successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error updating warehouse:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating warehouse'
    });
  }
};

// 🗑️ DELETE /api/company/warehouses/:id - Удалить склад
const deleteWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;

    logger.info(`🗑️ Deleting warehouse ${id} for company: ${companyId}`);

    // Проверяем существование склада
    const existingWarehouse = await prisma.warehouses.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!existingWarehouse) {
      return res.status(404).json({
        success: false,
        error: 'Warehouse not found'
      });
    }

    // Проверяем есть ли связанные документы
    const [salesCount, purchasesCount] = await Promise.all([
      prisma.sales.count({
        where: { warehouse_id: parseInt(id) }
      }),
      prisma.purchases.count({
        where: { warehouse_id: parseInt(id) }
      })
    ]);

    if (salesCount > 0 || purchasesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete warehouse. It has ${salesCount} sales and ${purchasesCount} purchases linked to it.`
      });
    }

    // Удаляем склад
    await prisma.warehouses.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Warehouse deleted successfully',
      companyId
    });
  } catch (error) {
    logger.error('Error deleting warehouse:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting warehouse'
    });
  }
};

// 📦 GET /api/company/warehouse/:id/inventory - Остатки товаров на складе
const getWarehouseInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext?.companyId;
    const { search = '', low_stock_only = false, page = 1, limit = 100 } = req.query;

    logger.info(`📦 Fetching inventory for warehouse ${id}, company: ${companyId}`);

    // Проверяем что склад принадлежит компании
    const warehouse = await prisma.warehouses.findFirst({
      where: { id: parseInt(id), company_id: companyId }
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        error: 'Warehouse not found'
      });
    }

    // Получаем все товары с остатками
    const whereConditions = {
      company_id: companyId,
      is_active: true
    };

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.products.findMany({
      where: whereConditions,
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        current_stock: true,
        min_stock: true,
        price: true,
        cost_price: true,
        currency: true,
        category: true,
        updated_at: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Обогащаем данные вычисляемыми полями
    let enrichedProducts = products.map(product => {
      const currentStock = parseFloat(product.current_stock || 0);
      const minStock = parseFloat(product.min_stock || 0);
      const price = parseFloat(product.cost_price || product.price || 0);
      
      let stockStatus = 'OK';
      let stockStatusIcon = '✅';
      let stockStatusText = 'В наличии';
      
      if (currentStock <= 0) {
        stockStatus = 'OUT';
        stockStatusIcon = '🚨';
        stockStatusText = 'Нет в наличии';
      } else if (currentStock <= minStock) {
        stockStatus = 'LOW';
        stockStatusIcon = '⚠️';
        stockStatusText = 'Низкий остаток';
      }
      
      return {
        ...product,
        current_stock: currentStock,
        min_stock: minStock,
        stock_status: stockStatus,
        stock_status_icon: stockStatusIcon,
        stock_status_text: stockStatusText,
        stock_value: currentStock * price
      };
    });

    // Фильтр низких остатков
    if (low_stock_only === 'true') {
      enrichedProducts = enrichedProducts.filter(p => p.stock_status === 'LOW' || p.stock_status === 'OUT');
    }

    const totalValue = enrichedProducts.reduce((sum, product) => sum + product.stock_value, 0);
    const lowStockCount = enrichedProducts.filter(p => p.stock_status === 'LOW' || p.stock_status === 'OUT').length;
    const outOfStockCount = enrichedProducts.filter(p => p.stock_status === 'OUT').length;

    res.json({
      success: true,
      warehouse: {
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address
      },
      products: enrichedProducts,
      summary: {
        total_products: enrichedProducts.length,
        total_value: totalValue,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        currency: 'EUR'
      },
      companyId
    });
  } catch (error) {
    logger.error('Error fetching warehouse inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching warehouse inventory'
    });
  }
};

// 📊 GET /api/company/warehouse/products/stocks - Остатки всех товаров
const getAllProductStocks = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const { search = '', low_stock_only = false } = req.query;

    const whereConditions = {
      company_id: companyId,
      is_active: true
    };

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.products.findMany({
      where: whereConditions,
      select: {
        id: true,
        code: true,
        name: true,
        unit: true,
        current_stock: true,
        min_stock: true,
        price: true,
        cost_price: true
      }
    });

    let enrichedProducts = products.map(product => {
      const currentStock = parseFloat(product.current_stock || 0);
      const minStock = parseFloat(product.min_stock || 0);
      
      let stockStatus = 'OK';
      if (currentStock <= 0) stockStatus = 'OUT';
      else if (currentStock <= minStock) stockStatus = 'LOW';
      
      return {
        ...product,
        current_stock: currentStock,
        min_stock: minStock,
        stock_status: stockStatus
      };
    });

    if (low_stock_only === 'true') {
      enrichedProducts = enrichedProducts.filter(p => p.stock_status === 'LOW' || p.stock_status === 'OUT');
    }

    res.json({
      success: true,
      products: enrichedProducts,
      companyId
    });
  } catch (error) {
    logger.error('Error fetching product stocks:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching product stocks'
    });
  }
};


module.exports = {
  getWarehouseStats,
  getAllWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseInventory,
  getAllProductStocks
};