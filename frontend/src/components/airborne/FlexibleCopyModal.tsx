// =====================================================
// 🎯 FlexibleCopyModal.tsx - Модальное окно гибкого копирования
// Файл: f/src/components/airborne/FlexibleCopyModal.tsx
// =====================================================

import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Zap, Package, DollarSign, CreditCard, Building, AlertCircle } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'purchase_template' | 'sale_template' | 'recent_purchase' | 'recent_sale';
  client: string;
  itemsCount: number;
  firstProduct?: string;
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
  supplier?: { id: number; name: string };
  customer?: { id: number; name: string };
}

interface FlexibleCopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (request: {
    templateId: number;
    templateType: string;
    copyPurchase: boolean;
    copySale: boolean;
    copySupplierPayment: boolean;
    copyCustomerPayment: boolean;
    changes: any;
  }) => Promise<void>;
  templates?: {
    purchases: Template[];
    sales: Template[];
    recentPurchases: Template[];
    recentSales: Template[];
  };
  isLoading?: boolean;
  error?: string | null;
}

const FlexibleCopyModal: React.FC<FlexibleCopyModalProps> = ({
  isOpen,
  onClose,
  onCopy,
  templates = { purchases: [], sales: [], recentPurchases: [], recentSales: [] },
  isLoading = false,
  error = null
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // 🎯 ФЛАГИ КОПИРОВАНИЯ (основное состояние)
  const [flags, setFlags] = useState<FlexibleCopyFlags>({
    copyPurchase: true,        // По умолчанию только приход
    copySale: false,
    copySupplierPayment: false,
    copyCustomerPayment: false
  });

  // 🔧 БЫСТРЫЕ ИЗМЕНЕНИЯ
  const [quickChanges, setQuickChanges] = useState<QuickChanges>({
    quantity: 23,
    pricePerTon: 650,
    supplier: undefined,
    customer: undefined
  });

  // Выбираем первый шаблон по умолчанию
  useEffect(() => {
    if (templates.purchases.length > 0) {
      setSelectedTemplate(templates.purchases[0]);
    } else if (templates.recentPurchases.length > 0) {
      setSelectedTemplate(templates.recentPurchases[0]);
    }
  }, [templates]);

  const handleFlagChange = (flagName: keyof FlexibleCopyFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [flagName]: value }));
  };

  const handleCopy = async () => {
    if (!selectedTemplate) return;
    
    const request = {
      templateId: selectedTemplate.id,
      templateType: selectedTemplate.type.includes('purchase') ? 'purchase' : 'sale',
      ...flags,
      changes: {
        quantity: quickChanges.quantity,
        unit_price: quickChanges.pricePerTon,
        supplier_id: quickChanges.supplier?.id,
        customer_id: quickChanges.customer?.id,
        total_net: quickChanges.quantity * quickChanges.pricePerTon,
        total_gross: quickChanges.quantity * quickChanges.pricePerTon * 1.23 // НДС 23%
      }
    };

    try {
      await onCopy(request);
      onClose();
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const getSelectedCount = () => Object.values(flags).filter(Boolean).length;
  const getTotalValue = () => quickChanges.quantity * quickChanges.pricePerTon * 1.23;

  if (!isOpen) return null;

  // Объединяем все шаблоны для отображения
  const allTemplates = [
    ...templates.purchases.map(t => ({ ...t, category: 'Шаблоны приходов' })),
    ...templates.sales.map(t => ({ ...t, category: 'Шаблоны реализаций' })),
    ...templates.recentPurchases.map(t => ({ ...t, category: 'Последние приходы' })),
    ...templates.recentSales.map(t => ({ ...t, category: 'Последние реализации' }))
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* ЗАГОЛОВОК */}
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
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* ЛЕВАЯ КОЛОНКА - ВЫБОР ШАБЛОНА */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📋 Выберите шаблон для копирования</h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {allTemplates.map((template, index) => {
                const isSelected = selectedTemplate?.id === template.id;
                
                return (
                  <div key={`${template.id}-${index}`}>
                    {/* Заголовок категории */}
                    {(index === 0 || allTemplates[index - 1].category !== template.category) && (
                      <h4 className="text-sm font-medium text-gray-700 mb-2 mt-4 first:mt-0">
                        {template.category}
                      </h4>
                    )}
                    
                    <div
                      onClick={() => setSelectedTemplate(template)}
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

          {/* ПРАВАЯ КОЛОНКА - НАСТРОЙКИ КОПИРОВАНИЯ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">🎯 Что копировать? ({getSelectedCount()} выбрано)</h3>
            
            <div className="space-y-3 mb-6">
              {/* 📦 ПРИХОД */}
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

              {/* 💰 РЕАЛИЗАЦИЯ */}
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

              {/* 💸 ОПЛАТА ПОСТАВЩИКУ */}
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

              {/* 💳 ПОСТУПЛЕНИЕ ОТ ПОКУПАТЕЛЯ */}
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

            {/* БЫСТРЫЕ ИЗМЕНЕНИЯ */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">🔧 Быстрые изменения</h4>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество (тонн)
                  </label>
                  <input
                    type="number"
                    value={quickChanges.quantity}
                    onChange={(e) => setQuickChanges(prev => ({
                      ...prev,
                      quantity: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Цена за тонну (€)
                  </label>
                  <input
                    type="number"
                    value={quickChanges.pricePerTon}
                    onChange={(e) => setQuickChanges(prev => ({
                      ...prev,
                      pricePerTon: parseFloat(e.target.value) || 0
                    }))}
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

            {/* ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР */}
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
                      <span>Реализация на {(quickChanges.quantity * 680 * 1.23).toLocaleString()} €</span>
                    </div>
                  )}
                  {flags.copySupplierPayment && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Оплата ASSET BILANS</span>
                    </div>
                  )}
                  {flags.copyCustomerPayment && (
                    <div className="flex items