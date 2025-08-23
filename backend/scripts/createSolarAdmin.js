const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Создание администратора solar@solar.com...');
    
    const hashedPassword = await bcrypt.hash('pass123', 10);
    
    const user = await prisma.users.create({
      data: {
        email: 'solar@solar.com',
        username: 'solar',
        password_hash: hashedPassword,
        role: 'ADMIN',
        email_verified: true,
        first_name: 'Solar',
        last_name: 'User1'
      }
    });
    
    console.log('✅ Админ создан успешно!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: pass123');
    console.log('👤 ID:', user.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Пользователь уже существует');
    } else {
      console.log('❌ Ошибка:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
