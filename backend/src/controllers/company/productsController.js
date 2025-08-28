// =====================================================
// 🔧 ПОЛНЫЙ PRODUCTS CONTROLLER - ВСЕ CRUD ОПЕРАЦИИ
// Файл: b/src/controllers/company/productsController.js
// =====================================================

const prismaManager = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// 📋 GET /api/company/products - Получить все товары
const getAllProducts = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`🔍 Fetching products for company: ${companyId}`);

    const products = await req.prisma.products.findMany({
      where: {
        company_id: parseInt(companyId)
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
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

    logger.info(`✅ Found ${products.length} products for company ${companyId}`);

    res.json({
      success: true,
      products,
      count: products.length,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// 📄 GET /api/company/products/:id - Получить товар по ID
const getProductById = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const productId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({ error: 'Company ID required' });
    }

    const product = await req.prisma.products.findFirst({
      where: {
        id: productId,
        company_id: parseInt(companyId)
      },
      include: {
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

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      product,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching product',
      details: error.message
    });
  }
};

// ➕ POST /api/company/products - Создать новый товар
const createProduct = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const userId = req.user.id;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`➕ Creating product for company: ${companyId}`, req.body);

    const {
      name,
      code,
      description,
      unit,
      price,
      cost_price,
      currency,
      vat_rate,
      category,
      subcategory,
      min_stock,
      current_stock,
      is_service,
      batch_tracking
    } = req.body;

    // Проверка на дублирование кода товара
    if (code) {
      const existingProduct = await req.prisma.products.findFirst({
        where: {
          company_id: parseInt(companyId),
          code: code
        }
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          error: 'Product code already exists',
          message: 'Товар с таким кодом уже существует'
        });
      }
    }

    // Создание товара
    const product = await req.prisma.products.create({
      data: {
        company_id: parseInt(companyId),
        name: name,
        code: code || `AUTO-${Date.now()}`,
        description: description || '',
        unit: unit || 't',
        price: parseFloat(price) || 0,
        cost_price: parseFloat(cost_price) || 0,
        currency: currency || 'EUR',
        vat_rate: parseFloat(vat_rate) || 23,
        category: category || 'Нефтепродукты',
        subcategory: subcategory || '',
        min_stock: parseFloat(min_stock) || 0,
        current_stock: parseFloat(current_stock) || 0,
        is_active: true,
        is_service: Boolean(is_service),
        is_template: false,
        batch_tracking: Boolean(batch_tracking),
        created_by: userId
      },
      include: {
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

    logger.info(`✅ Product created successfully: ${product.name} (ID: ${product.id})`);

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully',
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error creating product:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate product code',
        message: 'Товар с таким кодом уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// ✏️ PUT /api/company/products/:id - Обновить товар
const updateProduct = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const productId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`✏️ Updating product ${productId} for company: ${companyId}`);

    // Проверяем существование товара
    const existingProduct = await req.prisma.products.findFirst({
      where: {
        id: productId,
        company_id: parseInt(companyId)
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const {
      name,
      code,
      description,
      unit,
      price,
      cost_price,
      currency,
      vat_rate,
      category,
      subcategory,
      min_stock,
      current_stock,
      is_service,
      is_active,
      batch_tracking
    } = req.body;

    // Проверка на дублирование кода (если код изменился)
    if (code && code !== existingProduct.code) {
      const duplicateProduct = await req.prisma.products.findFirst({
        where: {
          company_id: parseInt(companyId),
          code: code,
          NOT: {
            id: productId
          }
        }
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          error: 'Product code already exists',
          message: 'Товар с таким кодом уже существует'
        });
      }
    }

    // Обновляем товар
    const updatedProduct = await req.prisma.products.update({
      where: {
        id: productId
      },
      data: {
        name: name || existingProduct.name,
        code: code || existingProduct.code,
        description: description !== undefined ? description : existingProduct.description,
        unit: unit || existingProduct.unit,
        price: price !== undefined ? parseFloat(price) : existingProduct.price,
        cost_price: cost_price !== undefined ? parseFloat(cost_price) : existingProduct.cost_price,
        currency: currency || existingProduct.currency,
        vat_rate: vat_rate !== undefined ? parseFloat(vat_rate) : existingProduct.vat_rate,
        category: category !== undefined ? category : existingProduct.category,
        subcategory: subcategory !== undefined ? subcategory : existingProduct.subcategory,
        min_stock: min_stock !== undefined ? parseFloat(min_stock) : existingProduct.min_stock,
        current_stock: current_stock !== undefined ? parseFloat(current_stock) : existingProduct.current_stock,
        is_service: is_service !== undefined ? Boolean(is_service) : existingProduct.is_service,
        is_active: is_active !== undefined ? Boolean(is_active) : existingProduct.is_active,
        batch_tracking: batch_tracking !== undefined ? Boolean(batch_tracking) : existingProduct.batch_tracking,
        updated_at: new Date()
      },
      include: {
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

    logger.info(`✅ Product updated successfully: ${updatedProduct.name} (ID: ${updatedProduct.id})`);

    res.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully',
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error updating product:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate product code',
        message: 'Товар с таким кодом уже существует'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// 🗑️ DELETE /api/company/products/:id - Удалить товар
const deleteProduct = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const productId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`🗑️ Deleting product ${productId} for company: ${companyId}`);

    // Проверяем существование товара
    const existingProduct = await req.prisma.products.findFirst({
      where: {
        id: productId,
        company_id: parseInt(companyId)
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Проверяем, не используется ли товар в документах
    const purchaseItems = await req.prisma.purchase_items.findFirst({
      where: {
        product_id: productId
      }
    });

    const saleItems = await req.prisma.sale_items.findFirst({
      where: {
        product_id: productId
      }
    });

    if (purchaseItems || saleItems) {
      // Если товар используется, то мягкое удаление (деактивация)
      const deactivatedProduct = await req.prisma.products.update({
        where: {
          id: productId
        },
        data: {
          is_active: false,
          updated_at: new Date()
        }
      });

      logger.info(`⚠️ Product deactivated (soft delete): ${existingProduct.name}`);

      return res.json({
        success: true,
        message: 'Product deactivated (used in documents)',
        product: deactivatedProduct,
        companyId: parseInt(companyId),
        action: 'deactivated'
      });
    }

    // Жёсткое удаление, если товар нигде не используется
    await req.prisma.products.delete({
      where: {
        id: productId
      }
    });

    logger.info(`🗑️ Product permanently deleted: ${existingProduct.name} (ID: ${productId})`);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      companyId: parseInt(companyId),
      action: 'deleted'
    });

  } catch (error) {
    logger.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// 📊 GET /api/company/products/stats - Статистика товаров
const getProductsStats = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`📊 Fetching products stats for company: ${companyId}`);

    // Простая статистика без сложных Prisma queries
    const products = await req.prisma.products.findMany({
      where: {
        company_id: parseInt(companyId)
      },
      select: {
        id: true,
        name: true,
        price: true,
        cost_price: true,
        current_stock: true,
        min_stock: true,
        is_active: true,
        is_service: true,
        category: true
      }
    });

    // Подсчет статистики
    const stats = products.reduce((acc, product) => {
      acc.total++;
      
      if (product.is_active) {
        acc.active++;
      } else {
        acc.inactive++;
      }
      
      if (product.is_service) {
        acc.services++;
      } else {
        acc.goods++;
      }
      
      if (product.current_stock <= product.min_stock) {
        acc.lowStock++;
      }
      
      acc.totalValue += (parseFloat(product.current_stock || 0) * parseFloat(product.price || 0));
      
      return acc;
    }, {
      total: 0,
      active: 0,
      inactive: 0,
      services: 0,
      goods: 0,
      lowStock: 0,
      totalValue: 0
    });

    // Группировка по категориям
    const categoriesStats = {};
    products.forEach(product => {
      const category = product.category || 'Без категории';
      if (!categoriesStats[category]) {
        categoriesStats[category] = 0;
      }
      categoriesStats[category]++;
    });

    logger.info(`✅ Products stats calculated for company ${companyId}`);

    res.json({
      success: true,
      stats: {
        overview: stats,
        categories: categoriesStats,
        companyId: parseInt(companyId),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('❌ Error fetching products stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

// 📋 Копирование товара (для "Воздушной бухгалтерии")
const copyProduct = async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    const productId = parseInt(req.params.id);
    const userId = req.user.id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company ID required'
      });
    }

    logger.info(`🔄 Copying product ${productId} for company: ${companyId}`);

    // Находим оригинальный товар
    const originalProduct = await req.prisma.products.findFirst({
      where: {
        id: productId,
        company_id: parseInt(companyId)
      }
    });

    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Создаем копию
    const copiedProduct = await req.prisma.products.create({
      data: {
        company_id: parseInt(companyId),
        name: `${originalProduct.name} (Копия)`,
        code: `${originalProduct.code}-COPY-${Date.now()}`,
        description: originalProduct.description,
        unit: originalProduct.unit,
        price: originalProduct.price,
        cost_price: originalProduct.cost_price,
        currency: originalProduct.currency,
        vat_rate: originalProduct.vat_rate,
        category: originalProduct.category,
        subcategory: originalProduct.subcategory,
        min_stock: originalProduct.min_stock,
        current_stock: 0, // Обнуляем остатки в копии
        is_active: true,
        is_service: originalProduct.is_service,
        is_template: false,
        batch_tracking: originalProduct.batch_tracking,
        created_by: userId
      },
      include: {
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

    logger.info(`✅ Product copied successfully: ${copiedProduct.name} (ID: ${copiedProduct.id})`);

    res.json({
      success: true,
      product: copiedProduct,
      message: '⚡ Товар скопирован за 10 секунд!',
      companyId: parseInt(companyId),
      timeSaved: '5 минут',
      originalId: productId
    });

  } catch (error) {
    logger.error('❌ Error copying product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsStats,
  copyProduct
};