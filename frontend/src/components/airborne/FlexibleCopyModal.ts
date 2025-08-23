// =====================================================
// 🎯 FlexibleCopyModal.tsx - Исправленная версия без ошибок TypeScript
// Файл: f/src/components/airborne/FlexibleCopyModal.tsx
// =====================================================

import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Zap, Package, DollarSign, CreditCard, Building, AlertCircle } from 'lucide-react';

// =====================================================
// 🔧 ИСПРАВЛЕННЫЕ ТИПЫ
// =====================================================

interface Template {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'purchase_template' | 'sale_template' | 'recent_purchase' | 'recent_sale';
  client: string;
  itemsCount: number;
  firstProduct?: string;
  category?: string;
}

interface FlexibleCopyFlags {
  copyPurchase: boolean;
  copySale: boolean;
  copySupplierPayment: boolean;
  copyCustomerPayment: boolean;
}

interface QuickChanges {
  quantity: number;
  pricePerTon: number;
}

interface CopyRequest {
  templateId: number;
  templateType: 'purchase' | 'sale';
  copyPurchase: boolean;
  copySale: boolean;
  copySupplierPayment: boolean;
  copyCustomerPayment: boolean;
  changes: {
    quantity: number;
    unit_price: number;
    total_gross: number;
  };
}

interface FlexibleCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (request: CopyRequest) => Promise<void>;
  templates?: {
    purchases: Template[];
    sales: Template[];
    recentPurchases: Template[];
    recentSales: Template[];
  };
  isLoading?: boolean;
  error?: string | null;
}

// =====================================================
// 🎯 КОМПОНЕНТ МОДАЛЬНОГО ОКНА
// =====================================================

