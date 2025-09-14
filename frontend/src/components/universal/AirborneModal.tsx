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
