// b/src/services/accounting/accountingIntegrationService.js
// 🎯 ИНТЕГРАЦИЯ PURCHASES/SALES С ПЛАНОМ СЧЕТОВ
// Автоматическое создание бухгалтерских проводок

const { logger } = require('../../config/logger');

// ===============================================
// 📊 ПЛАН СЧЕТОВ - ЛИТОВСКАЯ ВЕРСИЯ
// ===============================================

const LITHUANIAN_CHART_OF_ACCOUNTS = {
  // Активы (Класс 2)
  '2040': { name: 'Товары для перепродажи', type: 'ASSET', debit_increase: true },
  '2410': { name: 'Дебиторская задолженность покупателей', type: 'ASSET', debit_increase: true },
  '2710': { name: 'Банковские счета', type: 'ASSET', debit_increase: true },
  
  // Обязательства (Класс 4-5)
  '4430': { name: 'Кредиторская задолженность поставщикам', type: 'LIABILITY', debit_increase: false },
  '4492': { name: 'НДС к доплате (PVM)', type: 'LIABILITY', debit_increase: false },
  
  // Доходы (Класс 7)
  '7001': { name: 'Выручка от продаж', type: 'INCOME', debit_increase: false },
  
  // Расходы (Класс 6)  
  '6001': { name: 'Себестоимость продаж', type: 'EXPENSE', debit_increase: true },
  '6002': { name: 'Коммерческие расходы', type: 'EXPENSE', debit_increase: true }
};

// ===============================================
// 📥 АВТОМАТИЧЕСКИЕ ПРОВОДКИ ПРИ ПОКУПКЕ
// ===============================================

const createPurchaseAccountingEntries = async (purchase, purchaseItems, tx) => {
  const entries = [];
  
  for (const item of purchaseItems) {
    const amount = item.quantity * item.unit_price_base;
    const vatAmount = amount * (item.vat_rate / 100);
    
    // 1. Приход товара на склад
    entries.push({
      account_debit: '2040',    // Товары для перепродажи
      account_credit: '4430',   // Поставщики
      amount: amount,
      description: `Приход товара: ${item.product?.name || 'Product #' + item.product_id}`,
      document_type: 'PURCHASE',
      document_id: purchase.id,
      product_id: item.product_id,
      warehouse_id: purchase.warehouse_id,
      quantity: item.quantity,
      unit_cost: item.unit_price_base
    });
    
    // 2. НДС к возмещению (если применимо)
    if (vatAmount > 0) {
      entries.push({
        account_debit: '2440',    // НДС к возмещению
        account_credit: '4430',   // Поставщики
        amount: vatAmount,
        description: `НДС по покупке: ${item.product?.name || 'Product #' + item.product_id}`,
        document_type: 'PURCHASE',
        document_id: purchase.id,
        vat_rate: item.vat_rate
      });
    }
  }
  
  // Создаём записи в журнале проводок
  if (entries.length > 0) {
    await tx.accounting_entries.createMany({
      data: entries.map(entry => ({
        company_id: purchase.company_id,
        entry_date: purchase.document_date,
        account_debit: entry.account_debit,
        account_credit: entry.account_credit,
        amount: entry.amount,
        description: entry.description,
        document_type: entry.document_type,
        document_id: entry.document_id,
        product_id: entry.product_id,
        warehouse_id: entry.warehouse_id,
        quantity: entry.quantity,
        unit_cost: entry.unit_cost,
        vat_rate: entry.vat_rate,
        created_by: purchase.created_by
      }))
    });

    logger.info(`📊 Created ${entries.length} accounting entries for purchase ${purchase.id}`);
  }
  
  return entries;
};

// ===============================================
// 📤 АВТОМАТИЧЕСКИЕ ПРОВОДКИ ПРИ ПРОДАЖЕ  
// ===============================================

const createSaleAccountingEntries = async (sale, saleItems, batchAllocations, tx) => {
  const entries = [];
  
  for (const item of saleItems) {
    const saleAmount = item.quantity * item.unit_price_base;
    const vatAmount = saleAmount * (item.vat_rate / 100);
    
    // Получаем средневзвешенную себестоимость из партий
    const itemAllocations = batchAllocations.filter(alloc => alloc.product_id === item.product_id);
    const totalCost = itemAllocations.reduce((sum, alloc) => sum + (alloc.quantity * alloc.unit_cost), 0);
    
    // 1. Выручка от продажи
    entries.push({
      account_debit: '2410',    // Покупатели
      account_credit: '7001',   // Выручка от продаж
      amount: saleAmount,
      description: `Продажа товара: ${item.product?.name || 'Product #' + item.product_id}`,
      document_type: 'SALE',
      document_id: sale.id,
      product_id: item.product_id,
      warehouse_id: sale.warehouse_id,
      quantity: item.quantity,
      sale_price: item.unit_price_base
    });
    
    // 2. НДС с продаж (если применимо)
    if (vatAmount > 0) {
      entries.push({
        account_debit: '2410',    // Покупатели (увеличиваем сумму к получению)
        account_credit: '4492',   // НДС к доплате (PVM)
        amount: vatAmount,
        description: `НДС с продажи: ${item.product?.name || 'Product #' + item.product_id}`,
        document_type: 'SALE',
        document_id: sale.id,
        vat_rate: item.vat_rate
      });
    }
    
    // 3. Списание себестоимости (ВАЖНО! На основе FIFO партий)
    if (totalCost > 0) {
      entries.push({
        account_debit: '6001',    // Себестоимость продаж
        account_credit: '2040',   // Товары для перепродажи
        amount: totalCost,
        description: `Себестоимость продажи: ${item.product?.name || 'Product #' + item.product_id} (FIFO)`,
        document_type: 'SALE',
        document_id: sale.id,
        product_id: item.product_id,
        warehouse_id: sale.warehouse_id,
        quantity: item.quantity,
        unit_cost: totalCost / item.quantity, // Средневзвешенная себестоимость
        batch_info: JSON.stringify(itemAllocations) // Детали по партиям
      });
    }
  }
  
  // Создаём записи в журнале проводок
  if (entries.length > 0) {
    await tx.accounting_entries.createMany({
      data: entries.map(entry => ({
        company_id: sale.company_id,
        entry_date: sale.document_date,
        account_debit: entry.account_debit,
        account_credit: entry.account_credit,
        amount: entry.amount,
        description: entry.description,
        document_type: entry.document_type,
        document_id: entry.document_id,
        product_id: entry.product_id,
        warehouse_id: entry.warehouse_id,
        quantity: entry.quantity,
        sale_price: entry.sale_price,
        unit_cost: entry.unit_cost,
        vat_rate: entry.vat_rate,
        batch_info: entry.batch_info,
        created_by: sale.created_by
      }))
    });

    logger.info(`📊 Created ${entries.length} accounting entries for sale ${sale.id}`);
  }
  
  return entries;
};

// ===============================================
// 💰 БАНКОВСКИЕ ОПЕРАЦИИ
// ===============================================

const createBankingAccountingEntries = async (bankOperation, tx) => {
  const entries = [];
  
  // Определяем тип операции и создаём соответствующие проводки
  switch (bankOperation.type) {
    case 'INCOME':
      // Поступление денег на банковский счёт
      entries.push({
        account_debit: '2710',   // Банковские счета
        account_credit: bankOperation.client_id ? '2410' : '7002', // Покупатели или прочие доходы
        amount: bankOperation.amount,
        description: `Поступление: ${bankOperation.description}`,
        document_type: 'BANK_INCOME',
        document_id: bankOperation.id
      });
      break;
      
    case 'EXPENSE':
      // Списание денег с банковского счёта
      entries.push({
        account_debit: bankOperation.client_id ? '4430' : '6002', // Поставщики или прочие расходы
        account_credit: '2710',   // Банковские счета
        amount: bankOperation.amount,
        description: `Списание: ${bankOperation.description}`,
        document_type: 'BANK_EXPENSE',
        document_id: bankOperation.id
      });
      break;
      
    case 'TRANSFER':
      // Перевод между счетами - пока не реализуем
      break;
  }
  
  // Создаём записи в журнале проводок
  if (entries.length > 0) {
    await tx.accounting_entries.createMany({
      data: entries.map(entry => ({
        company_id: bankOperation.company_id,
        entry_date: bankOperation.operation_date,
        account_debit: entry.account_debit,
        account_credit: entry.account_credit,
        amount: entry.amount,
        description: entry.description,
        document_type: entry.document_type,
        document_id: entry.document_id,
        created_by: bankOperation.created_by
      }))
    });

    logger.info(`📊 Created ${entries.length} accounting entries for bank operation ${bankOperation.id}`);
  }
  
  return entries;
};

