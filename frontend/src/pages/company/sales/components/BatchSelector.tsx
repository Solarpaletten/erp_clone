// 🎯 BatchSelector - Компонент выбора партий товара в продажах
// f/src/pages/company/sales/components/BatchSelector.tsx

import React, { useState, useEffect } from 'react';

interface Batch {
  batch_id: number;
  batch_number: string;
  supplier_id: number;
  supplier_name: string;
  purchase_date: string;
  expiry_date?: string;
  current_quantity: number;
  unit_cost: number;
  total_value: number;
  unit: string;
  warehouse_name: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  unit: string;
  current_stock: number;
}

interface BatchSelectorProps {
  productId: number;
  warehouseId: number;
  requestedQuantity: number;
  onBatchSelection: (allocations: BatchAllocation[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface BatchAllocation {
  batch_id: number;
  batch_number: string;
  supplier_name: string;
  allocated_quantity: number;
  unit_cost: number;
  allocation_value: number;
}

const BatchSelector: React.FC<BatchSelectorProps> = ({
  productId,
  warehouseId,
  requestedQuantity,
  onBatchSelection,
  isOpen,
  onClose
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<BatchAllocation[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [autoAllocated, setAutoAllocated] = useState(false);

  // Загрузка доступных партий
  const fetchAvailableBatches = async () => {
    if (!productId || !warehouseId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const companyId = localStorage.getItem('currentCompanyId');

      const response = await fetch(`/api/company/sales/batches/${productId}/${warehouseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data.batches || []);
        setProduct(data.product);
        setTotalAvailable(data.totalAvailable || 0);
        
        // Автоматическое FIFO размещение
        autoAllocateFIFO(data.batches || []);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Автоматическое FIFO размещение
  const autoAllocateFIFO = (availableBatches: Batch[]) => {
    let remainingQuantity = requestedQuantity;
    const newAllocations: BatchAllocation[] = [];

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const allocatedQty = Math.min(remainingQuantity, batch.current_quantity);
      
      newAllocations.push({
        batch_id: batch.batch_id,
        batch_number: batch.batch_number,
        supplier_name: batch.supplier_name,
        allocated_quantity: allocatedQty,
        unit_cost: batch.unit_cost,
        allocation_value: allocatedQty * batch.unit_cost
      });

      remainingQuantity -= allocatedQty;
    }

    setAllocations(newAllocations);
    setAutoAllocated(true);
  };

  // Ручное изменение размещения
  const updateAllocation = (batchId: number, newQuantity: number) => {
    const batch = batches.find(b => b.batch_id === batchId);
    if (!batch) return;

    const maxQuantity = Math.min(batch.current_quantity, requestedQuantity);
    const clampedQuantity = Math.max(0, Math.min(newQuantity, maxQuantity));

    setAllocations(prev => {
      const existing = prev.find(a => a.batch_id === batchId);
      
      if (existing) {
        if (clampedQuantity === 0) {
          return prev.filter(a => a.batch_id !== batchId);
        } else {
          return prev.map(a => 
            a.batch_id === batchId 
              ? {
                  ...a,
                  allocated_quantity: clampedQuantity,
                  allocation_value: clampedQuantity * batch.unit_cost
                }
              : a
          );
        }
      } else if (clampedQuantity > 0) {
        return [...prev, {
          batch_id: batchId,
          batch_number: batch.batch_number,
          supplier_name: batch.supplier_name,
          allocated_quantity: clampedQuantity,
          unit_cost: batch.unit_cost,
          allocation_value: clampedQuantity * batch.unit_cost
        }];
      }
      
      return prev;
    });
    setAutoAllocated(false);
  };

  // Расчёты
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_quantity, 0);
  const isFullyAllocated = totalAllocated === requestedQuantity;
  const weightedAverageCost = allocations.length > 0 
    ? allocations.reduce((sum, a) => sum + a.allocation_value, 0) / totalAllocated 
    : 0;

  useEffect(() => {
    if (isOpen && productId && warehouseId) {
      fetchAvailableBatches();
    }
  }, [isOpen, productId, warehouseId]);

  const handleConfirm = () => {
    if (isFullyAllocated) {
      onBatchSelection(allocations);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">📦 Выбор партий товара</h3>
              {product && (
                <p className="text-blue-100 text-sm">
                  {product.code} - {product.name} | Требуется: {requestedQuantity} {product.unit}
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {loading ? (
            <div className="text-center py-8">
              <div className="spinner border-blue-600 border-4 border-t-transparent rounded-full w-8 h-8 mx-auto animate-spin"></div>
              <p className="mt-2 text-gray-600">Загружаем партии...</p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{batches.length}</div>
                    <div className="text-sm text-gray-600">Доступных партий</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalAvailable.toFixed(3)}</div>
                    <div className="text-sm text-gray-600">Общий остаток</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${isFullyAllocated ? 'text-green-600' : 'text-red-600'}`}>
                      {totalAllocated.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600">Размещено</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      €{weightedAverageCost.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Средняя себестоимость</div>
                  </div>
                </div>
              </div>

              {/* Batch Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">Партия</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">Поставщик</th>
                      <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium">Дата поступления</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium">Доступно</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium">Себестоимость</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium">Размещение</th>
                      <th className="border border-gray-200 px-3 py-2 text-right text-sm font-medium">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch, index) => {
                      const allocation = allocations.find(a => a.batch_id === batch.batch_id);
                      const allocatedQty = allocation?.allocated_quantity || 0;
                      
                      return (
                        <tr key={batch.batch_id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border border-gray-200 px-3 py-2">
                            <div className="font-medium text-sm">{batch.batch_number}</div>
                            {batch.expiry_date && (
                              <div className="text-xs text-gray-500">Срок: {batch.expiry_date}</div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <div className="text-sm">{batch.supplier_name}</div>
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">
                            {batch.purchase_date}
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-right">
                            <span className="font-medium">{batch.current_quantity.toFixed(3)}</span>
                            <span className="text-gray-500 ml-1">{batch.unit}</span>
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                            €{batch.unit_cost.toFixed(2)}
                          </td>
                          <td className="border border-gray-200 px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              max={Math.min(batch.current_quantity, requestedQuantity)}
                              step="0.001"
                              value={allocatedQty}
                              onChange={(e) => updateAllocation(batch.batch_id, parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-right text-sm"
                              placeholder="0.000"
                            />
                          </td>
                          <td className="border border-gray-200 px-3 py-2 text-right font-medium">
                            €{(allocatedQty * batch.unit_cost).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Allocation Summary */}
              {allocations.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📋 Размещение по партиям:</h4>
                  <div className="space-y-2">
                    {allocations.map(allocation => (
                      <div key={allocation.batch_id} className="flex justify-between items-center text-sm">
                        <span className="text-blue-700">
                          {allocation.batch_number} ({allocation.supplier_name})
                        </span>
                        <span className="font-medium">
                          {allocation.allocated_quantity.toFixed(3)} × €{allocation.unit_cost.toFixed(2)} = 
                          <span className="text-blue-800 ml-1">€{allocation.allocation_value.toFixed(2)}</span>
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold text-blue-800">
                      <span>Итого:</span>
                      <span>
                        {totalAllocated.toFixed(3)} {product?.unit} = €{allocations.reduce((sum, a) => sum + a.allocation_value, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {totalAvailable < requestedQuantity && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm">
                    ⚠️ Недостаточно товара на складе! 
                    Требуется: {requestedQuantity}, доступно: {totalAvailable.toFixed(3)}
                  </div>
                </div>
              )}

              {!isFullyAllocated && totalAvailable >= requestedQuantity && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-yellow-800 text-sm">
                    💡 Не всё количество размещено. 
                    Осталось разместить: {(requestedQuantity - totalAllocated).toFixed(3)} {product?.unit}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => autoAllocateFIFO(batches)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
            >
              🔄 Авто FIFO
            </button>
            <button
              onClick={() => setAllocations([])}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
            >
              🗑️ Очистить
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFullyAllocated}
              className={`px-6 py-2 rounded text-sm font-medium ${
                isFullyAllocated
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ✅ Подтвердить размещение
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BatchSelector;