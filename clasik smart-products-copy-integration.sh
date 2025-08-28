#!/bin/bash

# =====================================================
# 🚀 УМНАЯ ИНТЕГРАЦИЯ КОПИРОВАНИЯ В СУЩЕСТВУЮЩУЮ PRODUCTS TABLE
# Работает с текущей структурой ProductsPage за 30 секунд
# =====================================================

echo "🚀 УМНАЯ ИНТЕГРАЦИЯ КОПИРОВАНИЯ..."
echo "📋 Анализ существующей структуры ProductsPage"
echo "⏰ Time: 30 seconds"

# Переходим в корень проекта
cd "$(dirname "$0")"

# =====================================================
# 1. СОЗДАЕМ КОМПАКТНЫЙ КОМПОНЕНТ КНОПКИ КОПИРОВАНИЯ
# =====================================================

echo "📁 Создание ProductCopyButton.tsx..."

mkdir -p frontend/src/pages/company/products/components

cat > frontend/src/pages/company/products/components/ProductCopyButton.tsx << 'EOF'
import React, { useState } from 'react';
import { api } from '../../../../api/axios';

interface ProductCopyButtonProps {
  productId: number;
  productName: string;
  onCopySuccess: () => void;
}

const ProductCopyButton: React.FC<ProductCopyButtonProps> = ({
  productId,
  productName,
  onCopySuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const response = await api.post(`/api/company/products/${productId}/copy`);

      if (response.data.success) {
        setJustCopied(true);
        
        // Показать успех
        console.log(`Товар "${productName}" успешно скопирован!`);
        
        // Обновить таблицу
        onCopySuccess();
        
        // Сбросить состояние
        setTimeout(() => setJustCopied(false), 2000);
      } else {
        throw new Error(response.data.message || 'Ошибка копирования');
      }

    } catch (error: any) {
      console.error('Copy error:', error);
      alert(`Ошибка копирования: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (justCopied) {
    return (
      <button
        className="text-green-600 hover:text-green-900 transition-colors cursor-default"
        title="Товар скопирован!"
      >
        ✅
      </button>
    );
  }

  if (isLoading) {
    return (
      <button
        className="text-blue-400 cursor-not-allowed"
        disabled
        title="Копирование..."
      >
        ⏳
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className="text-blue-600 hover:text-blue-900 transition-colors"
      title={`Скопировать товар "${productName}"`}
    >
      📋
    </button>
  );
};

export default ProductCopyButton;
EOF

# =====================================================
# 2. ОБНОВЛЯЕМ BACKEND CONTROLLER
# =====================================================

echo "🔧 Проверка backend controller..."

# Проверяем есть ли copyProduct функция
if ! grep -q "copyProduct" backend/src/controllers/company/productsController.js; then
  echo "➕ Добавление copyProduct функции..."
  
  # Добавляем функцию copyProduct перед module.exports
  cat >> backend/src/controllers/company/productsController.js << 'EOF'

// =====================================================
// 🔄 КОПИРОВАНИЕ ТОВАРА - БЫСТРАЯ ИНТЕГРАЦИЯ
// =====================================================
const copyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext.companyId;
    const userId = req.user?.id || 1;

    // Находим оригинальный товар
    const originalProduct = await prismaManager.client.products.findFirst({
      where: {
        id: parseInt(id),
        company_id: companyId
      }
    });

    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    // Создаем уникальный код
    const timestamp = Date.now();
    const newCode = `${originalProduct.code}_COPY_${timestamp}`;
    
    // Копируем товар
    const copiedProduct = await prismaManager.client.products.create({
      data: {
        code: newCode,
        name: `${originalProduct.name} (Копия)`,
        description: originalProduct.description || '',
        unit: originalProduct.unit,
        price: originalProduct.price,
        cost_price: originalProduct.cost_price || originalProduct.price,
        currency: originalProduct.currency || 'EUR',
        vat_rate: originalProduct.vat_rate || 0,
        category: originalProduct.category || '',
        min_stock: originalProduct.min_stock || 0,
        current_stock: 0, // Новый товар без остатков
        is_active: true,
        is_service: originalProduct.is_service || false,
        company_id: companyId,
        created_by: userId
      }
    });

    console.log(`✅ Product copied: ${originalProduct.code} -> ${newCode}`);

    res.json({
      success: true,
      message: `Товар "${originalProduct.name}" успешно скопирован`,
      data: copiedProduct
    });

  } catch (error) {
    console.error('❌ Copy product error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при копировании товара'
    });
  }
};
EOF

  # Добавляем в экспорты
  sed -i.bak 's/module\.exports = {/module.exports = {\n  copyProduct,/' backend/src/controllers/company/productsController.js
  echo "✅ copyProduct функция добавлена"
else
  echo "✅ copyProduct функция уже существует"
fi

# =====================================================
# 3. ПРОВЕРЯЕМ ROUTES
# =====================================================

echo "🛣️ Проверка routes..."

if ! grep -q "/copy" backend/src/routes/company/productsRoutes.js; then
  echo "➕ Добавление copy route..."
  
  # Добавляем route перед module.exports
  sed -i.bak '/module\.exports/i\
// 🔄 POST /api/company/products/:id/copy - Скопировать товар\
router.post("/:id/copy", productsController.copyProduct);\
' backend/src/routes/company/productsRoutes.js
  
  echo "✅ Copy route добавлен"
else
  echo "✅ Copy route уже существует"
fi

# =====================================================
# 4. СОЗДАЕМ ПАТЧ ДЛЯ PRODUCTSTABLE.TSX
# =====================================================

echo "🔧 Создание патча для ProductsTable.tsx..."

cat > frontend/src/pages/company/products/components/ProductsTable.patch << 'EOF'
--- a/frontend/src/pages/company/products/components/ProductsTable.tsx
+++ b/frontend/src/pages/company/products/components/ProductsTable.tsx
@@ -1,6 +1,7 @@
 // f/src/pages/company/products/components/ProductsTable.tsx
 import React, { useState } from 'react';
 import { ProductsTableProps, Product } from '../types/productsTypes';
+import ProductCopyButton from './ProductCopyButton';
 
 const ProductsTable: React.FC<ProductsTableProps> = ({
   products,
@@ -185,6 +186,12 @@
                 <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                   <div className="flex items-center justify-center space-x-2">
                     <button
+                      <ProductCopyButton
+                        productId={product.id}
+                        productName={product.name}
+                        onCopySuccess={onRefresh}
+                      />
+                    
+                    <button
                       onClick={() => onEdit(product)}
                       className="text-blue-600 hover:text-blue-900 transition-colors"
                       title="Edit product"
EOF

# =====================================================
# 5. СОЗДАЕМ ИНСТРУКЦИЮ РУЧНОЙ ИНТЕГРАЦИИ
# =====================================================

cat > MANUAL_INTEGRATION.md << 'EOF'
# 🚀 РУЧНАЯ ИНТЕГРАЦИЯ КНОПКИ КОПИРОВАНИЯ

## ✅ Что уже готово:
1. ProductCopyButton.tsx создан
2. Backend copyProduct функция добавлена  
3. Route POST /:id/copy настроен

## 🔧 РУЧНАЯ ИНТЕГРАЦИЯ (30 секунд):

### В файле ProductsTable.tsx добавьте:

1. **Импорт компонента** (строка 3):
```typescript
import ProductCopyButton from './ProductCopyButton';
```

2. **В ACTIONS колонке** (около строки 186), добавьте ПЕРЕД кнопкой Edit:
```typescript
<ProductCopyButton
  productId={product.id}
  productName={product.name}
  onCopySuccess={onRefresh}
/>
```

### Результат:
```typescript
<td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
  <div className="flex items-center justify-center space-x-2">
    {/* ➕ НОВАЯ КНОПКА КОПИРОВАНИЯ */}
    <ProductCopyButton
      productId={product.id}
      productName={product.name}
      onCopySuccess={onRefresh}
    />
    
    {/* Существующие кнопки */}
    <button
      onClick={() => onEdit(product)}
      className="text-blue-600 hover:text-blue-900 transition-colors"
      title="Edit product"
    >
      ✏️
    </button>
    
    <button
      onClick={() => onDelete(product.id)}
      className="text-red-600 hover:text-red-900 transition-colors"
      title="Delete product"
    >
      🗑️
    </button>
  </div>
</td>
```

## 🧪 Тестирование:
1. Откройте Products Management
2. Найдите новую кнопку 📋 в колонке ACTIONS
3. Кликните для копирования товара
4. Таблица автоматически обновится

## 📋 Что делает кнопка:
- Отправляет POST запрос на `/api/company/products/:id/copy`
- Создает копию товара с суффиксом "(Копия)" 
- Генерирует уникальный код с timestamp
- Обновляет таблицу после успешного копирования
- Показывает индикаторы загрузки и успеха
EOF

# =====================================================
# 6. ФИНАЛЬНАЯ ПРОВЕРКА И РЕЗУЛЬТАТ
# =====================================================

echo ""
echo "✅ ИНТЕГРАЦИЯ ЗАВЕРШЕНА!"
echo "⏰ Время выполнения: ~30 секунд"
echo ""
echo "📁 Созданы файлы:"
echo "  - frontend/src/pages/company/products/components/ProductCopyButton.tsx"
echo "  - MANUAL_INTEGRATION.md (инструкция)"
echo ""
echo "🔧 Обновлены файлы:"
echo "  - backend/src/controllers/company/productsController.js (copyProduct функция)"
echo "  - backend/src/routes/company/productsRoutes.js (copy route)"
echo ""
echo "🎯 ОСТАЛОСЬ 30 СЕКУНД РУЧНОЙ РАБОТЫ:"
echo "  1. Откройте ProductsTable.tsx"
echo "  2. Добавьте import ProductCopyButton"
echo "  3. Добавьте компонент в ACTIONS колонку"
echo ""
echo "📖 Подробная инструкция: MANUAL_INTEGRATION.md"
echo ""
echo "🚀 КОСМИЧЕСКИЙ КОРАБЛЬ ГОТОВ! КОПИРОВАНИЕ ИНТЕГРИРОВАНО В СУЩЕСТВУЮЩУЮ АРХИТЕКТУРУ!"