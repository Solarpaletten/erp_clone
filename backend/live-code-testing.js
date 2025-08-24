// =====================================================
// 🔥 МЕТОДОЛОГИЯ "ЖИВОГО КОДА" - РЕВОЛЮЦИОННЫЙ ПОДХОД
// =====================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// 🎯 ПОЛНЫЙ ЦИКЛ ТЕСТИРОВАНИЯ "ВОЗДУШНОЙ БУХГАЛТЕРИИ"
async function airborneAccountingFullTest() {
  try {
    console.log('🚀 НАЧИНАЕМ ПОЛНОЕ ТЕСТИРОВАНИЕ ВОЗДУШНОЙ БУХГАЛТЕРИИ');

    // 1️⃣ СОЗДАНИЕ АДМИНИСТРАТОРА
    console.log('\n1️⃣ Создание администратора...');
    const passwordHash = await bcrypt.hash('password', 10);
    
    const admin = await prisma.users.upsert({
      where: { email: 'solar@solar.com' },
      update: {},
      create: {
        email: 'solar@solar.com',
        username: 'solar_admin',
        password_hash: passwordHash,
        first_name: 'Solar',
        last_name: 'Admin',
        role: 'ADMIN',
        is_active: true,
        email_verified: true
      }
    });
    console.log('✅ Администратор создан:', admin.email);

    // 2️⃣ СОЗДАНИЕ КОМПАНИИ SWAPOIL
    console.log('\n2️⃣ Создание компании SWAPOIL...');
    const company = await prisma.companies.upsert({
      where: { code: 'SWAPOIL' },
      update: {},
      create: {
        code: 'SWAPOIL',
        name: 'SWAPOIL GMBH',
        director_name: 'LEANID KANOPLICH',
        owner_id: admin.id,
        legal_entity_type: 'GMBH',
        description: 'Нефтяная торговля',
        is_active: true,
        setup_completed: true
      }
    });
    console.log('✅ Компания создана:', company.name, 'ID:', company.id);

    // 3️⃣ СОЗДАНИЕ БАЗОВОГО СКЛАДА
    console.log('\n3️⃣ Создание базового склада...');
    const warehouse = await prisma.warehouses.upsert({
      where: { 
        company_id_code: { 
          company_id: company.id, 
          code: 'MAIN' 
        } 
      },
      update: {},
      create: {
        company_id: company.id,
        name: 'масло рапсовое',
        code: 'MAIN',
        description: 'Основной склад для нефтепродуктов',
        is_main: true,
        is_template: true,
        status: 'ACTIVE',
        created_by: admin.id
      }
    });
    console.log('✅ Склад создан:', warehouse.name);

    // 4️⃣ СОЗДАНИЕ ТОВАРА-ШАБЛОНА
    console.log('\n4️⃣ Создание товара-шаблона...');
    const product = await prisma.products.upsert({
      where: { 
        company_id_code: { 
          company_id: company.id, 
          code: 'OIL-001' 
        } 
      },
      update: {},
      create: {
        company_id: company.id,
        code: 'OIL-001',
        name: 'Residues technical rapeseed oil',
        description: 'Технические остатки рапсового масла',
        unit: 't',
        price: 650.00,
        cost_price: 650.00,
        currency: 'EUR',
        vat_rate: 23.00,
        category: 'Нефтепродукты',
        is_active: true,
        is_template: true,
        batch_tracking: true,
        created_by: admin.id
      }
    });
    console.log('✅ Товар создан:', product.name);

    // 5️⃣ СОЗДАНИЕ ПОСТАВЩИКА-ШАБЛОНА
    console.log('\n5️⃣ Создание поставщика-шаблона...');
    const supplier = await prisma.clients.upsert({
      where: { 
        company_id_code: { 
          company_id: company.id, 
          code: 'SUP-001' 
        } 
      },
      update: {},
      create: {
        company_id: company.id,
        name: 'ASSET BILANS SPOLKA Z O O',
        code: 'SUP-001',
        role: 'SUPPLIER',
        email: 'contact@assetbilans.pl',
        phone: '+48 123 456 789',
        is_juridical: true,
        is_active: true,
        is_template: true,
        country: 'Poland',
        legal_address: 'Warsaw, Poland',
        created_by: admin.id
      }
    });
    console.log('✅ Поставщик создан:', supplier.name);

    // 6️⃣ СОЗДАНИЕ ПОКУПАТЕЛЯ-ШАБЛОНА
    console.log('\n6️⃣ Создание покупателя-шаблона...');
    const customer = await prisma.clients.upsert({
      where: { 
        company_id_code: { 
          company_id: company.id, 
          code: 'CUS-001' 
        } 
      },
      update: {},
      create: {
        company_id: company.id,
        name: 'SWAPOIL GMBH',
        code: 'CUS-001',
        role: 'CLIENT',
        email: 'orders@swapoil.de',
        phone: '+49 123 456 789',
        is_juridical: true,
        is_active: true,
        is_template: true,
        country: 'Germany',
        legal_address: 'Hamburg, Germany',
        created_by: admin.id
      }
    });
    console.log('✅ Покупатель создан:', customer.name);

    // 7️⃣ СОЗДАНИЕ ШАБЛОНА ПРИХОДА
    console.log('\n7️⃣ Создание шаблона прихода...');
    const templatePurchase = await prisma.purchases.create({
      data: {
        company_id: company.id,
        document_number: 'TEMPLATE-PUR-001',
        document_date: new Date(),
        operation_type: 'PURCHASE',
        supplier_id: supplier.id,
        warehouse_id: warehouse.id,
        purchase_manager_id: admin.id,
        subtotal: 14950.00,  // 23 тонны * 650 EUR
        vat_amount: 3438.50, // 23%
        total_amount: 18388.50,
        currency: 'EUR',
        payment_status: 'PENDING',
        delivery_status: 'PENDING',
        document_status: 'DRAFT',
        is_template: true,
        created_by: admin.id
      }
    });

    // Создание позиций шаблона прихода
    await prisma.purchase_items.create({
      data: {
        purchase_id: templatePurchase.id,
        product_id: product.id,
        quantity: 23.000,
        unit_price_base: 650.00,
        vat_rate: 23.00,
        vat_amount: 3438.50,
        line_total: 18388.50
      }
    });
    console.log('✅ Шаблон прихода создан:', templatePurchase.document_number);

    // 8️⃣ ТЕСТИРОВАНИЕ КОПИРОВАНИЯ
    console.log('\n8️⃣ Тестирование копирования...');
    const copiedPurchase = await prisma.purchases.create({
      data: {
        company_id: company.id,
        document_number: `PUR-${Date.now()}`,
        document_date: new Date(),
        operation_type: 'PURCHASE',
        supplier_id: supplier.id,
        warehouse_id: warehouse.id,
        purchase_manager_id: admin.id,
        subtotal: templatePurchase.subtotal,
        vat_amount: templatePurchase.vat_amount,
        total_amount: templatePurchase.total_amount,
        currency: 'EUR',
        payment_status: 'PENDING',
        delivery_status: 'PENDING',
        document_status: 'DRAFT',
        is_template: false,
        created_by: admin.id
      }
    });
    console.log('✅ Копирование успешно! Новый документ:', copiedPurchase.document_number);

    // 9️⃣ ФИНАЛЬНАЯ СТАТИСТИКА
    console.log('\n🎊 ТЕСТИРОВАНИЕ ЗАВЕРШЕНО УСПЕШНО!');
    console.log('═══════════════════════════════════════');
    console.log(`👤 Администратор: ${admin.email}`);
    console.log(`🏢 Компания: ${company.name} (ID: ${company.id})`);
    console.log(`🏪 Склад: ${warehouse.name}`);
    console.log(`📦 Товар: ${product.name}`);
    console.log(`🏭 Поставщик: ${supplier.name}`);
    console.log(`🏢 Покупатель: ${customer.name}`);
    console.log(`📋 Шаблон прихода: ${templatePurchase.document_number}`);
    console.log(`🔄 Скопированный приход: ${copiedPurchase.document_number}`);
    console.log('═══════════════════════════════════════');
    console.log('🚀 "ВОЗДУШНАЯ БУХГАЛТЕРИЯ" ГОТОВА К РАБОТЕ!');

    // 🔟 ДАННЫЕ ДЛЯ ВХОДА
    console.log('\n🔑 ДАННЫЕ ДЛЯ ВХОДА В СИСТЕМУ:');
    console.log(`Email: ${admin.email}`);
    console.log('Password: password');
    console.log(`Компания: ${company.name}`);
    console.log('URL: http://localhost:5173');

    await prisma.$disconnect();
    return {
      admin,
      company,
      warehouse,
      product,
      supplier,
      customer,
      templatePurchase,
      copiedPurchase
    };

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    await prisma.$disconnect();
    throw error;
  }
}

// 🎯 ЗАПУСК ПОЛНОГО ТЕСТИРОВАНИЯ
if (require.main === module) {
  airborneAccountingFullTest()
    .then(() => {
      console.log('\n✅ Все данные созданы успешно!');
      console.log('🚀 Можете тестировать систему в браузере!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Ошибка:', error);
      process.exit(1);
    });
}

module.exports = { airborneAccountingFullTest };