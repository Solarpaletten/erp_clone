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
