// =====================================================
// 🚀 airborneController.js - Инициализация базовых шаблонов SWAPOIL
// Файл: b/src/controllers/company/airborneController.js
// =====================================================

/**
 * 🏗️ Создание базового набора шаблонов для новой компании SWAPOIL
 * POST /api/airborne/company/init-templates
 */
const initCompanyTemplates = async (req, res) => {
    try {
      const { companyId } = req.body;
      const userId = req.user.id;
  
      // ✅ ПРОВЕРКИ БЕЗОПАСНОСТИ
      if (!companyId) {
        return res.status(400).json({
          success: false,
          error: 'Company ID is required'
        });
      }
  
      // Проверяем доступ пользователя к компании через Prisma
      const hasAccess = await req.prisma.company_users.findFirst({
        where: {
          company_id: parseInt(companyId),
          user_id: userId,
          role: { in: ['ADMIN', 'OWNER'] }
        }
      });
  
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to company'
        });
      }
  
      // Проверяем что шаблоны еще не созданы
      const existingTemplates = await req.prisma.warehouses.findFirst({
        where: {
          company_id: parseInt(companyId),
          is_template: true
        }
      });
  
      if (existingTemplates) {
        return res.status(409).json({
          success: false,
          error: 'Templates already exist for this company',
          message: 'Базовые шаблоны уже созданы для этой компании'
        });
      }
  
      // 🏗️ СОЗДАЕМ НЕФТЯНЫЕ ШАБЛОНЫ ОДНОЙ ТРАНЗАКЦИЕЙ ЧЕРЕЗ PRISMA
      const templates = await req.prisma.$transaction(async (tx) => {
        
        // 1️⃣ ОСНОВНОЙ СКЛАД "масло рапсовое"
        const warehouse = await tx.warehouses.create({
          data: {
            name: 'масло рапсовое',
            code: 'RAPESEED_OIL',
            description: 'Основной склад рапсового масла',
            address: 'Склад нефтепродуктов',
            company_id: parseInt(companyId),
            is_template: true,
            status: 'ACTIVE',
            is_main: true,
            created_by: userId
          }
        });
  
        // 2️⃣ ТОВАР "Residues technical rapeseed oil"
        const product = await tx.products.create({
          data: {
            name: 'Residues technical rapeseed oil',
            code: 'RTRO-001',
            description: 'Технические остатки рапсового масла',
            unit: 'тонна',
            purchase_price: 650.00, // 650 евро за тонну
            sale_price: 680.00,     // + наценка
            vat_rate: 23.00,        // 23% НДС
            stock_quantity: 0,
            min_stock_level: 5,
            company_id: parseInt(companyId),
            warehouse_id: warehouse.id,
            is_template: true,
            // Связи с планом счетов
            inventory_account: '2041', // Нефтепродукты
            expense_account: '6001',   // Себестоимость
            created_by: userId
          }
        });
  
        // 3️⃣ ПОСТАВЩИК "ASSET BILANS SPOLKA Z O O"
        const supplier = await tx.clients.create({
          data: {
            name: 'ASSET BILANS SPOLKA Z O O',
            code: 'ASSET-BILANS',
            client_role: 'SUPPLIER',
            company_name: 'ASSET BILANS SPOLKA Z O O',
            country: 'PL',
            currency: 'EUR',
            payment_terms_days: 30,
            credit_limit: 100000.00,
            // План счетов - поставщики
            account_code: '4430',
            company_id: parseInt(companyId),
            is_template: true,
            created_by: userId
          }
        });
  
        // 4️⃣ ПОКУПАТЕЛЬ "SWAPOIL GMBH"  
        const customer = await tx.clients.create({
          data: {
            name: 'SWAPOIL GMBH',
            code: 'SWAPOIL-DE',
            client_role: 'CLIENT',
            company_name: 'SWAPOIL GMBH',
            country: 'DE',
            currency: 'EUR',
            payment_terms_days: 15,
            credit_limit: 500000.00,
            // План счетов - покупатели
            account_code: '2410',
            company_id: parseInt(companyId),
            is_template: true,
            created_by: userId
          }
        });
  
        // 5️⃣ ОТВЕТСТВЕННОЕ ЛИЦО "LEANID KANOPLICH"
        let responsiblePerson = await tx.users.findFirst({
          where: {
            OR: [
              { username: 'leanid.kanoplich' },
              { email: 'leanid@swapoil.de' }
            ]
          }
        });
  
        if (!responsiblePerson) {
          responsiblePerson = await tx.users.create({
            data: {
              username: 'leanid.kanoplich',
              email: 'leanid@swapoil.de',
              password_hash: 'temp_hash_to_be_updated',
              first_name: 'LEANID',
              last_name: 'KANOPLICH',
              role: 'ADMIN',
              is_active: true,
              onboarding_completed: true
            }
          });
  
          // Связываем с компанией
          await tx.company_users.create({
            data: {
              company_id: parseInt(companyId),
              user_id: responsiblePerson.id,
              role: 'OWNER'
            }
          });
        }
  
        // 6️⃣ ПЛАН СЧЕТОВ (основные позиции)
        const chartAccounts = await tx.chart_of_accounts.createMany({
          data: [
            {
              account_code: '2410',
              account_name: 'Дебиторская задолженность покупателей',
              account_type: 'ASSET',
              currency: 'EUR',
              company_id: parseInt(companyId),
              created_by: userId
            },
            {
              account_code: '2710', 
              account_name: 'Банковские счета',
              account_type: 'ASSET',
              currency: 'EUR',
              company_id: parseInt(companyId),
              created_by: userId
            },
            {
              account_code: '4430',
              account_name: 'Кредиторская задолженность поставщикам',
              account_type: 'LIABILITY',
              currency: 'EUR', 
              company_id: parseInt(companyId),
              created_by: userId
            },
            {
              account_code: '2041',
              account_name: 'Нефтепродукты на складе',
              account_type: 'ASSET',
              currency: 'EUR',
              company_id: parseInt(companyId),
              created_by: userId
            }
          ]
        });
  
        return {
          warehouse,
          product,
          supplier,
          customer,
          responsiblePerson,
          chartAccountsCount: 4
        };
      });
  
      // 📊 УСПЕШНЫЙ ОТВЕТ
      res.status(201).json({
        success: true,
        message: '🛢️ Шаблоны для нефтяной торговли созданы!',
        data: {
          templates: {
            warehouse: {
              id: templates.warehouse.id,
              name: 'масло рапсовое',
              code: 'RAPESEED_OIL'
            },
            product: {
              id: templates.product.id,
              name: 'Residues technical rapeseed oil',
              price: '650 EUR/тонна',
              quantity: '23 тонны',
              vat: '23%'
            },
            supplier: {
              id: templates.supplier.id,
              name: 'ASSET BILANS SPOLKA Z O O',
              account: '4430'
            },
            customer: {
              id: templates.customer.id,
              name: 'SWAPOIL GMBH',
              account: '2410'
            },
            responsiblePerson: {
              id: templates.responsiblePerson.id,
              name: 'LEANID KANOPLICH'
            },
            chartOfAccounts: {
              count: templates.chartAccountsCount,
              accounts: ['2410', '2710', '4430', '2041']
            }
          },
          companyId: parseInt(companyId),
          createdAt: new Date().toISOString(),
          readyForOilTrading: true
        }
      });
  
    } catch (error) {
      console.error('❌ Error creating oil trading templates:', error);
  
      res.status(500).json({
        success: false,
        error: 'Failed to create oil trading templates',
        message: 'Ошибка создания шаблонов для нефтяной торговли',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  
  /**
   * 🔍 Проверка существования шаблонов для нефтяной торговли
   * GET /api/airborne/company/:id/templates/check
   */
  const checkTemplatesExist = async (req, res) => {
    try {
      const { id: companyId } = req.params;
      const userId = req.user.id;
  
      // Проверяем доступ через Prisma
      const hasAccess = await req.prisma.company_users.findFirst({
        where: {
          company_id: parseInt(companyId),
          user_id: userId
        }
      });
  
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }
  
      // Проверяем наличие нефтяных шаблонов
      const [warehouse, product, supplier, customer] = await Promise.all([
        req.prisma.warehouses.findFirst({ 
          where: { company_id: parseInt(companyId), name: 'масло рапсовое' } 
        }),
        req.prisma.products.findFirst({ 
          where: { company_id: parseInt(companyId), name: 'Residues technical rapeseed oil' } 
        }),
        req.prisma.clients.findFirst({ 
          where: { company_id: parseInt(companyId), name: 'ASSET BILANS SPOLKA Z O O' } 
        }),
        req.prisma.clients.findFirst({ 
          where: { company_id: parseInt(companyId), name: 'SWAPOIL GMBH' } 
        })
      ]);
  
      const oilTradingReady = !!(warehouse && product && supplier && customer);
  
      res.json({
        success: true,
        oilTradingReady,
        templates: {
          warehouse: !!warehouse,
          oilProduct: !!product,
          assetBilans: !!supplier,
          swapoil: !!customer
        },
        readyForAirborne: oilTradingReady,
        message: oilTradingReady ? 
          '🛢️ SWAPOIL готов к воздушной торговле!' : 
          '⚠️ Создайте шаблоны для начала торговли'
      });
  
    } catch (error) {
      console.error('Error checking oil trading templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check templates'
      });
    }
  };
  
  module.exports = {
    initCompanyTemplates,
    checkTemplatesExist
  };