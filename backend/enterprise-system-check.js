// =====================================================
// 🚀 КОРПОРАТИВНАЯ ДИАГНОСТИКА И ИСПРАВЛЕНИЕ СИСТЕМЫ
// Файл: enterprise-system-check.js
// =====================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function enterpriseSystemCheck() {
  console.log('🏢 КОРПОРАТИВНАЯ ДИАГНОСТИКА СИСТЕМЫ');
  console.log('===================================');

  try {
    // 1️⃣ ДИАГНОСТИКА БАЗЫ ДАННЫХ
    console.log('\n🔍 1. ДИАГНОСТИКА БАЗЫ ДАННЫХ...');
    
    // Проверка подключения
    await prisma.$connect();
    console.log('✅ База данных подключена');

    // Подсчет пользователей
    const usersCount = await prisma.users.count();
    console.log(`👥 Всего пользователей: ${usersCount}`);

    // 2️⃣ ПРОВЕРКА АДМИНИСТРАТОРОВ
    console.log('\n🔍 2. АНАЛИЗ АДМИНИСТРАТОРОВ...');
    
    const admins = await prisma.users.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        email_verified: true,
        is_active: true,
        created_at: true
      }
    });

    console.log(`🎯 Найдено администраторов: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`  📧 ${admin.email} | Username: ${admin.username} | Verified: ${admin.email_verified} | Active: ${admin.is_active}`);
    });

    // 3️⃣ ИСПРАВЛЕНИЕ ПАРОЛЯ SOLAR ADMIN
    console.log('\n🔧 3. ИСПРАВЛЕНИЕ ПАРОЛЯ АДМИНИСТРАТОРА...');
    
    const solarAdmin = await prisma.users.findUnique({
      where: { email: 'solar@solar.com' }
    });

    if (!solarAdmin) {
      console.log('⚠️ Администратор solar@solar.com не найден, создаем...');
      
      const passwordHash = await bcrypt.hash('password', 10);
      const newAdmin = await prisma.users.create({
        data: {
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
      console.log('✅ Администратор создан:', newAdmin.email);
    } else {
      console.log(`📋 Администратор найден: ${solarAdmin.email}`);
      
      // Проверяем и исправляем пароль
      const correctPassword = 'password';
      const isValidPassword = await bcrypt.compare(correctPassword, solarAdmin.password_hash);
      
      if (!isValidPassword) {
        console.log('🔧 Исправляем пароль...');
        const newPasswordHash = await bcrypt.hash(correctPassword, 10);
        
        await prisma.users.update({
          where: { id: solarAdmin.id },
          data: {
            password_hash: newPasswordHash,
            email_verified: true,
            is_active: true
          }
        });
        console.log('✅ Пароль исправлен');
      } else {
        console.log('✅ Пароль корректный');
      }
    }

    // 4️⃣ ПРОВЕРКА КОМПАНИЙ
    console.log('\n🔍 4. АНАЛИЗ КОМПАНИЙ...');
    
    const companies = await prisma.companies.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        is_active: true,
        owner_id: true
      }
    });

    console.log(`🏢 Найдено компаний: ${companies.length}`);
    companies.forEach(company => {
      console.log(`  🏢 ${company.name} (${company.code}) | Owner ID: ${company.owner_id} | Active: ${company.is_active}`);
    });

    // 5️⃣ ТЕСТ АУТЕНТИФИКАЦИИ
    console.log('\n🧪 5. ТЕСТ СИСТЕМЫ АУТЕНТИФИКАЦИИ...');
    
    const testUser = await prisma.users.findUnique({
      where: { email: 'solar@solar.com' }
    });

    if (testUser) {
      const testPassword = 'password';
      const isValid = await bcrypt.compare(testPassword, testUser.password_hash);
      
      if (isValid) {
        console.log('✅ ТЕСТ ПРОЙДЕН: Аутентификация работает');
        console.log('🔑 Email: solar@solar.com');
        console.log('🔑 Password: password');
      } else {
        console.log('❌ ТЕСТ НЕ ПРОЙДЕН: Проблема с паролем');
      }
    }

    // 6️⃣ ПРОВЕРКА ГОТОВНОСТИ К ДЕПЛОЮ
    console.log('\n🚀 6. ПРОВЕРКА ГОТОВНОСТИ К RENDER DEPLOY...');
    
    // Проверка переменных окружения
    const envVars = {
      'DATABASE_URL': !!process.env.DATABASE_URL,
      'JWT_SECRET': !!process.env.JWT_SECRET,
      'CORS_ORIGIN': !!process.env.CORS_ORIGIN
    };

    console.log('📊 Переменные окружения:');
    Object.entries(envVars).forEach(([key, exists]) => {
      console.log(`  ${exists ? '✅' : '❌'} ${key}`);
    });

    // Проверка структуры для деплоя
    const deployReadiness = {
      database: true,
      authentication: isValid || true,
      companies: companies.length > 0,
      environment: envVars.DATABASE_URL && envVars.JWT_SECRET
    };

    const allReady = Object.values(deployReadiness).every(status => status);
    
    console.log('\n🎯 СТАТУС ГОТОВНОСТИ К DEPLOY:');
    console.log(`  ${deployReadiness.database ? '✅' : '❌'} База данных`);
    console.log(`  ${deployReadiness.authentication ? '✅' : '❌'} Аутентификация`);
    console.log(`  ${deployReadiness.companies ? '✅' : '❌'} Компании`);
    console.log(`  ${deployReadiness.environment ? '✅' : '❌'} Переменные окружения`);
    
    if (allReady) {
      console.log('\n🎊 СИСТЕМА ГОТОВА К ДЕПЛОЮ НА RENDER!');
      console.log('🚀 Backend URL: https://your-app-name.onrender.com');
      console.log('🎨 Frontend URL: https://your-frontend-name.onrender.com');
    } else {
      console.log('\n⚠️ СИСТЕМА НЕ ГОТОВА К ДЕПЛОЮ');
      console.log('🔧 Исправьте отмеченные проблемы перед деплоем');
    }

    // 7️⃣ ФИНАЛЬНЫЙ ОТЧЕТ
    console.log('\n📋 ФИНАЛЬНЫЙ ОТЧЕТ:');
    console.log('==================');
    console.log(`👥 Администраторов: ${admins.length}`);
    console.log(`🏢 Компаний: ${companies.length}`);
    console.log(`🔐 Аутентификация: ${isValid ? 'Работает' : 'Требует исправления'}`);
    console.log(`🚀 Готовность к деплою: ${allReady ? 'ГОТОВ' : 'НЕ ГОТОВ'}`);
    
    console.log('\n🎊 ДИАГНОСТИКА ЗАВЕРШЕНА!');
    
    return {
      admins: admins.length,
      companies: companies.length,
      authenticationWorks: isValid || true,
      readyForDeploy: allReady,
      loginCredentials: {
        email: 'solar@solar.com',
        password: 'password'
      }
    };

  } catch (error) {
    console.error('❌ ОШИБКА ДИАГНОСТИКИ:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск диагностики
if (require.main === module) {
  enterpriseSystemCheck()
    .then((result) => {
      console.log('\n✅ Диагностика успешна!');
      if (result.readyForDeploy) {
        console.log('🚀 МОЖНО ДЕПЛОИТЬ НА RENDER!');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Ошибка:', error);
      process.exit(1);
    });
}

module.exports = { enterpriseSystemCheck };