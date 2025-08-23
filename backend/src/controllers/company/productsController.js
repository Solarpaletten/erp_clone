// b/src/controllers/company/productsController.js - ИСПРАВЛЕНО ПОД РЕАЛЬНУЮ СХЕМУ
const { logger } = require('../../config/logger');

// 📋 GET /api/company/products - Получить все товары компании
const getAllProducts = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required',
        hint: 'Add X-Company-Id header'
      });
    }
    
    logger.info(`🔍 Fetching products for company: ${companyId}`);
    
    const products = await req.prisma.products.findMany({
      where: {
        company_id: parseInt(companyId)
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    logger.info(`📋 Found ${products.length} products for company ${companyId}`);
    
    res.json({
      success: true,
      products: products,
      pagination: {
        page: 1,
        limit: 50, 
        total: products.length,
        pages: Math.ceil(products.length / 50)
      },
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching products',
      details: error.message
    });
  }
};

// ➕ POST /api/company/products - Создать новый товар
const createProduct = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    const {
      name,
      code,
      description,
      unit,              // ← ПРАВИЛЬНОЕ ПОЛЕ
      price,             // ← ПРАВИЛЬНОЕ ПОЛЕ (не sale_price)
      cost_price,
      vat_rate,
      category,
      subcategory,
      min_stock,         // ← ПРАВИЛЬНОЕ ПОЛЕ (не min_stock_level)
      current_stock,     // ← ПРАВИЛЬНОЕ ПОЛЕ (не stock_quantity)
      is_service,
      currency = 'EUR'
    } = req.body;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    // Валидация обязательных полей согласно схеме
    if (!name || !code || !unit || !price) {
      return res.status(400).json({
        success: false,
        error: 'Name, code, unit and price are required'
      });
    }

    logger.info(`➕ Creating product: ${name} for company: ${companyId}`);

    // Создаем товар с правильными полями
    const product = await req.prisma.products.create({
      data: {
        company_id: parseInt(companyId),
        created_by: parseInt(userId),        // ← ПРАВИЛЬНОЕ ПОЛЕ (не user_id)
        
        // Основные поля
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || null,
        
        // Единица измерения и цены
        unit: unit || 'pcs',
        price: parseFloat(price),            // ← ОБЯЗАТЕЛЬНОЕ
        cost_price: cost_price ? parseFloat(cost_price) : null,
        currency: currency || 'EUR',
        vat_rate: vat_rate ? parseFloat(vat_rate) : null,
        
        // Категории
        category: category?.trim() || null,
        subcategory: subcategory?.trim() || null,
        
        // Остатки
        min_stock: min_stock ? parseFloat(min_stock) : null,
        current_stock: current_stock ? parseFloat(current_stock) : null,
        
        // Флаги
        is_active: true,
        is_service: Boolean(is_service) || false
      }
    });

    logger.info(`✅ Product created: ${product.name} (ID: ${product.id})`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: product,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating product',
      details: error.message
    });
  }
};

// 📊 GET /api/company/products/stats - Статистика товаров
const getProductsStats = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;

    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    logger.info(`📊 Fetching products stats for company: ${companyId}`);

    // Простая статистика без сложных Prisma queries
    const products = await req.prisma.products.findMany({
      where: { company_id: parseInt(companyId) }
    });

    const stats = {
      total: products.length,
      active: products.filter(p => p.is_active).length,
      inactive: products.filter(p => !p.is_active).length,
      services: products.filter(p => p.is_service).length,
      goods: products.filter(p => !p.is_service).length,
      lowStock: products.filter(p => {
        const stock = parseFloat(p.current_stock || 0);
        const minStock = parseFloat(p.min_stock || 0);
        return stock <= minStock && minStock > 0;
      }).length,
      totalStockQuantity: products.reduce((sum, p) => sum + parseFloat(p.current_stock || 0), 0),
      totalValue: products.reduce((sum, p) => sum + (parseFloat(p.current_stock || 0) * parseFloat(p.price || 0)), 0),
      categories: [...new Set(products.map(p => p.category).filter(Boolean))].map(cat => ({
        name: cat,
        count: products.filter(p => p.category === cat).length
      }))
    };

    logger.info(`✅ Products stats calculated for company ${companyId}`);

    res.json({
      success: true,
      stats,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('❌ Error fetching products stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching products statistics',
      details: error.message
    });
  }
};

// 📄 GET /api/company/products/:id - Получить товар по ID
const getProductById = async (req, res) => {
  try {
    const companyId = req.companyContext?.companyId;
    const productId = parseInt(req.params.id);

    if (!companyId) {
      return res.status(400).json({ error: 'Company context required' });
    }

    const product = await req.prisma.products.findFirst({
      where: {
        id: productId,
        company_id: parseInt(companyId)
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

// ✏️ PUT /api/company/products/:id - Обновить товар
const updateProduct = async (req, res) => {
  res.json({
    success: false,
    error: 'Update not implemented yet'
  });
};

// 🗑️ DELETE /api/company/products/:id - Удалить товар
const deleteProduct = async (req, res) => {
  res.json({
    success: false,
    error: 'Delete not implemented yet'
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsStats
};