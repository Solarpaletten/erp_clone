// src/controllers/accountController.js
const prismaManager = require('../../utils/prismaManager');
const { logger } = require('../../config/logger');

// Тест Account Level API
const testAccount = async (req, res) => {
  try {
    res.json({
      message: 'Account Level API working!',
      level: 'account',
      user: {
        id: req.user?.id,
        email: req.user?.email,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Account test error:', error);
    res.status(500).json({ error: 'Account test failed' });
  }
};

// Получить список компаний пользователя
const getAllCompanies = async (req, res) => {
  try {
    logger.info('Getting companies for user:', req.user?.id);

    // Используем Account Level Prisma
    const accountPrisma = prismaManager.getAccountPrisma();

    // Получаем компании где пользователь владелец ИЛИ сотрудник
    const companies = await accountPrisma.companies.findMany({
      where: {
        OR: [
          // Пользователь - владелец компании
          {
            owner_id: req.user.id,
          },
          // Пользователь - сотрудник компании
          {
            employees: {
              some: {
                user_id: req.user.id,
                is_active: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        employees: {
          where: {
            user_id: req.user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    logger.info(`Found ${companies.length} companies for user ${req.user.id}`);

    res.json({
      success: true,
      companies: companies,
      count: companies.length,
    });
  } catch (error) {
    logger.error('Ошибка получения списка компаний:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения списка компаний',
      details: error.message,
    });
  }
};

// Создать новую компанию
const createCompany = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      director_name,
      legal_entity_type,
      phone,
      email,
    } = req.body;

    logger.info('Creating company:', {
      name,
      code,
      user_id: req.user.id,
    });

    // Используем Account Level Prisma
    const accountPrisma = prismaManager.getAccountPrisma();

    // Создаем компанию и связь с пользователем в транзакции
    const result = await accountPrisma.$transaction(async (prisma) => {
      // Создаем компанию
      const company = await prisma.companies.create({
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          director_name:
            director_name ||
            `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() ||
            'Director',
          legal_entity_type: legal_entity_type || 'LLC', // Значение по умолчанию
          phone: phone || null,
          email: email || null,
          owner_id: req.user.id, // Владелец компании
          is_active: true,
          setup_completed: true,
        },
      });

      // Создаем связь пользователь-компания (владелец)
      await prisma.company_users.create({
        data: {
          company_id: company.id,
          user_id: req.user.id,
          role: 'OWNER',
          is_active: true,
        },
      });

      return company;
    });

    logger.info('Company created successfully:', { companyId: result.id });

    res.status(201).json({
      success: true,
      company: result,
      message: 'Компания успешно создана!',
    });
  } catch (error) {
    logger.error('Ошибка создания компании:', error);

    // Обработка ошибок дублирования
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
      return res.status(409).json({
        success: false,
        error: 'Код компании уже используется',
        message: 'Выберите другой код компании',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Ошибка создания компании',
      details: error.message,
    });
  }
};

// Получить компанию по ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const accountPrisma = prismaManager.getAccountPrisma();

    const company = await accountPrisma.companies.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { owner_id: req.user.id },
          {
            employees: {
              some: {
                user_id: req.user.id,
                is_active: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        employees: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Компания не найдена',
      });
    }

    res.json({
      success: true,
      company: company,
    });
  } catch (error) {
    logger.error('Ошибка получения компании:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения компании',
      details: error.message,
    });
  }
};

// Переключение контекста компании
const selectCompany = async (req, res) => {
  try {
    const { company_id } = req.body;

    // Проверяем, что пользователь имеет доступ к компании
    const accountPrisma = prismaManager.getAccountPrisma();

    const company = await accountPrisma.companies.findFirst({
      where: {
        id: parseInt(company_id),
        OR: [
          { owner_id: req.user.id },
          {
            employees: {
              some: {
                user_id: req.user.id,
                is_active: true,
              },
            },
          },
        ],
      },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Компания не найдена или нет доступа',
      });
    }

    // Обновляем current_company_id у пользователя
    await accountPrisma.users.update({
      where: { id: req.user.id },
      data: { current_company_id: parseInt(company_id) },
    });

    res.json({
      success: true,
      message: 'Контекст компании установлен',
      company: {
        id: company.id,
        name: company.name,
        code: company.code,
      },
    });
  } catch (error) {
    logger.error('Ошибка переключения компании:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка переключения компании',
      details: error.message,
    });
  }
};

// Получить системную аналитику
const getSystemAnalytics = async (req, res) => {
  try {
    const accountPrisma = prismaManager.getAccountPrisma();

    const [totalUsers, totalCompanies, activeCompanies] = await Promise.all([
      accountPrisma.users.count(),
      accountPrisma.companies.count(),
      accountPrisma.companies.count({
        where: { is_active: true },
      }),
    ]);

    res.json({
      success: true,
      analytics: {
        users: totalUsers,
        companies: {
          total: totalCompanies,
          active: activeCompanies,
          inactive: totalCompanies - activeCompanies,
        },
      },
    });
  } catch (error) {
    logger.error('Ошибка получения аналитики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения аналитики',
    });
  }
};

const getCompaniesWithStats = async (req, res) => {
  try {
    const accountPrisma = prismaManager.getAccountPrisma();

    // Получаем компании пользователя с количеством клиентов
    const companies = await accountPrisma.companies.findMany({
      where: {
        OR: [
          { owner_id: req.user.id },
          {
            employees: {
              some: {
                user_id: req.user.id,
                is_active: true,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        _count: {
          select: {
            clients: true,
            sales: true,
            products: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const companiesWithStats = companies.map((company) => ({
      ...company,
      clientsCount: company._count.clients,
      salesCount: company._count.sales,
      productsCount: company._count.products,
    }));

    res.json({
      success: true,
      companies: companiesWithStats,
      count: companiesWithStats.length,
    });
  } catch (error) {
    logger.error('Ошибка получения компаний со статистикой:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения статистики компаний',
    });
  }
};

module.exports = {
  testAccount,
  getAllCompanies, // ← ПРАВИЛЬНОЕ ИМЯ для роутов
  createCompany,
  getCompanyById,
  selectCompany,
  getSystemAnalytics,
  getCompaniesWithStats,
};
