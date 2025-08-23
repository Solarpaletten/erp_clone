import React, { useState, useEffect } from 'react';
import { inventoryWithAccountsStore, LITHUANIAN_ACCOUNTS } from '../../store/inventoryWithAccountsStore';

const InventoryAccountsIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sale' | 'accounts' | 'inventory'>('purchase');
  const [inventory, setInventory] = useState([]);
  const [accountingEntries, setAccountingEntries] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});

  const refreshData = () => {
    setInventory(inventoryWithAccountsStore.getInventory());
    setAccountingEntries(inventoryWithAccountsStore.getAccountingEntries());
    setAccountBalances(inventoryWithAccountsStore.getAccountBalances());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-2 flex items-center">
          <span className="text-3xl mr-3">🎯</span>
          Интеграция Товары + План Счетов
        </h2>
        <p className="opacity-90">
          Полный цикл: Приход → Склад → Продажа → Бухгалтерские проводки
        </p>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          {[
            { key: 'purchase', label: '🛒 Приход', icon: '📦' },
            { key: 'sale', label: '💰 Продажа', icon: '💵' },
            { key: 'inventory', label: '🏭 Склад', icon: '📊' },
            { key: 'accounts', label: '📊 План счетов', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="p-6">
        {activeTab === 'purchase' && <PurchaseTab onUpdate={refreshData} />}
        {activeTab === 'sale' && <SaleTab inventory={inventory} onUpdate={refreshData} />}
        {activeTab === 'inventory' && <InventoryTab inventory={inventory} />}
        {activeTab === 'accounts' && <AccountsTab accountBalances={accountBalances} accountingEntries={accountingEntries} />}
      </div>
    </div>
  );
};

// Компонент прихода товара
const PurchaseTab: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    productName: 'Residues Technical Oil',
    productCode: 'RTO_001',
    quantity: 10,
    unit: 'T',
    costPrice: 800,
    supplierName: 'OIL SUPPLY LTD',
    inventoryAccount: '2041', // Нефтепродукты
    payableAccount: '4430'    // Поставщики
  });
  const [result, setResult] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const documentNumber = `PUR-${Date.now()}`;
      
      inventoryWithAccountsStore.addPurchaseWithAccount({
        ...formData,
        supplierId: 'SUP001',
        documentNumber
      });
      
      const totalAmount = formData.quantity * formData.costPrice;
      
      setResult(`✅ УСПЕШНО! Товар оприходован:

📋 Документ: ${documentNumber}
📦 Товар: ${formData.productName}
📊 Количество: +${formData.quantity} ${formData.unit}
💰 Сумма: €${totalAmount.toLocaleString()}

📚 ПРОВОДКА:
   Дт ${formData.inventoryAccount} "${LITHUANIAN_ACCOUNTS[formData.inventoryAccount]?.name}"
   Кт ${formData.payableAccount} "${LITHUANIAN_ACCOUNTS[formData.payableAccount]?.name}"
   Сумма: €${totalAmount.toLocaleString()}`);
      
      onUpdate();
      
      // Сброс формы
      setFormData(prev => ({ ...prev, quantity: 0, costPrice: 0 }));
    } catch (error) {
      setResult(`❌ Ошибка: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Товар</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код товара</label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Цена за единицу (€)</label>
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
        </div>

        {/* План счетов */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-3">📊 Выбор счетов:</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Счёт товаров (ДЕБЕТ)</label>
              <select
                value={formData.inventoryAccount}
                onChange={(e) => setFormData(prev => ({ ...prev, inventoryAccount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="2040">2040 - Товары для перепродажи</option>
                <option value="2041">2041 - Нефтепродукты</option>
                <option value="2042">2042 - Химические товары</option>
                <option value="2043">2043 - Строительные материалы</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Счёт поставщиков (КРЕДИТ)</label>
              <select
                value={formData.payableAccount}
                onChange={(e) => setFormData(prev => ({ ...prev, payableAccount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="4430">4430 - Кредиторская задолженность</option>
                <option value="2710">2710 - Банк (если оплачено сразу)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm font-medium text-green-800">
              Проводка: Дт {formData.inventoryAccount} Кт {formData.payableAccount} = €{(formData.quantity * formData.costPrice).toLocaleString()}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
        >
          📦 Оприходовать товар + создать проводку
        </button>
      </form>

      {result && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <pre className="text-sm text-blue-800 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

// Компонент продажи товара
const SaleTab: React.FC<{ inventory: any[]; onUpdate: () => void }> = ({ inventory, onUpdate }) => {
  const [formData, setFormData] = useState({
    productCode: '',
    quantity: 5,
    salePrice: 900,
    customerName: 'ENERGY SOLUTIONS LTD'
  });
  const [result, setResult] = useState('');

  const selectedProduct = inventory.find(p => p.productCode === formData.productCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      setResult('❌ Выберите товар для продажи');
      return;
    }

    try {
      const documentNumber = `SAL-${Date.now()}`;
      
      const saleResult = inventoryWithAccountsStore.addSaleWithAccounting({
        ...formData,
        customerId: 'CUS001',
        documentNumber
      });
      
      const totalRevenue = formData.quantity * formData.salePrice;
      
      setResult(`✅ УСПЕШНО! Товар продан:

📋 Документ: ${documentNumber}
📦 Товар: ${selectedProduct.productName}
📊 Количество: -${formData.quantity} ${selectedProduct.unit}
💰 Выручка: €${totalRevenue.toLocaleString()}
💸 Себестоимость: €${saleResult.costPrice.toLocaleString()}
💎 Прибыль: €${saleResult.profit.toLocaleString()}

📚 ПРОВОДКИ:
1️⃣ Дт 6001 "Себестоимость" Кт ${selectedProduct.inventoryAccount} "${selectedProduct.accountName}"
   Сумма: €${saleResult.costPrice.toLocaleString()}

2️⃣ Дт 2410 "Дебиторка" Кт 7001 "Выручка"
   Сумма: €${totalRevenue.toLocaleString()}

🏭 ОСТАТОК: ${saleResult.remainingStock} ${selectedProduct.unit}`);
      
      onUpdate();
      setFormData(prev => ({ ...prev, quantity: 0 }));
    } catch (error) {
      setResult(`❌ Ошибка: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {inventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl block mb-2">📦</span>
          <p>Нет товаров на складе</p>
          <p className="text-sm">Сначала оприходуйте товар на вкладке "Приход"</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Товар</label>
              <select
                value={formData.productCode}
                onChange={(e) => setFormData(prev => ({ ...prev, productCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите товар</option>
                {inventory.filter(item => item.quantity > 0).map(item => (
                  <option key={item.productCode} value={item.productCode}>
                    {item.productName} (остаток: {item.quantity} {item.unit}) - {item.accountName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Цена продажи (€)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Покупатель</label>
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-2">📊 Предварительный расчёт:</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Выручка:</div>
                  <div className="font-medium">€{(formData.quantity * formData.salePrice).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Себестоимость:</div>
                  <div className="font-medium">€{(formData.quantity * selectedProduct.costPrice).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-600">Прибыль:</div>
                  <div className="font-medium text-green-600">€{((formData.quantity * formData.salePrice) - (formData.quantity * selectedProduct.costPrice)).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedProduct}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            💰 Продать товар + создать проводки
          </button>
        </form>
      )}

      {result && (
        <div className="p-4 bg-purple-50 rounded-lg">
          <pre className="text-sm text-purple-800 whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
};

// Компонент склада
const InventoryTab: React.FC<{ inventory: any[] }> = ({ inventory }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 flex items-center">
        <span className="text-2xl mr-2">🏭</span>
        Остатки на складе
      </h3>

      {inventory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-6xl block mb-4">📦</span>
          <p>Склад пуст</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inventory.map((item, index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <span className="text-xl mr-2">📦</span>
                    {item.productName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Код: {item.productCode} • Счёт: {item.inventoryAccount} ({item.accountName})
                  </p>
                  <p className="text-xs text-gray-500">
                    Обновлено: {new Date(item.lastUpdated).toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {item.quantity} {item.unit}
                  </div>
                  <div className="text-sm text-gray-600">
                    €{item.costPrice.toFixed(2)}/{item.unit}
                  </div>
                  <div className="text-xs font-medium text-green-600">
                    Всего: €{item.totalValue.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {item.batches && item.batches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">FIFO партии:</h5>
                  <div className="space-y-1">
                    {item.batches.filter(batch => batch.remainingQuantity > 0).map((batch, bIndex) => (
                      <div key={bIndex} className="text-xs text-gray-600 flex justify-between">
                        <span>{new Date(batch.purchaseDate).toLocaleDateString()} от {batch.supplierName}</span>
                        <span>{batch.remainingQuantity} по €{batch.costPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент плана счетов и проводок
const AccountsTab: React.FC<{ accountBalances: any; accountingEntries: any[] }> = ({ 
  accountBalances, 
  accountingEntries 
}) => {
  return (
    <div className="space-y-6">
      {/* Остатки по счетам */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <span className="text-2xl mr-2">📊</span>
          Остатки по счетам
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(accountBalances)
            .filter(account => accountBalances[account].balance !== 0)
            .map(account => {
              const balance = accountBalances[account];
              const balanceColor = balance.balance > 0 ? 'text-green-600' : 'text-red-600';
              
              return (
                <div key={account} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-mono text-sm font-medium text-gray-900">
                        {account}
                      </div>
                      <div className="text-sm text-gray-600">
                        {balance.name}
                      </div>
                    </div>
                    <div className={`text-lg font-semibold ${balanceColor}`}>
                      €{Math.abs(balance.balance).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Дебет: €{balance.debit.toLocaleString()}</span>
                    <span>Кредит: €{balance.credit.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {Object.keys(accountBalances).filter(account => accountBalances[account].balance !== 0).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <span className="text-6xl block mb-4">📊</span>
            <p>Нет движений по счетам</p>
          </div>
        )}
      </div>

      {/* История проводок */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
          <span className="text-2xl mr-2">📋</span>
          История проводок
        </h3>

        {accountingEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-6xl block mb-4">📋</span>
            <p>Нет проводок</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accountingEntries.slice(0, 10).map((entry, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    entry.documentType === 'PURCHASE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {entry.documentType === 'PURCHASE' ? '🛒 Покупка' : '💰 Продажа'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleString()}
                  </div>
                </div>
                
                <div className="text-sm text-gray-800 mb-2">
                  {entry.description}
                </div>
                
                <div className="flex items-center justify-between bg-gray-50 rounded p-2">
                  <div className="text-xs font-mono">
                    Дт {entry.debitAccount} "{entry.debitAccountName}"
                  </div>
                  <div className="text-xs font-mono">
                    Кт {entry.creditAccount} "{entry.creditAccountName}"
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    €{entry.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryAccountsIntegration;
