// 🎯 ЦЕНТРАЛЬНЫЙ INVENTORY STORE
// Управляет остатками товаров и интеграцией между модулями

interface InventoryItem {
  id: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number; // Себестоимость (последняя закупочная цена)
  totalValue: number; // Общая стоимость на складе
  lastUpdated: string;
  batches: InventoryBatch[]; // FIFO партии
}

interface InventoryBatch {
  batchId: string;
  purchaseDate: string;
  quantity: number;
  costPrice: number;
  supplierId?: string;
  supplierName?: string;
  remainingQuantity: number; // Для FIFO
}

interface InventoryMovement {
  id: string;
  type: 'IN' | 'OUT'; // Приход/Расход
  productCode: string;
  quantity: number;
  costPrice: number;
  totalAmount: number;
  date: string;
  documentType: 'PURCHASE' | 'SALE' | 'ADJUSTMENT';
  documentNumber: string;
  description: string;
  batchId?: string;
}

class InventoryStore {
  private inventory: Map<string, InventoryItem> = new Map();
  private movements: InventoryMovement[] = [];

  // 🛒 ПРИХОД ТОВАРА (из Purchases)
  addPurchase(purchase: {
    productCode: string;
    productName: string;
    quantity: number;
    unit: string;
    costPrice: number;
    supplierId: string;
    supplierName: string;
    documentNumber: string;
  }) {
    const batchId = `BATCH-${Date.now()}`;
    const totalAmount = purchase.quantity * purchase.costPrice;

    // Создаём новую партию
    const newBatch: InventoryBatch = {
      batchId,
      purchaseDate: new Date().toISOString(),
      quantity: purchase.quantity,
      costPrice: purchase.costPrice,
      supplierId: purchase.supplierId,
      supplierName: purchase.supplierName,
      remainingQuantity: purchase.quantity
    };

    // Обновляем остатки на складе
    const existing = this.inventory.get(purchase.productCode);
    if (existing) {
      existing.quantity += purchase.quantity;
      existing.totalValue += totalAmount;
      existing.costPrice = this.calculateWeightedAveragePrice(existing);
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
        batches: [newBatch]
      };
      this.inventory.set(purchase.productCode, newItem);
    }

    // Записываем движение
    this.addMovement({
      id: `MOV-${Date.now()}`,
      type: 'IN',
      productCode: purchase.productCode,
      quantity: purchase.quantity,
      costPrice: purchase.costPrice,
      totalAmount,
      date: new Date().toISOString(),
      documentType: 'PURCHASE',
      documentNumber: purchase.documentNumber,
      description: `Приход от ${purchase.supplierName}`,
      batchId
    });

    console.log(`✅ Приход: ${purchase.productName} +${purchase.quantity} ${purchase.unit}`);
    return true;
  }

  // 💰 РАСХОД ТОВАРА (из Sales) с FIFO
  addSale(sale: {
    productCode: string;
    quantity: number;
    salePrice: number;
    customerId: string;
    customerName: string;
    documentNumber: string;
  }) {
    const item = this.inventory.get(sale.productCode);
    if (!item) {
      throw new Error(`Товар ${sale.productCode} не найден на складе`);
    }

    if (item.quantity < sale.quantity) {
      throw new Error(`Недостаточно товара на складе. Доступно: ${item.quantity}, требуется: ${sale.quantity}`);
    }

    // FIFO списание по партиям
    let remainingToSell = sale.quantity;
    let totalCostPrice = 0;
    const usedBatches: string[] = [];

    for (const batch of item.batches) {
      if (remainingToSell <= 0) break;
      
      if (batch.remainingQuantity > 0) {
        const quantityFromBatch = Math.min(batch.remainingQuantity, remainingToSell);
        totalCostPrice += quantityFromBatch * batch.costPrice;
        batch.remainingQuantity -= quantityFromBatch;
        remainingToSell -= quantityFromBatch;
        usedBatches.push(batch.batchId);
        
        if (batch.remainingQuantity === 0) {
          console.log(`📦 Партия ${batch.batchId} полностью реализована`);
        }
      }
    }

    // Обновляем общие остатки
    item.quantity -= sale.quantity;
    item.totalValue -= totalCostPrice;
    item.lastUpdated = new Date().toISOString();

    // Удаляем пустые партии
    item.batches = item.batches.filter(b => b.remainingQuantity > 0);

    // Записываем движение
    this.addMovement({
      id: `MOV-${Date.now()}`,
      type: 'OUT',
      productCode: sale.productCode,
      quantity: sale.quantity,
      costPrice: totalCostPrice / sale.quantity, // Средняя себестоимость по FIFO
      totalAmount: totalCostPrice,
      date: new Date().toISOString(),
      documentType: 'SALE',
      documentNumber: sale.documentNumber,
      description: `Продажа ${sale.customerName}`,
    });

    console.log(`✅ Расход: ${item.productName} -${sale.quantity} ${item.unit}, остаток: ${item.quantity}`);
    
    // Возвращаем данные для учёта прибыли
    return {
      costPrice: totalCostPrice,
      saleAmount: sale.quantity * sale.salePrice,
      profit: (sale.quantity * sale.salePrice) - totalCostPrice,
      usedBatches
    };
  }

  // 📊 ПОЛУЧЕНИЕ ОСТАТКОВ
  getInventory(): InventoryItem[] {
    return Array.from(this.inventory.values());
  }

  getInventoryByProduct(productCode: string): InventoryItem | undefined {
    return this.inventory.get(productCode);
  }

  // 📈 ДВИЖЕНИЯ ПО СКЛАДУ
  getMovements(): InventoryMovement[] {
    return [...this.movements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // 🧮 РАСЧЁТ СРЕДНЕВЗВЕШЕННОЙ ЦЕНЫ
  private calculateWeightedAveragePrice(item: InventoryItem): number {
    if (item.quantity === 0) return 0;
    return item.totalValue / item.quantity;
  }

  // 📝 ДОБАВЛЕНИЕ ДВИЖЕНИЯ
  private addMovement(movement: InventoryMovement) {
    this.movements.push(movement);
    
    // Сохраняем в localStorage для постоянства
    localStorage.setItem('inventory_movements', JSON.stringify(this.movements));
  }

  // 💾 ЗАГРУЗКА ИЗ LOCALSTORAGE
  loadFromStorage() {
    const stored = localStorage.getItem('inventory_movements');
    if (stored) {
      this.movements = JSON.parse(stored);
      // Восстанавливаем inventory из movements
      this.rebuildInventoryFromMovements();
    }
  }

  private rebuildInventoryFromMovements() {
    this.inventory.clear();
    
    for (const movement of this.movements) {
      if (movement.type === 'IN') {
        // Воссоздаём приход
        // TODO: Implement full rebuild logic
      }
    }
  }
}

// Singleton instance
export const inventoryStore = new InventoryStore();

// Загружаем данные при инициализации
inventoryStore.loadFromStorage();

export type { InventoryItem, InventoryMovement, InventoryBatch };
