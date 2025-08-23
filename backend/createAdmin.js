const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'dk@dk.de';
    const password = 'pass123';
    const username = 'DASCHA';

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin already exists:', existingUser);
      return;
    }

    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Создаём администратора
    const admin = await prisma.users.create({
      data: {
        email,
        username,
        password_hash: passwordHash,
        role: 'ADMIN',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('Admin created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
