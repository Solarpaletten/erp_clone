cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const newPassword = await bcrypt.hash('pass123', 10);
    await prisma.users.update({
      where: { email: 'solar@solar.com' },
      data: { password_hash: newPassword }
    });
    console.log('✅ Пароль изменен на: pass123');
    process.exit(0);
  } catch (error) {
    console.log('❌ Ошибка:', error.message);
    process.exit(1);
  }
}
updatePassword();
"