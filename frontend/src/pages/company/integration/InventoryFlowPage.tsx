import React, { useState } from 'react';
import PurchaseWarehouseIntegration from '../../../components/integration/PurchaseWarehouseIntegration';
import SalesWarehouseIntegration from '../../../components/integration/SalesWarehouseIntegration';
import WarehouseInventoryView from '../../../components/integration/WarehouseInventoryView';

const InventoryFlowPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState<'purchase' | 'warehouse' | 'sales'>('purchase');

  const steps = [
    { id: 'purchase', label: 'Покупка', icon: '🛒', description: 'Оприходовать товар' },
    { id: 'warehouse', label: 'Склад', icon: '🏭', description: 'Остатки товаров' },
    { id: 'sales', label: 'Продажа', icon: '💰', description: 'Реализовать товар' }
  ] as const;

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎯 Полный цикл товарооборота
        </h1>
        <p className="text-gray-600">
          Покупка → Склад → Продажа с автоматическим учётом остатков по методу FIFO
        </p>
      </div>

      {/* Степпер */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
                  activeStep === step.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-xl">{step.icon}</span>
              </button>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            {steps.find(s => s.id === activeStep)?.label}
          </h2>
          <p className="text-gray-600">
            {steps.find(s => s.id === activeStep)?.description}
          </p>
        </div>
      </div>

      {/* Контент по шагам */}
      <div className="max-w-6xl mx-auto">
        {activeStep === 'purchase' && (
          <div>
            <PurchaseWarehouseIntegration />
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">
                💡 Как это работает:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Заполните данные о покупке товара</li>
                <li>• Система автоматически создаст приходную накладную</li>
                <li>• Товар будет оприходован на склад с FIFO партией</li>
                <li>• Остатки на складе обновятся автоматически</li>
              </ul>
            </div>
          </div>
        )}

        {activeStep === 'warehouse' && (
          <div>
            <WarehouseInventoryView />
            
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">
                📊 Информация о складе:
              </h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Остатки обновляются в реальном времени</li>
                <li>• FIFO партии показывают очерёдность списания</li>
                <li>• История движений ведётся автоматически</li>
                <li>• Себестоимость рассчитывается по средневзвешенной цене</li>
              </ul>
            </div>
          </div>
        )}

        {activeStep === 'sales' && (
          <div>
            <SalesWarehouseIntegration />
            
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">
                💰 Продажа товаров:
              </h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Выберите товар из доступных на складе</li>
                <li>• Система покажет прибыль от продажи</li>
                <li>• Списание происходит по методу FIFO</li>
                <li>• Остатки на складе уменьшаются автоматически</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Итоговая статистика */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          🎯 Пример полного цикла:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-center">
              <span className="text-2xl block mb-2">🛒</span>
              <h4 className="font-medium text-gray-800 mb-2">1. Покупка</h4>
              <p className="text-sm text-gray-600">
                Купили 10 тонн нефтепродуктов по €800/т
              </p>
              <div className="mt-2 text-lg font-bold text-green-600">
                +10.0 T
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="text-center">
              <span className="text-2xl block mb-2">🏭</span>
              <h4 className="font-medium text-gray-800 mb-2">2. Склад</h4>
              <p className="text-sm text-gray-600">
                На складе: 10 тонн<br/>
                Стоимость: €8,000
              </p>
              <div className="mt-2 text-lg font-bold text-blue-600">
                10.0 T
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="text-center">
              <span className="text-2xl block mb-2">💰</span>
              <h4 className="font-medium text-gray-800 mb-2">3. Продажа</h4>
              <p className="text-sm text-gray-600">
                Продали 5 тонн по €900/т<br/>
                Прибыль: €500
              </p>
              <div className="mt-2 text-lg font-bold text-red-600">
                -5.0 T → 5.0 T
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryFlowPage;
