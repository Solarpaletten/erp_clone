// 🎯 INVENTORY STORE С ИНТЕГРАЦИЕЙ ПЛАНА СЧЕТОВ
// Каждый товар привязывается к счёту плана счетов

interface InventoryItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  totalValue: number;
  lastUpdated: string;
  
  // 🔗 ПРИВЯЗКА К ПЛАНУ СЧЕТОВ
  inventoryAccount: string;  // Счёт товаров (203, 2040, etc.)
  accountName: string;       // Название счёта
  
  batches: InventoryBatch[];
}

interface InventoryBatch {
  batchId: string;
  purchaseDate: string;
  quantity: number;
  costPrice: number;
  supplierId?: string;
  supplierName?: string;
  remainingQuantity: number;
}

interface AccountingEntry {
  id: string;
  date: string;
  debitAccount: string;
  debitAccountName: string;
  creditAccount: string;
  creditAccountName: string;
  amount: number;
  description: string;
  documentType: 'PURCHASE' | 'SALE';
  documentNumber: string;
  productCode?: string;
}

// 🇱🇹 ПЛАН СЧЕТОВ ЛИТВЫ (расширенный)
export const LITHUANIAN_ACCOUNTS = {
  // Товары (класс 2)
  '2030': { name: 'Сырьё и материалы', type: 'ASSET' },
  '2040': { name: 'Товары для перепродажи', type: 'ASSET' },
  '2041': { name: 'Нефтепродукты', type: 'ASSET' },
  '2042': { name: 'Химические товары', type: 'ASSET' },
  '2043': { name: 'Строительные материалы', type: 'ASSET' },
  
  // Дебиторы/Кредиторы
  '2410': { name: 'Дебиторская задолженность покупателей', type: 'ASSET' },
  '4430': { name: 'Кредиторская задолженность поставщикам', type: 'LIABILITY' },
  
  // Банк
  '2710': { name: 'Банковские счета', type: 'ASSET' },
  
  // Доходы/Расходы
  '6001': { name: 'Себестоимость продаж', type: 'EXPENSE' },
  '7001': { name: 'Выручка от продаж', type: 'INCOME' }
};

class InventoryWithAccountsStore {
  private inventory: Map<string, InventoryItem> = new Map();
  private accountingEntries: AccountingEntry[] = [];

  // 🛒 ПРИХОД ТОВАРА С ПРИВЯЗКОЙ К СЧЁТУ
  addPurchaseWithAccount(purchase: {
    productCode: string;
    productName: string;
    quantity: number;
    unit: string;
    costPrice: number;
    supplierId: string;
    supplierName: string;
    documentNumber: string;
    inventoryAccount: string;  // ← СЧЁТ ТОВАРОВ!
    payableAccount: string;
  }) {
    const batchId = `BATCH-${Date.now()}`;
    const totalAmount = purchase.quantity * purchase.costPrice;

    // Создаём партию
    const newBatch: InventoryBatch = {
      batchId,
      purchaseDate: new Date().toISOString(),
      quantity: purchase.quantity,
      costPrice: purchase.costPrice,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      remainingQuantity: purchase.quantity
    };

    // Обновляем остатки
    const existing = this.inventory.get(purchase.productCode);
    if (existing) {
      existing.quantity += purchase.quantity;
      existing.totalValue += totalAmount;
      existing.costPrice = existing.totalValue / existing.quantity; // Средневзвешенная
      existing.batches.push(newBatch);
      existing.lastUpdated = new Date().toISOString();
    } else {
      const newItem: InventoryItem = {
        id: `INV-${purchase.productCode}`,
        productCode: purchase.productCode,
        productName: purchase.productName,
        quantity: purchase.quantity,
        unit: purchase.unit,
        costPrice: purchase.costPrice,
        totalValue: totalAmount,
        lastUpdated: new Date().toISOString(),
        inventoryAccount: purchase.inventoryAccount,  // ← ПРИВЯЗКА К СЧЁТУ!
        accountName: LITHUANIAN_ACCOUNTS[purchase.inventoryAccount]?.name || 'Неизвестный счёт',
        batches: [newBatch]
      };
      this.inventory.set(purchase.productCode, newItem);
    }

    // Создаём проводку
    this.addAccountingEntry({
      id: `ACC-${Date.now()}`,
      date: new Date().toISOString(),
      debitAccount: purchase.inventoryAccount,
      debitAccountName: LITHUANIAN_ACCOUNTS[purchase.inventoryAccount]?.name || '',
      creditAccount: purchase.payableAccount,
      creditAccountName: LITHUANIAN_ACCOUNTS[purchase.payableAccount]?.name || '',
      amount: totalAmount,
      description: `Приход товара: ${purchase.productName} от ${purchase.supplierName}`,
      documentType: 'PURCHASE',
      documentNumber: purchase.documentNumber,
      productCode: purchase.productCode
    });

    this.saveToStorage();
    return { success: true, batchId, totalAmount };
  }