// ===============================================
// 📊 ОТЧЁТЫ ПО ПРОВОДКАМ
// ===============================================

const getAccountingReport = async (companyId, filters, prisma) => {
  try {
    const { account_code, date_from, date_to, document_type } = filters;

    const whereConditions = {
      company_id: companyId
    };

    if (account_code) {
      whereConditions.OR = [
        { account_debit: account_code },
        { account_credit: account_code }
      ];
    }

    if (date_from && date_to) {
      whereConditions.entry_date = {
        gte: new Date(date_from),
        lte: new Date(date_to)
      };
    }

    if (document_type) {
      whereConditions.document_type = document_type;
    }

    const entries = await prisma.accounting_entries.findMany({
      where: whereConditions,
      include: {
        product: {
          select: { code: true, name: true }
        },
        warehouse: {
          select: { name: true }
        }
      },
      orderBy: {
        entry_date: 'desc'
      }
    });

    // Группируем по счетам для оборотно-сальдовой ведомости
    const accountBalances = {};

    entries.forEach(entry => {
      // Дебетовый оборот
      if (!accountBalances[entry.account_debit]) {
        accountBalances[entry.account_debit] = { 
          account_code: entry.account_debit,
          account_name: LITHUANIAN_CHART_OF_ACCOUNTS[entry.account_debit]?.name || 'Unknown Account',
          debit: 0, 
          credit: 0 
        };
      }
      accountBalances[entry.account_debit].debit += parseFloat(entry.amount);

      // Кредитовый оборот
      if (!accountBalances[entry.account_credit]) {
        accountBalances[entry.account_credit] = { 
          account_code: entry.account_credit,
          account_name: LITHUANIAN_CHART_OF_ACCOUNTS[entry.account_credit]?.name || 'Unknown Account',
          debit: 0, 
          credit: 0 
        };
      }
      accountBalances[entry.account_credit].credit += parseFloat(entry.amount);
    });

    // Рассчитываем сальдо для каждого счёта
    Object.keys(accountBalances).forEach(accountCode => {
      const account = accountBalances[accountCode];
      const accountInfo = LITHUANIAN_CHART_OF_ACCOUNTS[accountCode];
      
      if (accountInfo) {
        // Для активных счетов: сальдо = дебет - кредит
        // Для пассивных счетов: сальдо = кредит - дебет
        if (accountInfo.debit_increase) {
          account.balance = account.debit - account.credit;
        } else {
          account.balance = account.credit - account.debit;
        }
        account.account_type = accountInfo.type;
      } else {
        account.balance = account.debit - account.credit;
        account.account_type = 'UNKNOWN';
      }
    });

    return {
      success: true,
      entries,
      account_balances: Object.values(accountBalances),
      total_entries: entries.length,
      period: { date_from, date_to },
      companyId
    };

  } catch (error) {
    logger.error('Error generating accounting report:', error);
    throw error;
  }
};

// ===============================================
// 🔧 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================================

const validateAccountCode = (accountCode) => {
  return LITHUANIAN_CHART_OF_ACCOUNTS.hasOwnProperty(accountCode);
};

const getAccountInfo = (accountCode) => {
  return LITHUANIAN_CHART_OF_ACCOUNTS[accountCode] || null;
};

const formatAccountingEntry = (entry) => {
  return {
    id: entry.id,
    date: entry.entry_date.toISOString().split('T')[0],
    debit_account: entry.account_debit,
    debit_name: LITHUANIAN_CHART_OF_ACCOUNTS[entry.account_debit]?.name || 'Unknown',
    credit_account: entry.account_credit,
    credit_name: LITHUANIAN_CHART_OF_ACCOUNTS[entry.account_credit]?.name || 'Unknown',
    amount: parseFloat(entry.amount),
    description: entry.description,
    document_type: entry.document_type,
    document_id: entry.document_id
  };
};

// ===============================================
// 📤 ЭКСПОРТ МОДУЛЯ
// ===============================================

module.exports = {
  // Основные функции
  createPurchaseAccountingEntries,
  createSaleAccountingEntries,
  createBankingAccountingEntries,
  getAccountingReport,
  
  // Константы
  LITHUANIAN_CHART_OF_ACCOUNTS,
  
  // Вспомогательные функции
  validateAccountCode,
  getAccountInfo,
  formatAccountingEntry
};