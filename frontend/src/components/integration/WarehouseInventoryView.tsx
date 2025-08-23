import React, { useState, useEffect } from 'react';
import { inventoryStore, InventoryItem, InventoryMovement } from '../../store/inventoryStore';

const WarehouseInventoryView: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');

  const refreshData = () => {
    setInventory(inventoryStore.getInventory());
    setMovements(inventoryStore.getMovements());
  };

  useEffect(() => {
    refreshData();
    // Обновляем каждые 2 секунды
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🏭</span>
          <h2 className="text-xl font-semibold text-gray-800">
            Склад - Остатки и движения
          </h2>
        </div>
        <button
          onClick={refreshData}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Обновить</span>
        </button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
          <div className="text-sm text-blue-800">Наименований</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            €{totalInventoryValue.toLocaleString()}
          </div>
          <div className="text-sm text-green-800">Общая стоимость</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{movements.length}</div>
          <div className="text-sm text-purple-800">Движений</div>
        </div>
      </div>

      {/* Переключатель табов */}
      <div className="flex mb-4 border-b">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'inventory'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Остатки на складе
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 font-medium ml-4 ${
            activeTab === 'movements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📋 Движения товаров
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div>
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📦</span>
              <p>Склад пуст</p>
              <p className="text-sm">Оприходуйте товар через Закупки</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Остаток
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Себестоимость
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Общая стоимость
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Партии FIFO
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.productCode} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.productName}
                          </div>
                          <div className="text-xs text-gray-500">{item.productCode}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {item.quantity} {item.unit}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          €{item.costPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          €{item.totalValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs">
                          {item.batches.map((batch, idx) => (
                            <div key={batch.batchId} className="mb-1">
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {batch.remainingQuantity} {item.unit} @ €{batch.costPrice}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <span className="text-4xl block mb-2">📋</span>
              <p>Нет движений товаров</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Количество
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Документ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(movement.date).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            movement.type === 'IN'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {movement.type === 'IN' ? '📈 Приход' : '📉 Расход'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{movement.productCode}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`text-sm font-medium ${
                            movement.type === 'IN' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {movement.type === 'IN' ? '+' : '-'}
                          {movement.quantity}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          €{movement.totalAmount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm text-gray-900">{movement.documentNumber}</div>
                          <div className="text-xs text-gray-500">{movement.description}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 text-center">
        🔄 Данные обновляются автоматически каждые 2 секунды
      </div>
    </div>
  );
};

export default WarehouseInventoryView;
