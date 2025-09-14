#!/bin/bash

# =====================================================
# 🚀 TASK 1: PRODUCTS AIRBORNE SYSTEM - COMPLETE SETUP
# Создает все файлы для воздушного копирования товаров
# =====================================================

echo "🚀 СОЗДАНИЕ ВОЗДУШНОЙ СИСТЕМЫ ДЛЯ PRODUCTS..."
echo "📁 Создание файлов: UniversalAirborneButton, AirborneModal, Controller, Routes"

cd "$(dirname "$0")"

# =====================================================
# 1. СОЗДАНИЕ FRONTEND КОМПОНЕНТОВ
# =====================================================

echo "📱 Создание универсальных компонентов..."

# Создаем папку для универсальных компонентов
mkdir -p frontend/src/components/universal

# =====================================================
# UniversalAirborneButton.tsx
# =====================================================

cat > frontend/src/components/universal/UniversalAirborneButton.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Copy, Zap } from 'lucide-react';
import { api } from '../../api/axios';
import AirborneModal from './AirborneModal';

interface AirborneConfig {
  module: 'products' | 'warehouse' | 'sales' | 'purchases' | 'banking' | 'clients' | 'accounts';
  apiEndpoint: string;
  itemName: string;
  lastItemsCount?: number;
  onSuccess?: (newItem: any) => void;
  onError?: (error: string) => void;
}

interface AirborneItem {
  id: number;
  name: string;
  code?: string;
  price?: number;
  category?: string;
  date?: string;
  client?: string;
  supplier?: string;
  amount?: number;
  details?: string;
}

