import React, { useState } from 'react';
import { inventoryStore } from '../../store/inventoryStore';

interface PurchaseFormData {
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  supplierId: string;
  supplierName: string;
}

const PurchaseWarehouseIntegration: React.FC = () => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    productCode: 'RESIDUES_TECH_OIL',
    productName: 'Residues Technical Oil',
    quantity: 10,
    unit: 'T',
    costPrice: 800,
    supplierId: 'SUP001',
    supplierName: 'OIL SUPPLY LTD'
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Создаём приходную накладную
      const documentNumber = `PUR-${Date.now()}`;
      
      // Обновляем склад через InventoryStore
      inventoryStore.addPurchase({
        ...formData,
        documentNumber
      });

      setResult(`✅ УСПЕШНО! Товар оприходован:
📋 Документ: ${documentNumber}
📦 Товар: ${formData.productName}
📊 Количество: +${formData.quantity} ${formData.unit}
💰 Сумма: €${(formData.quantity * formData.costPrice).toLocaleString()}

🏭 Склад обновлён автоматически!`);

      // Очищаем форму
      setFormData(prev => ({ ...prev, quantity: 0, costPrice: 0 }));

    } catch (error) {
      setResult(`❌ Ошибка: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🛒</span>
        <h2 className="text-xl font-semibold text-gray-800">
          Закупка товара с автооприходованием
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код товара
            </label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Наименование
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
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
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Единица измерения
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="T">Тонны</option>
              <option value="KG">Килограммы</option>
              <option value="L">Литры</option>
              <option value="PCS">Штуки</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена за единицу (€)
            </label>
            <input
              type="number"
              value={formData.costPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поставщик
            </label>
            <input
              type="text"
              value={formData.supplierName}
              onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong>Итого к оплате:</strong> €{(formData.quantity * formData.costPrice).toLocaleString()}
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Обработка...</span>
            </>
          ) : (
            <>
              <span>📦</span>
              <span>Оприходовать товар на склад</span>
            </>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <pre className="text-sm text-blue-800 whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        💡 После оприходования товар автоматически появится на складе с FIFO партиями
      </div>
    </div>
  );
};

export default PurchaseWarehouseIntegration;
