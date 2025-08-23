// b/src/controllers/company/clientsController.js
const { logger } = require('../../config/logger');

const getAllClients = async (req, res) => {
  logger.info("🔍 getAllClients START", {
    companyId: req.companyContext?.companyId,
    userId: req.user?.id,
    prismaExists: !!req.prisma
  });
  logger.info("🔍 DEBUG getAllClients called", { 
    companyId: req.companyContext?.companyId,
    userId: req.user?.id,
    headers: req.headers
  });
  try {
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required',
        hint: 'Add x-company-id header'
      });
    }
    
    // 🔥 ИСПРАВЛЕНО: Фильтруем по company_id!
    logger.info("🔍 About to query database", { companyId });
    const clients = await req.prisma.clients.findMany({
      where: {
        company_id: parseInt(companyId)  // ✅ MULTI-TENANT ИЗОЛЯЦИЯ
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    logger.info(`📋 Found ${clients.length} clients for company ${companyId}`);
    
    res.json({
      success: true,
      clients: clients,
      count: clients.length,
      companyId: parseInt(companyId)
    });
    
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch clients',
      details: error.message 
    });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, email, phone, role, country, currency } = req.body;
    const companyId = req.companyContext?.companyId;
    const userId = req.user?.id || 1;
    
    if (!companyId) {
      return res.status(400).json({ 
        error: 'Company context required'
      });
    }

    // 🔥 ВАЛИДАЦИЯ обязательных полей
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    logger.info('Creating client:', { name, email, companyId, userId });
    
    // ✅ ПРАВИЛЬНО: указываем company_id явно
    const client = await req.prisma.clients.create({
      data: {
        name: name,
        email: email,
        phone: phone || null,
        role: role || 'CLIENT',
        country: country || null,
        currency: currency || 'EUR',
        is_juridical: true,
        is_active: true,
        created_by: userId,
        company_id: parseInt(companyId)  // ✅ ЯВНО УКАЗЫВАЕМ КОМПАНИЮ
      }
    });
    
    logger.info('Client created successfully:', { clientId: client.id, companyId });
    
    res.status(201).json({
      success: true,
      client: client,
      message: 'Клиент успешно создан!'
    });
    
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client',
      details: error.message
    });
  }
};

const getClientById = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      });
    }

    // ✅ БЕЗОПАСНОСТЬ: фильтруем по company_id
    const client = await req.prisma.clients.findFirst({
      where: {
        id: clientId,
        company_id: parseInt(companyId)  // ✅ НЕЛЬЗЯ ПОЛУЧИТЬ ЧУЖИХ КЛИЕНТОВ
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      client: client,
      companyId: parseInt(companyId)
    });

  } catch (error) {
    logger.error('Error getting client by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get client'
    });
  }
};

const updateClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      });
    }

    // ✅ БЕЗОПАСНОСТЬ: обновляем только клиентов своей компании
    const client = await req.prisma.clients.updateMany({
      where: {
        id: clientId,
        company_id: parseInt(companyId)  // ✅ MULTI-TENANT БЕЗОПАСНОСТЬ
      },
      data: req.body
    });
    
    if (client.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Client updated successfully'
    });
    
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const clientId = parseInt(req.params.id);
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      });
    }

    // ✅ БЕЗОПАСНОСТЬ: удаляем только клиентов своей компании
    const result = await req.prisma.clients.deleteMany({
      where: {
        id: clientId,
        company_id: parseInt(companyId)  // ✅ MULTI-TENANT БЕЗОПАСНОСТЬ
      }
    });
    
    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
};

// ✅ ДОПОЛНИТЕЛЬНО: поиск клиентов
const searchClients = async (req, res) => {
  try {
    const { q } = req.query;
    const companyId = req.companyContext?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: 'Company context required'
      });
    }

    logger.info("🔍 About to query database", { companyId });
    const clients = await req.prisma.clients.findMany({
      where: {
        company_id: parseInt(companyId),
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } }
        ]
      },
      orderBy: { created_at: 'desc' }
    });
    
    res.json({
      success: true,
      clients: clients,
      count: clients.length,
      query: q
    });
    
  } catch (error) {
    logger.error('Error searching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search clients'
    });
  }
};

const getMyCompanies = async (req, res) => {
  res.json({
    success: true,
    companies: [],
    message: 'Use /api/account/companies instead'
  });
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getMyCompanies
};