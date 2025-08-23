const { PrismaClient } = require('@prisma/client');

async function createCompany() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Создание компании для solar@solar.com...');
    
    const admin = await prisma.users.findUnique({
      where: { email: 'solar@solar.com' }
    });
    
    if (!admin) {
      console.log('❌ Админ не найден');
      return;
    }
    
    const company = await prisma.companies.create({
      data: {
        code: 'SOLAR',
        name: 'SOLAR Energy Ltd',
        director_name: 'Solar User1',
        owner_id: admin.id,
        legal_entity_type: 'LLC',
        is_active: true,
        setup_completed: true
      }
    });
    
    console.log('✅ Компания создана:', company.name);
    console.log('📋 Код:', company.code);
    console.log('👤 Владелец ID:', company.owner_id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Компания уже существует');
    } else {
      console.log('❌ Ошибка:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createCompany();