  // 💰 ПРОДАЖА ТОВАРА (FIFO + проводки)
  addSaleWithAccounting(sale: {
    productCode: string;
    quantity: number;
    salePrice: number;
    customerId: string;
    customerName: string;
    documentNumber: string;
    cogsAccount?: string;       // Себестоимость
    revenueAccount?: string;    // Выручка
    receivableAccount?: string; // Дебиторка
  }) {
    const item = this.inventory.get(sale.productCode);
    if (!item) {
      throw new Error(`Товар ${sale.productCode} не найден на складе`);
    }

    if (item.quantity < sale.quantity) {
      throw new Error(`Недостаточно товара. Доступно: ${item.quantity}, требуется: ${sale.quantity}`);
    }

    // FIFO списание
    let remainingToSell = sale.quantity;
    let totalCostPrice = 0;

    for (const batch of item.batches) {
      if (remainingToSell <= 0) break;
      
      if (batch.remainingQuantity > 0) {
        const quantityFromBatch = Math.min(batch.remainingQuantity, remainingToSell);
        totalCostPrice += quantityFromBatch * batch.costPrice;
        batch.remainingQuantity -= quantityFromBatch;
        remainingToSell -= quantityFromBatch;
      }
    }

    // Обновляем остатки
    item.quantity -= sale.quantity;
    item.totalValue -= totalCostPrice;
    item.lastUpdated = new Date().toISOString();
    item.batches = item.batches.filter(b => b.remainingQuantity > 0);

    const saleAmount = sale.quantity * sale.salePrice;
    const profit = saleAmount - totalCostPrice;

    // Проводка 1: Dт Себестоимость Кт Товары
    this.addAccountingEntry({
      id: `ACC-${Date.now()}-1`,
      date: new Date().toISOString(),
      debitAccount: sale.cogsAccount || '6001',
      debitAccountName: LITHUANIAN_ACCOUNTS[sale.cogsAccount || '6001']?.name || '',
      creditAccount: item.inventoryAccount,
      creditAccountName: item.accountName,
      amount: totalCostPrice,
      description: `Себестоимость продажи: ${item.productName}`,
      documentType: 'SALE',
      documentNumber: sale.documentNumber,
      productCode: sale.productCode
    });

    // Проводка 2: Dт Дебиторка Кт Выручка
    this.addAccountingEntry({
      id: `ACC-${Date.now()}-2`,
      date: new Date().toISOString(),
      debitAccount: sale.receivableAccount || '2410',
      debitAccountName: LITHUANIAN_ACCOUNTS[sale.receivableAccount || '2410']?.name || '',
      creditAccount: sale.revenueAccount || '7001',
      creditAccountName: LITHUANIAN_ACCOUNTS[sale.revenueAccount || '7001']?.name || '',
      amount: saleAmount,
      description: `Выручка от продажи: ${sale.customerName}`,
      documentType: 'SALE',
      documentNumber: sale.documentNumber,
      productCode: sale.productCode
    });

    this.saveToStorage();

    return {
      costPrice: totalCostPrice,
      saleAmount,
      profit,
      remainingStock: item.quantity
    };
  }

  // 📊 ПОЛУЧЕНИЕ ДАННЫХ
  getInventory(): InventoryItem[] {
    return Array.from(this.inventory.values()).sort((a, b) => a.productName.localeCompare(b.productName));
  }

  getInventoryByProduct(productCode: string): InventoryItem | undefined {
    return this.inventory.get(productCode);
  }

  getAccountingEntries(): AccountingEntry[] {
    return [...this.accountingEntries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // 📈 ОБОРОТНО-САЛЬДОВАЯ ВЕДОМОСТЬ ПО СЧЕТАМ
  getAccountBalances(): Record<string, { debit: number; credit: number; balance: number; name: string }> {
    const balances: Record<string, { debit: number; credit: number; balance: number; name: string }> = {};
    
    // Инициализируем счета
    Object.keys(LITHUANIAN_ACCOUNTS).forEach(account => {
      balances[account] = {
        debit: 0,
        credit: 0,
        balance: 0,
        name: LITHUANIAN_ACCOUNTS[account].name
      };
    });
    
    // Считаем обороты
    this.accountingEntries.forEach(entry => {
      if (balances[entry.debitAccount]) {
        balances[entry.debitAccount].debit += entry.amount;
      }
      if (balances[entry.creditAccount]) {
        balances[entry.creditAccount].credit += entry.amount;
      }
    });
    
    // Считаем сальдо (активы: дебет+, пассивы: кредит+)
    Object.keys(balances).forEach(account => {
      const accountInfo = LITHUANIAN_ACCOUNTS[account];
      if (accountInfo.type === 'ASSET' || accountInfo.type === 'EXPENSE') {
        balances[account].balance = balances[account].debit - balances[account].credit;
      } else {
        balances[account].balance = balances[account].credit - balances[account].debit;
      }
    });
    
    return balances;
  }

  private addAccountingEntry(entry: AccountingEntry) {
    this.accountingEntries.push(entry);
  }

  private saveToStorage() {
    try {
      localStorage.setItem('inventory_with_accounts', JSON.stringify({
        inventory: Array.from(this.inventory.entries()),
        accountingEntries: this.accountingEntries
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem('inventory_with_accounts');
      if (data) {
        const parsed = JSON.parse(data);
        this.inventory = new Map(parsed.inventory || []);
        this.accountingEntries = parsed.accountingEntries || [];
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
}

// Экспортируем единственный экземпляр
const inventoryWithAccountsStore = new InventoryWithAccountsStore();
inventoryWithAccountsStore.loadFromStorage();

export { inventoryWithAccountsStore };
