import React, { useState } from 'react';
import { Copy, Zap, ChevronDown } from 'lucide-react';
import { api } from '../../../../api/axios';

interface AirborneToolbarButtonProps {
  onProductCreated: () => void;
}

const AirborneToolbarButton: React.FC<AirborneToolbarButtonProps> = ({ onProductCreated }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  const loadRecentProducts = async () => {
    try {
      const response = await api.get('/api/company/products?limit=5&sort=created_at');
      setRecentProducts(response.data.products || []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    }
  };

  const handleQuickCopy = async (productId: number, productName: string) => {
    try {
      const response = await api.post(`/api/company/products/${productId}/copy`);
      
      if (response.data.success) {
        // Показать success toast
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = `✈️ Товар "${productName}" воздушно скопирован!`;
        document.body.appendChild(toast);
        
        setTimeout(() => document.body.removeChild(toast), 3000);
        
        onProductCreated();
        setIsDropdownOpen(false);
      }
    } catch (error: any) {
      alert(`Ошибка: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDropdownToggle = () => {
    if (!isDropdownOpen) {
      loadRecentProducts();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={handleDropdownToggle}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
      >
        <Zap className="w-4 h-4" />
        <span className="hidden sm:inline">Воздушное копирование</span>
        <span className="sm:hidden">Топнуть</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border w-80 z-20">
            <div className="p-3 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-gray-900">Быстрое копирование</span>
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-3 hover:bg-blue-50 border-b last:border-b-0 cursor-pointer transition-colors"
                  onClick={() => handleQuickCopy(product.id, product.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.code} • {product.price}€
                      </div>
                    </div>
                    <div className="ml-2 text-blue-500 hover:text-blue-700">
                      <Zap className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
              
              {recentProducts.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  <p>Нет товаров для копирования</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AirborneToolbarButton;
