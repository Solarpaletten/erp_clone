const { PrismaClient } = require('@prisma/client');

/**
 * 🏗️ PRISMA MANAGER для двухуровневой архитектуры
 * Поддерживает Account Level и Company Level операции
 */

class PrismaManager {
  constructor() {
    this.prisma = new PrismaClient();
    this.companyClients = new Map(); // Кэш для Company Level клиентов
  }

  // ===========================================
  // 🏢 ACCOUNT LEVEL PRISMA (БЕЗ company filtering)
  // ===========================================
  getAccountPrisma() {
    // Возвращаем обычный Prisma клиент БЕЗ middleware
    return this.prisma;
  }

  // ===========================================
  // 🏭 COMPANY LEVEL PRISMA (С company filtering)
  // ===========================================
  getCompanyPrisma(companyId) {
    if (!companyId) {
      throw new Error('Company ID is required for Company Level operations');
    }

    // Возвращаем тот же клиент, но с контекстом компании
    // Filtering будет происходить через middleware в роутах
    return this.prisma;
  }

  // ===========================================
  // 🔧 UTILITY METHODS
  // ===========================================
  async connect() {
    await this.prisma.$connect();
    return this.prisma;
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Проверка подключения
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', connection: 'Connected' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Получить список всех таблиц
  async getTables() {
    const tables = await this.prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    return tables.map(t => t.table_name);
  }
}

// Создаем singleton instance
const prismaManager = new PrismaManager();

// Экспортируем для обратной совместимости
module.exports = {
  prisma: prismaManager.prisma,
  connect: () => prismaManager.connect(),
  
  // Новые методы для двухуровневой архитектуры
  getAccountPrisma: () => prismaManager.getAccountPrisma(),
  getCompanyPrisma: (companyId) => prismaManager.getCompanyPrisma(companyId),
  
  // Утилиты
  healthCheck: () => prismaManager.healthCheck(),
  getTables: () => prismaManager.getTables(),
  
  // Singleton instance
  manager: prismaManager
};
