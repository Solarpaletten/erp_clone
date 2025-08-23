const { PrismaClient } = require('@prisma/client');

async function listUsers() {
  const prisma = new PrismaClient();
  
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('👥 Все пользователи в системе:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.username}) - ${user.role}`);
    });
    
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
