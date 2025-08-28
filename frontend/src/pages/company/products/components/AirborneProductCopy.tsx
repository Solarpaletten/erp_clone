import React, { useState, useEffect } from 'react';
import { Copy, Zap, Plus, Loader, Check, X } from 'lucide-react';
import { api } from '../../../../api/axios';

interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  category?: string;
}

interface AirborneProductCopyProps {
  onProductCreated: () => void;
}

const AirborneProductCopy: React.FC<AirborneProductCopyProps> = ({ onProductCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState<number | null>(null);

  // Загрузка продуктов для копирования
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/company/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAirborneCopy = async (productId: number, productName: string) => {
    setCopying(productId);
    
    try {
      const response = await api.post(`/api/company/products/${productId}/copy`);
      
      if (response.data.success) {
        // Уведомление о успехе
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-xl">✈️</span>
            <div>
              <div class="font-bold">Воздушно скопировано!</div>
              <div class="text-sm">Товар "${productName}" готов</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Убираем уведомление через 3 секунды
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);

        // Обновляем список продуктов
        onProductCreated();
        setIsOpen(false);
      }
    } catch (error: any) {
      alert(`Ошибка копирования: ${error.response?.data?.error || error.message}`);
    } finally {
      setCopying(null);
    }
  };

  return (
    <>
      {/* ГЛАВНАЯ ПЛАВАЮЩАЯ КНОПКА */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Воздушное копирование товаров"
        >
          <div className="relative">
            <Copy className="w-8 h-8" />
            <Zap className="w-4 h-4 absolute -top-1 -right-1 animate-pulse text-yellow-300" />
          </div>
        </button>
        
        {/* Подсказка */}
        <div className="absolute -top-12 right-0 bg-black text-white px-3 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Воздушное копирование
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА ТОВАРА */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Copy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Воздушное копирование</h2>
                  <p className="text-gray-600">Выберите товар для мгновенного копирования</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Список товаров */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2">Загрузка товаров...</span>
                </div>
              ) : (
                <div className="grid gap-3">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Код: {product.code} • {product.price}€
                          {product.category && ` • ${product.category}`}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAirborneCopy(product.id, product.name)}
                        disabled={copying === product.id}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 min-w-32"
                      >
                        {copying === product.id ? (
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
                  ))}
                  
                  {products.length === 0 && !loading && (
                    <div className="text-center p-8 text-gray-500">
                      <Copy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Нет товаров для копирования</p>
                      <p className="text-sm mt-2">Создайте первый товар для начала работы</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Подвал с информацией */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Воздушная система: один клик = новый товар готов к редактированию</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AirborneProductCopy;