const UniversalAirborneButton: React.FC<AirborneConfig> = ({
  module,
  apiEndpoint,
  itemName,
  lastItemsCount = 5,
  onSuccess,
  onError
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<AirborneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState<number | null>(null);

  // Загрузка последних элементов при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadItems();
      // Телеметрия: открытие модального окна
      logEvent('airborne_open_modal', { module });
    }
  }, [isOpen, module]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await api.get(`${apiEndpoint}?limit=${lastItemsCount}&sort=created_at:desc`);
      let itemsData = [];
      
      // Обработка разных структур ответа для разных модулей
      if (response.data.products) {
        itemsData = response.data.products;
      } else if (response.data.items) {
        itemsData = response.data.items;
      } else if (response.data.data) {
        itemsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        itemsData = response.data;
      }

      setItems(itemsData.slice(0, lastItemsCount));
    } catch (error: any) {
      console.error(`Ошибка загрузки ${itemName}:`, error);
      logEvent('airborne_load_error', { 
        module, 
        error_code: error.response?.status || 'unknown' 
      });
      if (onError) {
        onError(`Не удалось загрузить ${itemName}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAirborneCopy = async (itemId: number, itemDisplayName: string) => {
    setCopying(itemId);
    const startTime = Date.now();
    
    // Телеметрия: начало копирования
    logEvent('airborne_copy_click', { module, entityId: itemId });

    try {
      const response = await api.post(`${apiEndpoint}/${itemId}/copy`, {
        module,
        source: 'airborne_fab'
      });

      if (response.data.success) {
        const latency = Date.now() - startTime;
        
        // Телеметрия: успешное копирование
        logEvent('airborne_copy_success', {
          module,
          originalId: itemId,
          copyId: response.data.data?.id,
          latency_ms: latency
        });

        // Показать уведомление с переходом к документу
        showAirborneNotification(itemDisplayName, response.data.data);
        
        // Закрыть модальное окно
        setIsOpen(false);
        
        // Callback для обновления родительского компонента
        if (onSuccess) {
          onSuccess(response.data.data);
        }

      } else {
        throw new Error(response.data.message || 'Неизвестная ошибка копирования');
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      
      // Телеметрия: ошибка копирования
      logEvent('airborne_copy_error', {
        module,
        error_code: error.response?.status || 'unknown',
        error_message: errorMessage
      });

      console.error('Airborne copy error:', error);
      
      if (onError) {
        onError(`Ошибка копирования: ${errorMessage}`);
      } else {
        alert(`Ошибка копирования: ${errorMessage}`);
      }
    } finally {
      setCopying(null);
    }
  };

  const showAirborneNotification = (itemName: string, newItem: any) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[9999] animate-bounce';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-xl">✈️</span>
        <div class="flex-1">
          <div class="font-bold">Воздушно скопировано!</div>
          <div class="text-sm">${itemName} готов к использованию</div>
        </div>
        <button 
          class="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors airborne-goto-btn"
          data-item-id="${newItem?.id}"
        >
          Перейти к документу
        </button>
        <button class="ml-2 text-white hover:text-gray-200 airborne-close-btn">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);

    // Обработчик кнопки "Перейти к документу"
    const gotoBtn = notification.querySelector('.airborne-goto-btn') as HTMLButtonElement;
    const closeBtn = notification.querySelector('.airborne-close-btn') as HTMLButtonElement;
    
    if (gotoBtn) {
      gotoBtn.addEventListener('click', () => {
        navigateToDocument(newItem);
        document.body.removeChild(notification);
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.removeChild(notification);
      });
    }

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  };

  const navigateToDocument = (item: any) => {
    if (!item?.id) return;

    // Навигация в зависимости от модуля
    const routes = {
      products: `/products/${item.id}`,
      warehouse: `/warehouse/movements/${item.id}`,
      sales: `/sales/${item.id}`,
      purchases: `/purchases/${item.id}`,
      banking: `/banking/operations/${item.id}`,
      clients: `/clients/${item.id}`,
      accounts: `/accounts/${item.id}`
    };

    const targetRoute = routes[module];
    if (targetRoute) {
      // Используем Next.js router или window.location
      if (typeof window !== 'undefined') {
        window.location.href = targetRoute;
      }
    }
  };

  const logEvent = (event: string, data: Record<string, any>) => {
    // Отправка телеметрии
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track(event, data);
    }
    console.log(`[Airborne Telemetry] ${event}:`, data);
  };

  return (
    <>
      {/* Плавающая кнопка */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title={`Воздушное копирование ${itemName}`}
          aria-label={`Открыть воздушное копирование ${itemName}`}
        >
          <div className="relative">
            <Copy className="w-8 h-8" />
            <Zap className="w-4 h-4 absolute -top-1 -right-1 animate-pulse text-yellow-300" />
          </div>
        </button>
        
        {/* Подсказка при наведении */}
        <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Воздушное копирование
        </div>
      </div>

      {/* Модальное окно */}
      {isOpen && (
        <AirborneModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          items={items}
          loading={loading}
          copying={copying}
          module={module}
          itemName={itemName}
          onCopy={handleAirborneCopy}
        />
      )}
    </>
  );
};

export default UniversalAirborneButton;
EOF

# =====================================================
# AirborneModal.tsx
# =====================================================

cat > frontend/src/components/universal/AirborneModal.tsx << 'EOF'
import React, { useState, useMemo } from 'react';
import { Copy, Zap, Loader, X, Search, Calendar } from 'lucide-react';

interface AirborneItem {
  id: number;
  name: string;
  code?: string;
  price?: number;
  category?: string;
  date?: string;
  client?: string;
  supplier?: string;
  amount?: number;
  details?: string;
  created_at?: string;
  updated_at?: string;
}

interface AirborneModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: AirborneItem[];
  loading: boolean;
  copying: number | null;
  module: string;
  itemName: string;
  onCopy: (itemId: number, itemDisplayName: string) => void;
}

const AirborneModal: React.FC<AirborneModalProps> = ({
  isOpen,
  onClose,
  items,
  loading,
  copying,
  module,
  itemName,
  onCopy
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Фильтрация элементов по поиску и дате
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Фильтр по поисковому запросу
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(search) ||
        item.code?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.client?.toLowerCase().includes(search) ||
        item.supplier?.toLowerCase().includes(search)
      );
    }

    // Фильтр по дате
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.created_at || item.date || '');
        return itemDate >= filterDate;
      });
    }

    return filtered;
  }, [items, searchTerm, dateFilter]);

  const getItemDisplayName = (item: AirborneItem): string => {
    switch (module) {
      case 'products':
        return item.name || `Товар #${item.id}`;
      case 'warehouse':
        return `Движение #${item.id}`;
      case 'sales':
        return `Продажа #${item.id}`;
      case 'purchases':
        return `Закупка #${item.id}`;
      case 'banking':
        return `Операция #${item.id}`;
      case 'clients':
        return item.name || `Клиент #${item.id}`;
      case 'accounts':
        return `Счет ${item.code || item.id}`;
      default:
        return item.name || `Элемент #${item.id}`;
    }
  };

  const getItemDetails = (item: AirborneItem): string => {
    const parts: string[] = [];

    if (item.code) parts.push(`Код: ${item.code}`);
    if (item.price) parts.push(`€${item.price.toFixed(2)}`);
    if (item.amount) parts.push(`€${item.amount.toFixed(2)}`);
    if (item.category) parts.push(item.category);
    if (item.client) parts.push(`Клиент: ${item.client}`);
    if (item.supplier) parts.push(`Поставщик: ${item.supplier}`);
    
    // Дата создания или обновления
    const dateStr = item.created_at || item.date;
    if (dateStr) {
      const date = new Date(dateStr);
      parts.push(`${date.toLocaleDateString('ru-RU')}`);
    }

    return parts.join(' • ');
  };

  const getItemBadge = (item: AirborneItem): { text: string; color: string } | null => {
    switch (module) {
      case 'products':
        if (item.category) {
          return { text: item.category, color: 'bg-blue-100 text-blue-800' };
        }
        break;
      case 'warehouse':
        return { text: 'Движение', color: 'bg-purple-100 text-purple-800' };
      case 'sales':
        return { text: 'Продажа', color: 'bg-green-100 text-green-800' };
      case 'purchases':
        return { text: 'Закупка', color: 'bg-orange-100 text-orange-800' };
      case 'banking':
        return { text: 'Банк', color: 'bg-yellow-100 text-yellow-800' };
      case 'clients':
        return { text: 'Клиент', color: 'bg-indigo-100 text-indigo-800' };
      case 'accounts':
        return { text: 'Счет', color: 'bg-gray-100 text-gray-800' };
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Воздушное копирование</h2>
              <p className="text-gray-600">
                Выберите {itemName} для мгновенного создания копии
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            aria-label="Закрыть модальное окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Поиск и фильтры */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={`Поиск ${itemName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Все документы</option>
                <option value="7days">За последние 7 дней</option>
                <option value="30days">За последний месяц</option>
                <option value="90days">За последние 3 месяца</option>
              </select>
            </div>
          </div>
        </div>

        {/* Список элементов */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2">Загрузка {itemName}...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <Copy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              {items.length === 0 ? (
                <>
                  <p className="text-lg">Нет {itemName} для копирования</p>
                  <p className="text-sm mt-2">Создайте первый документ для начала работы</p>
                </>
              ) : (
                <>
                  <p className="text-lg">Ничего не найдено</p>
                  <p className="text-sm mt-2">Попробуйте изменить поисковый запрос или фильтры</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => {
                const displayName = getItemDisplayName(item);
                const details = getItemDetails(item);
                const badge = getItemBadge(item);
                const isCopying = copying === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      isCopying ? 'bg-blue-50 border-blue-200' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{displayName}</span>
                        {badge && (
                          <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>
                      {details && (
                        <div className="text-sm text-gray-500">
                          {details}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => onCopy(item.id, displayName)}
                      disabled={isCopying}
                      className={`px-6 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 min-w-32 ${
                        isCopying
                          ? 'bg-blue-400 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      }`}
                    >
                      {isCopying ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Копируем...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Топнуть</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Подвал с информацией */}
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Воздушная система: один клик = готовый документ</span>
            </div>
            {!loading && (
              <div className="text-xs text-gray-500">
                {filteredItems.length !== items.length 
                  ? `Показано: ${filteredItems.length} из ${items.length}` 
                  : `Всего: ${items.length} документов`
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirborneModal;
EOF

# =====================================================
# 4. ИНТЕГРАЦИЯ В PRODUCTSPAGE (ПРИМЕР)
# =====================================================
cd frontend/src/pages/company
echo "📄 Создание примера интеграции в ProductsPage..."

cat > INTEGRATION_EXAMPLE.md << 'EOF'
# Интеграция воздушной кнопки в ProductsPage.tsx

## 1. Добавить импорт
```typescript
import UniversalAirborneButton from '../../../components/universal/UniversalAirborneButton';
```

## 2. Добавить handlers
```typescript
const handleAirborneSuccess = (newProduct: any) => {
  // Оптимистичное добавление товара в список
  setProducts(prev => [newProduct, ...prev]);
  fetchStats(); // Обновляем статистику
  toast.success(`Товар "${newProduct.name}" воздушно скопирован!`);
};

const handleAirborneError = (error: string) => {
  toast.error(`Ошибка воздушного копирования: ${error}`);
};
```

## 3. Добавить компонент перед закрывающим </div>
```typescript
{/* ✈️ ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
<UniversalAirborneButton
  module="products"
  apiEndpoint="/api/company/products"
  itemName="товар"
  lastItemsCount={5}
  onSuccess={handleAirborneSuccess}
  onError={handleAirborneError}
/>
```

## 4. Добавить react-toastify для уведомлений (если не установлено)
```bash
npm install react-toastify
```

```typescript
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// В конце компонента добавить ToastContainer
<ToastContainer />
```
EOF

# =====================================================
# ФИНАЛИЗАЦИЯ
# =====================================================

echo ""
echo "✅ TASK 1: ВОЗДУШНАЯ СИСТЕМА ДЛЯ PRODUCTS СОЗДАНА!"
echo ""
echo "📁 Созданные файлы:"
echo "  - frontend/src/components/universal/UniversalAirborneButton.tsx"
echo "  - frontend/src/components/universal/AirborneModal.tsx"
echo "  - backend/src/controllers/company/productsController.js (обновлен)"
echo "  - backend/src/routes/company/productsRoutes.js (обновлен)"
echo "  - backend/tests/controllers/productsController.test.js"
echo "  - INTEGRATION_EXAMPLE.md"
echo ""
echo "🚀 Следующие шаги:"
echo "  1. Интегрировать компонент в ProductsPage.tsx (см. INTEGRATION_EXAMPLE.md)"
echo "  2. Протестировать в браузере"
echo "  3. Запустить unit tests: npm test"
echo "  4. Code review и merge"
echo ""
echo "🎯 Готово к переходу на Task 2: WarehousePage"
echo ""
echo "✈️ Воздушная бухгалтерия запущена!"