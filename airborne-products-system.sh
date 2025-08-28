#!/bin/bash

# =====================================================
# 🚀 ВОЗДУШНАЯ СИСТЕМА КОПИРОВАНИЯ ПРОДУКТОВ
# Фирменная фишка - один клик и готово!
# =====================================================

echo "🚀 СОЗДАНИЕ ВОЗДУШНОЙ СИСТЕМЫ КОПИРОВАНИЯ ПРОДУКТОВ..."
echo "⚡ Фирменная особенность: топнул и у тебя готов новый товар!"

cd "$(dirname "$0")"

# =====================================================
# 1. FLOATING COPY BUTTON ДЛЯ ПРОДУКТОВ
# =====================================================

echo "📱 Создание плавающей кнопки копирования..."

mkdir -p frontend/src/pages/company/products/components

cat > frontend/src/pages/company/products/components/AirborneProductCopy.tsx << 'EOF'
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
EOF

# =====================================================
# 2. TOOLBAR КНОПКА ДЛЯ DESKTOP
# =====================================================

echo "🖥️ Создание toolbar кнопки для desktop..."

cat > frontend/src/pages/company/products/components/AirborneToolbarButton.tsx << 'EOF'
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
EOF

# =====================================================
# 3. ОБНОВЛЕНИЕ BACKEND
# =====================================================

echo "🔧 Обновление backend controller..."

# Проверяем наличие copyProduct функции
if ! grep -q "copyProduct" backend/src/controllers/company/productsController.js; then
  cat >> backend/src/controllers/company/productsController.js << 'EOF'

// =====================================================
// ✈️ ВОЗДУШНОЕ КОПИРОВАНИЕ ТОВАРОВ
// =====================================================
const copyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext.companyId;
    const userId = req.user?.id || 1;

    // Находим оригинальный товар
    const original = await prismaManager.client.products.findFirst({
      where: { id: parseInt(id), company_id: companyId }
    });

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Воздушное копирование - создаем мгновенно
    const timestamp = Date.now();
    const newCode = `${original.code}_${timestamp}`;
    
    const copy = await prismaManager.client.products.create({
      data: {
        code: newCode,
        name: `${original.name} (Копия)`,
        description: original.description || '',
        unit: original.unit,
        price: original.price,
        cost_price: original.cost_price || original.price,
        currency: original.currency || 'EUR',
        vat_rate: original.vat_rate || 0,
        category: original.category || '',
        min_stock: original.min_stock || 0,
        current_stock: 0,
        is_active: true,
        is_service: original.is_service || false,
        company_id: companyId,
        created_by: userId
      }
    });

    logger.info(`✈️ Airborne copy: ${original.code} -> ${newCode}`);

    res.json({
      success: true,
      message: `Товар воздушно скопирован за 1 секунду!`,
      data: copy,
      airborne: {
        originalId: original.id,
        copyId: copy.id,
        timeSaved: '5 минут',
        method: 'Воздушная система'
      }
    });

  } catch (error) {
    logger.error('❌ Airborne copy failed:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка воздушного копирования'
    });
  }
};
EOF

  # Добавляем в экспорты если нет
  if ! grep -q "copyProduct" backend/src/controllers/company/productsController.js | grep "module.exports"; then
    sed -i.bak 's/module\.exports = {/module.exports = {\n  copyProduct,/' backend/src/controllers/company/productsController.js
  fi
fi

# Добавляем route если нет
if ! grep -q "/copy" backend/src/routes/company/productsRoutes.js; then
  sed -i.bak '/module\.exports/i\
// ✈️ POST /api/company/products/:id/copy - Воздушное копирование\
router.post("/:id/copy", productsController.copyProduct);\
' backend/src/routes/company/productsRoutes.js
fi

# =====================================================
# 4. ИНСТРУКЦИЯ ИНТЕГРАЦИИ
# =====================================================

cat > AIRBORNE_INTEGRATION.md << 'EOF'
# ✈️ ВОЗДУШНАЯ СИСТЕМА КОПИРОВАНИЯ ПРОДУКТОВ

## 🎯 Концепция:
"Топнул и у тебя готов новый товар!" - фирменная фишка системы

## 📱 Компоненты:

### 1. AirborneProductCopy.tsx - Плавающая кнопка
- Большая заметная кнопка справа внизу
- Модальное окно с выбором товаров
- Анимации и уведомления

### 2. AirborneToolbarButton.tsx - Desktop кнопка  
- Кнопка в toolbar рядом с "Add Product"
- Dropdown с последними товарами
- Быстрое копирование без модального окна

## 🔧 Интеграция:

### В ProductsPage.tsx добавить:
```typescript
import AirborneProductCopy from './components/AirborneProductCopy';
import AirborneToolbarButton from './components/AirborneToolbarButton';

// В toolbar (в ProductsToolbar компонент):
<AirborneToolbarButton onProductCreated={fetchProducts} />

// В конце страницы:
<AirborneProductCopy onProductCreated={fetchProducts} />
```

### В ProductsToolbar.tsx обновить:
```typescript
<div className="flex items-center gap-3">
  <button onClick={onAddProduct} className="...">
    Add Product
  </button>
  
  <AirborneToolbarButton onProductCreated={onRefresh} />
</div>
```

## 🧪 Результат:
1. **Desktop**: Кнопка "Воздушное копирование" с dropdown
2. **Mobile**: Плавающая кнопка с модальным окном
3. **UX**: Один клик -> новый товар -> мгновенные уведомления
4. **Фишка**: Отличие от конкурентов - "топнул и готово"

## ✈️ Airborne Experience:
- Клик -> Анимация -> Уведомление "воздушно скопировано"
- Фон: градиенты blue-to-purple  
- Иконки: Copy + Zap для "воздушности"
- Тексты: "топнуть", "воздушно", "за 1 секунду"
EOF

echo ""
echo "✅ ВОЗДУШНАЯ СИСТЕМА СОЗДАНА!"
echo "✈️ Фирменная фишка готова: топнул и у тебя новый товар!"
echo ""
echo "📁 Созданы компоненты:"
echo "  - AirborneProductCopy.tsx (плавающая кнопка)"  
echo "  - AirborneToolbarButton.tsx (desktop кнопка)"
echo "  - Backend copyProduct функция обновлена"
echo ""
echo "🎯 Особенности:"
echo "  - Большие заметные кнопки"
echo "  - Плавающая кнопка для мобильных"
echo "  - Мгновенные уведомления" 
echo "  - Воздушная анимация и стиль"
echo ""
echo "📖 Инструкция: AIRBORNE_INTEGRATION.md"
echo ""
echo "🚀 Готово к интеграции в ProductsPage!"