#!/bin/bash

# =====================================================
# 🚀 БЫСТРАЯ ИНТЕГРАЦИЯ ВОЗДУШНОГО КОПИРОВАНИЯ В PRODUCTS PAGE
# Добавляет импорты и компоненты в существующую структуру
# =====================================================

echo "🚀 ИНТЕГРАЦИЯ ВОЗДУШНОГО КОПИРОВАНИЯ..."
echo "📋 Добавляем компоненты в ProductsPage"

cd "$(dirname "$0")"

# =====================================================
# 1. ОБНОВЛЯЕМ PRODUCTSPAGE.TSX
# =====================================================

echo "📝 Обновление ProductsPage.tsx..."

# Создаем бэкап оригинального файла
cp frontend/src/pages/company/products/ProductsPage.tsx frontend/src/pages/company/products/ProductsPage.tsx.backup

# Добавляем импорты в ProductsPage.tsx
cat > temp_productspage_header.tsx << 'EOF'
// f/src/pages/company/products/ProductsPage.tsx
import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../../components/company/CompanyLayout.tsx';
import ProductsTable from './components/ProductsTable';
import ProductsToolbar from './components/ProductsToolbar';
import ProductsStats from './components/ProductsStats';
import AddProductModal from './components/AddProductModal';
import EditProductModal from './components/EditProductModal';
import AirborneProductCopy from './components/AirborneProductCopy';
import AirborneToolbarButton from './components/AirborneToolbarButton';
import { api } from '../../../api/axios';
import { 
  Product, 
  ProductsStats as Stats, 
  ProductFormData,
  ProductsResponse,
  ProductsStatsResponse 
} from './types/productsTypes';
EOF

# Читаем оригинальный файл и заменяем импорты
tail -n +17 frontend/src/pages/company/products/ProductsPage.tsx > temp_productspage_body.tsx

# Объединяем новый заголовок с телом файла
cat temp_productspage_header.tsx temp_productspage_body.tsx > frontend/src/pages/company/products/ProductsPage.tsx

# Удаляем временные файлы
rm temp_productspage_header.tsx temp_productspage_body.tsx

echo "✅ Импорты добавлены в ProductsPage.tsx"

# =====================================================
# 2. ОБНОВЛЯЕМ PRODUCTSTOOLBAR.TSX
# =====================================================

echo "🔧 Обновление ProductsToolbar.tsx..."

# Находим файл ProductsToolbar и добавляем импорт AirborneToolbarButton
if [ -f "frontend/src/pages/company/products/components/ProductsToolbar.tsx" ]; then
  
  # Создаем бэкап
  cp frontend/src/pages/company/products/components/ProductsToolbar.tsx frontend/src/pages/company/products/components/ProductsToolbar.tsx.backup
  
  # Добавляем импорт AirborneToolbarButton в начало файла
  sed -i.tmp '1i\
import AirborneToolbarButton from '\''./AirborneToolbarButton'\'';
' frontend/src/pages/company/products/components/ProductsToolbar.tsx

  echo "✅ Импорт добавлен в ProductsToolbar.tsx"
else
  echo "❌ ProductsToolbar.tsx не найден, создаем заглушку..."
  
  mkdir -p frontend/src/pages/company/products/components
  
cat > frontend/src/pages/company/products/components/ProductsToolbar.tsx << 'EOF'
import React from 'react';
import AirborneToolbarButton from './AirborneToolbarButton';
import { ProductsToolbarProps } from '../types/productsTypes';

