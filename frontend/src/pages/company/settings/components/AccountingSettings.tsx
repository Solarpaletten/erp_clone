// 🎯 НАСТРОЙКИ УЧЁТА - ПРОСТОЙ ИНТЕРФЕЙС КАК В B1.LT
// f/src/pages/company/settings/components/AccountingSettings.tsx

import React, { useState, useEffect } from 'react';

interface AccountingSetting {
  id: string;
  name: string;
  description: string;
  account_code: string;
  category: 'SUPPLIERS' | 'CUSTOMERS' | 'VAT' | 'BANK' | 'INVENTORY';
  is_editable: boolean;
}

const AccountingSettings: React.FC = () => {
  const [settings, setSettings] = useState<AccountingSetting[]>([]);
  const [loading, setLoading] = useState(false);

  // Загрузка настроек учёта
  useEffect(() => {
    const defaultSettings: AccountingSetting[] = [
      {
        id: 'suppliers_payable',
        name: 'Поставщики',
        description: 'Счёт для учёта долгов перед поставщиками',
        account_code: '4430',
        category: 'SUPPLIERS',
        is_editable: true
      },
      {
        id: 'customers_receivable', 
        name: 'Покупатели',
        description: 'Счёт для учёта долгов покупателей перед вами',
        account_code: '2410',
        category: 'CUSTOMERS',
        is_editable: true
      },
      {
        id: 'vat_payable',
        name: 'НДС к доплате (PVM)',
        description: 'Счёт для учёта НДС, который нужно доплатить государству',
        account_code: '4492',
        category: 'VAT',
        is_editable: true
      },
      {
        id: 'bank_accounts',
        name: 'Банковские счета',
        description: 'Счёт для учёта денежных средств на банковских счетах',
        account_code: '2710',
        category: 'BANK',
        is_editable: true
      },
      {
        id: 'inventory',
        name: 'Товары на складе',
        description: 'Счёт для учёта стоимости товаров на ваших складах',
        account_code: '2040',
        category: 'INVENTORY',
        is_editable: true
      }
    ];

    setSettings(defaultSettings);
  }, []);

  const handleAccountChange = (settingId: string, newAccountCode: string) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId 
        ? { ...setting, account_code: newAccountCode }
        : setting
    ));
  };

  const saveSetting = async (setting: AccountingSetting) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const companyId = localStorage.getItem('currentCompanyId');

      const response = await fetch('/api/company/settings/accounting', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          setting_id: setting.id,
          account_code: setting.account_code
        })
      });

      if (response.ok) {
        // Показываем успех
        console.log(`✅ Настройка "${setting.name}" сохранена`);
      }
    } catch (error) {
      console.error('Ошибка сохранения настройки:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SUPPLIERS': return '🚛';
      case 'CUSTOMERS': return '👥';  
      case 'VAT': return '📋';
      case 'BANK': return '🏦';
      case 'INVENTORY': return '📦';
      default: return '⚙️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SUPPLIERS': return 'bg-orange-50 border-orange-200';
      case 'CUSTOMERS': return 'bg-blue-50 border-blue-200';
      case 'VAT': return 'bg-red-50 border-red-200';
      case 'BANK': return 'bg-green-50 border-green-200';
      case 'INVENTORY': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ⚙️ Настройки учёта
        </h1>
        <p className="text-gray-600">
          Укажите какие счета использовать для автоматического ведения учёта. 
          Система будет автоматически создавать бухгалтерские проводки при работе с товарами.
        </p>
      </div>

      {/* Предупреждение */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="text-yellow-600 text-xl mr-3">⚠️</div>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">Важно!</h3>
            <p className="text-yellow-700 text-sm">
              Эти настройки влияют на автоматическое создание бухгалтерских проводок. 
              Если вы не уверены в правильности счетов, обратитесь к вашему бухгалтеру.
            </p>
          </div>
        </div>
      </div>

      {/* Настройки */}
      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className={`border rounded-lg p-6 ${getCategoryColor(setting.category)}`}
          >
            <div className="flex items-start justify-between">
              
              {/* Левая часть - описание */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-2xl">
                  {getCategoryIcon(setting.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {setting.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {setting.description}
                  </p>
                  
                  {/* Примеры операций */}
                  <div className="text-xs text-gray-500">
                    {setting.category === 'SUPPLIERS' && (
                      <span>💡 Используется при: покупке товаров, оплате поставщикам</span>
                    )}
                    {setting.category === 'CUSTOMERS' && (
                      <span>💡 Используется при: продаже товаров, получении оплаты от клиентов</span>
                    )}
                    {setting.category === 'VAT' && (
                      <span>💡 Используется при: начислении НДС с продаж</span>
                    )}
                    {setting.category === 'BANK' && (
                      <span>💡 Используется при: поступлениях и списаниях с банковских счетов</span>
                    )}
                    {setting.category === 'INVENTORY' && (
                      <span>💡 Используется при: поступлении и продаже товаров</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая часть - настройка счёта */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Корр. счёт
                  </label>
                  <input
                    type="text"
                    value={setting.account_code}
                    onChange={(e) => handleAccountChange(setting.id, e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0000"
                    disabled={!setting.is_editable || loading}
                  />
                </div>
                
                <button
                  onClick={() => saveSetting(setting)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Сохр...' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Информация внизу */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-blue-600 text-xl mr-3">💡</div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Как это работает?</h3>
            <div className="text-blue-700 text-sm space-y-1">
              <p>• При покупке товара: автоматически создаётся проводка Дт 2040 / Кт 4430</p>
              <p>• При продаже товара: автоматически создаётся проводка Дт 2410 / Кт 7001 + Дт 6001 / Кт 2040</p>
              <p>• При поступлении денег: автоматически создаётся проводка Дт 2710 / Кт 2410</p>
              <p>• Все проводки создаются автоматически, вам не нужно ничего делать вручную!</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AccountingSettings;