const FlexibleCopyModal: React.FC<FlexibleCopyModalProps> = ({
  isOpen,
  onClose,
  onCopy,
  templates,
  isLoading = false,
  error = null
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [flags, setFlags] = useState<FlexibleCopyFlags>({
    copyPurchase: true,
    copySale: false,
    copySupplierPayment: false,
    copyCustomerPayment: false
  });

  const [quickChanges, setQuickChanges] = useState<QuickChanges>({
    quantity: 23,
    pricePerTon: 650
  });

  // Mock templates для демонстрации
  const mockTemplates: Template[] = [
    {
      id: 1,
      name: 'TEMPLATE-PURCHASE-001 - ASSET BILANS SPOLKA Z O O',
      amount: 18388.50,
      date: '2025-08-20',
      type: 'purchase_template',
      client: 'ASSET BILANS SPOLKA Z O O',
      itemsCount: 1,
      firstProduct: 'Residues technical rapeseed oil',
      category: 'Шаблоны приходов'
    },
    {
      id: 2,
      name: 'PUR-2025-000123 - ASSET BILANS SPOLKA Z O O',
      amount: 18388.50,
      date: '2025-08-22',
      type: 'recent_purchase',
      client: 'ASSET BILANS SPOLKA Z O O',
      itemsCount: 1,
      firstProduct: 'Residues technical rapeseed oil',
      category: 'Последние приходы'
    },
    {
      id: 3,
      name: 'TEMPLATE-SALE-001 - SWAPOIL GMBH',
      amount: 19237.20,
      date: '2025-08-20',
      type: 'sale_template',
      client: 'SWAPOIL GMBH',
      itemsCount: 1,
      firstProduct: 'Residues technical rapeseed oil',
      category: 'Шаблоны реализаций'
    }
  ];

  // Инициализация выбранного шаблона
  useEffect(() => {
    if (mockTemplates.length > 0) {
      setSelectedTemplate(mockTemplates[0]);
    }
  }, []);

  // Обработчики событий
  const handleFlagChange = (flagName: keyof FlexibleCopyFlags, value: boolean): void => {
    setFlags(prev => ({ ...prev, [flagName]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value) || 0;
    setQuickChanges(prev => ({ ...prev, quantity: value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value) || 0;
    setQuickChanges(prev => ({ ...prev, pricePerTon: value }));
  };

  const handleCopy = async (): Promise<void> => {
    if (!selectedTemplate) return;
    
    const request: CopyRequest = {
      templateId: selectedTemplate.id,
      templateType: selectedTemplate.type.includes('purchase') ? 'purchase' : 'sale',
      copyPurchase: flags.copyPurchase,
      copySale: flags.copySale,
      copySupplierPayment: flags.copySupplierPayment,
      copyCustomerPayment: flags.copyCustomerPayment,
      changes: {
        quantity: quickChanges.quantity,
        unit_price: quickChanges.pricePerTon,
        total_gross: quickChanges.quantity * quickChanges.pricePerTon * 1.23
      }
    };

    try {
      await onCopy(request);
      onClose();
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Вспомогательные функции
  const getSelectedCount = (): number => {
    return Object.values(flags).filter(Boolean).length;
  };

  const getTotalValue = (): number => {
    return Math.round(quickChanges.quantity * quickChanges.pricePerTon * 1.23 * 100) / 100;
  };

  const handleTemplateSelect = (template: Template): void => {
    setSelectedTemplate(template);
  };

  const handleCloseClick = (): void => {
    onClose();
  };

  // Если модальное окно закрыто, не рендерим ничего
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Гибкое копирование</h2>
              <p className="text-gray-600">Выберите что нужно скопировать • SWAPOIL Oil Trading</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseClick}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Левая колонка - Выбор шаблона */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📋 Выберите шаблон для копирования</h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {mockTemplates.map((template, index) => {
                const isSelected = selectedTemplate?.id === template.id;
                const isFirstInCategory = index === 0 || 
                  (mockTemplates[index - 1] && mockTemplates[index - 1].category !== template.category);
                
                return (
                  <div key={template.id}>
                    {isFirstInCategory && template.category && (
                      <h4 className="text-sm font-medium text-gray-700 mb-2 mt-4 first:mt-0">
                        {template.category}
                      </h4>
                    )}
                    
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleTemplateSelect(template)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleTemplateSelect(template);
                        }
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {template.date} • {template.itemsCount} позиций
                          </div>
                          {template.firstProduct && (
                            <div className="text-xs text-gray-500 mt-1">
                              {template.firstProduct}
                            </div>
                          )}
                        </div>
                        <div className={`text-lg font-bold ml-3 ${
                          isSelected ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {template.amount.toLocaleString()} €
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <Check className="w-4 h-4" />
                            <span>Выбрано для копирования</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правая колонка - Настройки копирования */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              🎯 Что копировать? ({getSelectedCount()} выбрано)
            </h3>
            
            <div className="space-y-3 mb-6">
              {/* Приход товара */}
              <div className={`p-4 rounded-lg border-2 transition-colors ${
                flags.copyPurchase 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags.copyPurchase}
                    onChange={(e) => handleFlagChange('copyPurchase', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Приход товара</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Создать документ поступления нефтепродуктов на склад
                    </p>
                    <div className="text-sm font-medium text-blue-600 mt-2">
                      {quickChanges.quantity} т × {quickChanges.pricePerTon} € = {(quickChanges.quantity * quickChanges.pricePerTon).toLocaleString()} € + НДС
                    </div>
                  </div>
                </label>
              </div>

              {/* Реализация */}
              <div className={`p-4 rounded-lg border-2 transition-colors ${
                flags.copySale 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags.copySale}
                    onChange={(e) => handleFlagChange('copySale', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mt-1"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Реализация</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Создать документ продажи нефтепродуктов
                    </p>
                    <div className="text-sm font-medium text-green-600 mt-2">
                      {quickChanges.quantity} т × 680 € = {(quickChanges.quantity * 680).toLocaleString()} € + НДС
                    </div>
                  </div>
                </label>
              </div>

              {/* Оплата поставщику */}
              <div className={`p-3 rounded-lg border transition-colors ${
                flags.copySupplierPayment 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags.copySupplierPayment}
                    onChange={(e) => handleFlagChange('copySupplierPayment', e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm">Оплата ASSET BILANS</span>
                  </div>
                </label>
              </div>

              {/* Поступление от покупателя */}
              <div className={`p-3 rounded-lg border transition-colors ${
                flags.copyCustomerPayment 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags.copyCustomerPayment}
                    onChange={(e) => handleFlagChange('copyCustomerPayment', e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-sm">Поступление SWAPOIL GMBH</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Быстрые изменения */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">🔧 Быстрые изменения</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Количество (тонн)
                  </label>
                  <input
                    id="quantity-input"
                    type="number"
                    value={quickChanges.quantity}
                    onChange={handleQuantityChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="price-input" className="block text-sm font-medium text-gray-700 mb-1">
                    Цена за тонну (€)
                  </label>
                  <input
                    id="price-input"
                    type="number"
                    value={quickChanges.pricePerTon}
                    onChange={handlePriceChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">Общая сумма с НДС 23%:</span>
                  <span className="text-lg font-bold text-green-600">
                    {getTotalValue().toLocaleString()} €
                  </span>
                </div>
              </div>
            </div>

            {/* Предварительный просмотр */}
            {getSelectedCount() > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">📋 Будет создано:</h4>
                <div className="space-y-2 text-sm">
                  {flags.copyPurchase && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Приход на {getTotalValue().toLocaleString()} €</span>
                    </div>
                  )}
                  {flags.copySale && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Реализация на {Math.round(quickChanges.quantity * 680 * 1.23 * 100) / 100} €</span>
                    </div>
                  )}
                  {flags.copySupplierPayment && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Оплата ASSET BILANS</span>
                    </div>
                  )}
                  {flags.copyCustomerPayment && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Поступление SWAPOIL GMBH</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Экономия времени:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {getSelectedCount() * 5} минут
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Сообщение об ошибке */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Нижняя панель с кнопками */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCloseClick}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            
            <button
              type="button"
              onClick={handleCopy}
              disabled={getSelectedCount() === 0 || isLoading || !selectedTemplate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Копирование...</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Скопировать ({getSelectedCount()}) • {getSelectedCount() * 5} мин экономии</span>
                </>
              )}
            </button>
          </div>
          
          {selectedTemplate && (
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Источник: <span className="font-medium">{selectedTemplate.name}</span> • 
                Документов: {getSelectedCount()} • 
                Время: ~10 секунд
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlexibleCopyModal;