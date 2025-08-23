import React, { useState, useEffect } from 'react';
import { inventoryStore, InventoryItem } from '../../store/inventoryStore';

interface SaleFormData {
  productCode: string;
  quantity: number;
  salePrice: number;
  customerId: string;
  customerName: string;
}

const SalesWarehouseIntegration: React.FC = () => {
  const [availableProducts, setAvailableProducts] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState<SaleFormData>({
    productCode: '',
    quantity: 5,
    salePrice: 900,
    customerId: 'CUS001',
    customerName: 'ENERGY SOLUTIONS LTD'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    // Загружаем доступные товары со склада
    setAvailableProducts(inventoryStore.getInventory());
  }, []);

  const selectedProduct = availableProducts.find(p => p.productCode === formData.productCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Создаём расходную накладную
      const documentNumber = `SAL-${Date.now()}`;
      
      // Списываем со склада через InventoryStore (FIFO)
      const saleResult = inventoryStore.addSale({
        ...formData,
        documentNumber
      });

      setResult(`✅ УСПЕШНО! Товар реализован:
📋 Документ: ${documentNumber}
📦 Товар: ${selectedProduct?.productName}
📊 Количество: -${formData.quantity} ${selectedProduct?.unit}
💰 Выручка: €${(formData.quantity * formData.salePrice).toLocaleString()}
💸 Себестоимость: €${saleResult.costPrice.toLocaleString()}
💎 Прибыль: €${saleResult.profit.toLocaleString()}

🏭 Склад обновлён автоматически! (FIFO списание)
🔍 Остаток: ${inventoryStore.getInventoryByProduct(formData.productCode)?.quantity || 0} ${selectedProduct?.unit}`);

      // Обновляем список товаров
      setAvailableProducts(inventoryStore.getInventory());

      // Очищаем форму
      setFormData(prev => ({ ...prev, quantity: 0, salePrice: 0 }));

    } catch (error) {
      setResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">💰</span>
        <h2 className="text-xl font-semibold text-gray-800">
          Продажа товара с автосписанием
        </h2>
      </div>

      {availableProducts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">📦</span>
          <p>Нет товаров на складе</p>
          <p className="text-sm">Сначала оприходуйте товар через Закупки</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Товар
              </label>
              <select
                value={formData.productCode}
                onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите товар</option>
                {availableProducts.map(product => (
                  <option key={product.productCode} value={product.productCode}>
                    {product.productName} (остаток: {product.quantity} {product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max={selectedProduct?.quantity || 0}
                step="0.01"
                required
              />
              {selectedProduct && (
                <div className="text-xs text-gray-500 mt-1">
                  Доступно: {selectedProduct.quantity} {selectedProduct.unit}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена продажи (€)
              </label>
              <input
                type="number"
                value={formData.salePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Покупатель
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Выручка:</strong> €{(formData.quantity * formData.salePrice).toLocaleString()}
                </div>
                <div>
                  <strong>Себестоимость:</strong> €{(formData.quantity * selectedProduct.costPrice).toLocaleString()}
                </div>
                <div className="text-green-600">
                  <strong>Прибыль:</strong> €{((formData.quantity * formData.salePrice) - (formData.quantity * selectedProduct.costPrice)).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || !selectedProduct}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Обработка...</span>
              </>
            ) : (
              <>
                <span>💰</span>
                <span>Списать товар со склада</span>
              </>
            )}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <pre className="text-sm text-blue-800 whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        💡 Списание происходит по методу FIFO (первый пришёл - первый ушёл)
      </div>
    </div>
  );
};

export default SalesWarehouseIntegration;