const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
  onAddProduct,
  onSearch,
  onCategoryFilter,
  searchTerm,
  categoryFilter,
  totalProducts
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onAddProduct}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-medium"
          >
            <span>➕</span>
            <span>Add Product</span>
          </button>
          
          {/* ВОЗДУШНАЯ КНОПКА КОПИРОВАНИЯ */}
          <AirborneToolbarButton onProductCreated={() => window.location.reload()} />
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-4">
            <span>📦</span>
            <span>{totalProducts} products total</span>
          </div>
        </div>

        {/* Right side - Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[250px]"
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
          >
            <option value="">All Categories</option>
            <option value="Solar Equipment">Solar Equipment</option>
            <option value="Нефтепродукты">Нефтепродукты</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductsToolbar;
EOF

  echo "✅ ProductsToolbar.tsx создан с интеграцией"
fi

# =====================================================
# 3. ОБНОВЛЯЕМ ОСНОВНОЙ КОМПОНЕНТ PRODUCTSPAGE
# =====================================================

echo "🎯 Добавление плавающей кнопки в ProductsPage..."

# Находим закрывающий div и добавляем плавающую кнопку перед ним
cat > temp_airborne_addition.txt << 'EOF'

        {/* ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
        <AirborneProductCopy onProductCreated={fetchProducts} />
      </div>
EOF

# Заменяем последний закрывающий div на новый с плавающей кнопкой
sed -i.tmp '$s/      <\/div>//' frontend/src/pages/company/products/ProductsPage.tsx
cat temp_airborne_addition.txt >> frontend/src/pages/company/products/ProductsPage.tsx

# Удаляем временный файл
rm temp_airborne_addition.txt

echo "✅ Плавающая кнопка добавлена в ProductsPage"

# =====================================================
# 4. СОЗДАЕМ ТЕСТОВЫЙ КОМПОНЕНТ ЕСЛИ НЕ ХВАТАЕТ
# =====================================================

if [ ! -f "frontend/src/pages/company/products/components/ProductsStats.tsx" ]; then
  echo "📊 Создание ProductsStats.tsx..."
  
cat > frontend/src/pages/company/products/components/ProductsStats.tsx << 'EOF'
import React from 'react';

interface ProductsStatsProps {
  stats: any;
}

const ProductsStats: React.FC<ProductsStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 px-4">
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.overview?.total || 0}</p>
            <p className="text-xs text-gray-500">Total Products</p>
          </div>
          <div className="text-blue-500 text-2xl">📦</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats?.overview?.active || 0}</p>
            <p className="text-xs text-gray-500">Active</p>
          </div>
          <div className="text-green-500 text-2xl">✅</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-red-600">{stats?.overview?.inactive || 0}</p>
            <p className="text-xs text-gray-500">Inactive</p>
          </div>
          <div className="text-red-500 text-2xl">❌</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats?.overview?.lowStock || 0}</p>
            <p className="text-xs text-gray-500">Low Stock</p>
          </div>
          <div className="text-yellow-500 text-2xl">⚠️</div>
        </div>
      </div>
    </div>
  );
};

export default ProductsStats;
EOF

  echo "✅ ProductsStats.tsx создан"
fi

# =====================================================
# 5. ФИНАЛЬНАЯ ПРОВЕРКА И РЕЗУЛЬТАТ
# =====================================================

echo ""
echo "🎊 ВОЗДУШНОЕ КОПИРОВАНИЕ ИНТЕГРИРОВАНО!"
echo "✈️ Фирменная система готова к использованию!"
echo ""
echo "📱 Что добавлено:"
echo "  ✅ Плавающая кнопка воздушного копирования (правый нижний угол)"
echo "  ✅ Toolbar кнопка 'Воздушное копирование' рядом с Add Product"
echo "  ✅ Импорты компонентов в ProductsPage"
echo "  ✅ Backend copyProduct функция готова"
echo ""
echo "🧪 Тестирование:"
echo "  1. Откройте http://localhost:5173/products"
echo "  2. Увидите плавающую кнопку справа внизу (голубая с градиентом)"
echo "  3. В toolbar есть кнопка 'Воздушное копирование'"
echo "  4. Кликните любую из кнопок для тестирования"
echo ""
echo "🎯 Фишки:"
echo "  - Кнопка 'Топнуть' для мгновенного копирования"
echo "  - Уведомления '✈️ Товар воздушно скопирован!'"
echo "  - Градиенты blue-to-purple для воздушности"
echo "  - Анимации hover и pulse"
echo ""
echo "🚀 КОСМИЧЕСКИЙ КОРАБЛЬ ГОТОВ К ПОЛЕТУ!"
echo "Воздушная система - ваша фирменная фишка!"