#!/bin/bash

# =====================================================
# 🚀 ИНТЕГРАЦИЯ КОПИРОВАНИЯ В СУЩЕСТВУЮЩУЮ ТАБЛИЦУ ПРОДУКТОВ
# Добавляет кнопку копирования в ACTIONS колонку за 30 секунд
# =====================================================

echo "🚀 ИНТЕГРАЦИЯ КОПИРОВАНИЯ В PRODUCTS TABLE..."
echo "⏰ Estimated time: 30 seconds"
echo "📋 Работаем с существующей структурой ProductsPage"

# Переходим в корень проекта
cd "$(dirname "$0")"

# =====================================================
# 1. СОЗДАЕМ КОМПОНЕНТ КНОПКИ КОПИРОВАНИЯ
# =====================================================

echo "📁 Создание ProductCopyButton.tsx..."

mkdir -p frontend/src/components/products

cat > frontend/src/components/products/ProductCopyButton.tsx << 'EOF'
import React, { useState } from 'react';
import { Copy, Loader, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProductCopyButtonProps {
  productId: number;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'full';
  onCopySuccess?: (newProduct: any) => void;
  onCopyError?: (error: string) => void;
  className?: string;
}

const ProductCopyButton: React.FC<ProductCopyButtonProps> = ({
  productId,
  productName,
  size = 'sm',
  variant = 'icon',
  onCopySuccess,
  onCopyError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/company/products/${productId}/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-company-id': localStorage.getItem('currentCompanyId') || '1'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка копирования');
      }

      const result = await response.json();

      if (result.success) {
        setJustCopied(true);
        
        toast.success(`Товар "${productName}" успешно скопирован!`, {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => setJustCopied(false), 2000);

        if (onCopySuccess) {
          onCopySuccess(result.data);
        }

      } else {
        throw new Error(result.message || 'Неизвестная ошибка');
      }

    } catch (error) {
      console.error('Product copy error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка копирования товара';
      
      toast.error(`Ошибка: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });

      if (onCopyError) {
        onCopyError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSizes = () => {
    switch (size) {
      case 'sm': return { icon: 'w-3 h-3', button: 'p-1.5 text-xs', gap: 'gap-1' };
      case 'lg': return { icon: 'w-5 h-5', button: 'p-3 text-base', gap: 'gap-3' };
      default: return { icon: 'w-4 h-4', button: 'p-2 text-sm', gap: 'gap-2' };
    }
  };

  const sizes = getSizes();

  const getButtonStyles = () => {
    const baseStyles = `inline-flex items-center justify-center rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;
    
    if (variant === 'icon') {
      return `${baseStyles} ${sizes.button} text-gray-600 hover:text-blue-600 hover:bg-blue-50 ${className}`;
    }
    
    if (variant === 'text') {
      return `${baseStyles} ${sizes.button} ${sizes.gap} text-blue-600 hover:text-blue-700 hover:bg-blue-50 ${className}`;
    }
    
    return `${baseStyles} ${sizes.button} ${sizes.gap} bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg ${className}`;
  };

  const getIcon = () => {
    if (justCopied) {
      return <Check className={`${sizes.icon} text-green-500`} />;
    }
    
    if (isLoading) {
      return <Loader className={`${sizes.icon} animate-spin`} />;
    }
    
    return <Copy className={sizes.icon} />;
  };

  const getText = () => {
    if (justCopied) return 'Скопировано!';
    if (isLoading) return 'Копирование...';
    return 'Копировать';
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={getButtonStyles()}
      title={`Скопировать товар "${productName}"`}
    >
      {getIcon()}
      {(variant === 'text' || variant === 'full') && (
        <span className={justCopied ? 'text-green-600' : ''}>
          {getText()}
        </span>
      )}
    </button>
  );
};

export default ProductCopyButton;
EOF

# =====================================================
# 2. ОБНОВЛЯЕМ BACKEND CONTROLLER (если нужно)
# =====================================================

echo "🔧 Проверка backend controller..."

# Добавляем copyProduct функцию если её нет
if ! grep -q "copyProduct" backend/src/controllers/company/productsController.js; then
  echo "➕ Добавление copyProduct в controller..."
  
cat >> backend/src/controllers/company/productsController.js << 'EOF'

// =====================================================
// 🔄 КОПИРОВАНИЕ ТОВАРА
// =====================================================
const copyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyContext.companyId;

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

    // Создаем копию с новым кодом
    const newCode = `${originalProduct.code}_COPY_${Date.now()}`;
    
    const copiedProduct = await prismaManager.client.products.create({
      data: {
        code: newCode,
        name: `${originalProduct.name} (Копия)`,
        description: originalProduct.description,
        category: originalProduct.category,
        unit: originalProduct.unit,
        purchase_price: originalProduct.purchase_price,
        selling_price: originalProduct.selling_price,
        min_stock_level: originalProduct.min_stock_level,
        company_id: companyId,
        is_active: true,
        created_by: req.user.id
      }
    });

    logger.info(`Product copied: ${originalProduct.code} -> ${newCode}`);

    res.json({
      success: true,
      message: 'Товар успешно скопирован',
      data: copiedProduct
    });

  } catch (error) {
    logger.error('Copy product error:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка копирования товара'
    });
  }
};
EOF

  # Добавляем в экспорты
  sed -i '' 's/module\.exports = {/module.exports = {\n  copyProduct,/' backend/src/controllers/company/productsController.js
fi

# =====================================================
# 3. ОБНОВЛЯЕМ ROUTES (если нужно)
# =====================================================

echo "🛣️ Проверка routes..."

if ! grep -q "/copy" backend/src/routes/company/productsRoutes.js; then
  echo "➕ Добавление copy route..."
  
  # Добавляем route перед module.exports
  sed -i '' '/module\.exports/i\
// 🔄 POST /api/company/products/:id/copy - Скопировать товар\
router.post("/:id/copy", productsController.copyProduct);\
' backend/src/routes/company/productsRoutes.js
fi

# =====================================================
# 4. УСТАНАВЛИВАЕМ ЗАВИСИМОСТИ
# =====================================================

echo "📦 Установка react-toastify..."

cd frontend
if ! npm list react-toastify &>/dev/null; then
  npm install react-toastify
fi
cd ..

# =====================================================
# 5. СОЗДАЕМ ДЕМОНСТРАЦИОННЫЙ ФАЙЛ ИНТЕГРАЦИИ
# =====================================================

echo "📄 Создание примера интеграции..."

cat > frontend/src/components/products/ProductsTableExample.tsx << 'EOF'
// Пример интеграции ProductCopyButton в таблицу продуктов

import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import ProductCopyButton from './ProductCopyButton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// В ACTIONS колонке добавьте:

const ActionsColumn: React.FC<{ product: any, onRefresh: () => void }> = ({ product, onRefresh }) => {
  return (
    <div className="flex items-center gap-2">
      {/* КНОПКА КОПИРОВАНИЯ */}
      <ProductCopyButton
        productId={product.id}
        productName={product.name}
        size="sm"
        variant="icon"
        onCopySuccess={(newProduct) => {
          console.log('Товар скопирован:', newProduct);
          onRefresh(); // Обновить таблицу
        }}
        className="hover:bg-blue-50"
      />
      
      {/* Остальные кнопки */}
      <button className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
        <Eye className="w-3 h-3" />
      </button>
      
      <button className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
        <Edit className="w-3 h-3" />
      </button>
      
      <button className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

// НЕ ЗАБУДЬТЕ ДОБАВИТЬ ToastContainer в корень приложения:
// <ToastContainer />
EOF

# =====================================================
# 6. СОЗДАЕМ ИНСТРУКЦИЮ ПО ИНТЕГРАЦИИ
# =====================================================

cat > INTEGRATION_GUIDE.md << 'EOF'
# 🚀 ИНСТРУКЦИЯ ПО ИНТЕГРАЦИИ КОПИРОВАНИЯ ПРОДУКТОВ

## Что было создано:
1. ✅ ProductCopyButton.tsx - компонент кнопки копирования
2. ✅ Backend copyProduct функция добавлена
3. ✅ Route POST /:id/copy добавлен
4. ✅ react-toastify установлен

## Как интегрировать:

### 1. В вашем компоненте таблицы продуктов:
```typescript
import ProductCopyButton from '../components/products/ProductCopyButton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
```

### 2. В колонке ACTIONS добавьте:
```typescript
<ProductCopyButton
  productId={product.id}
  productName={product.name}
  size="sm"
  variant="icon"
  onCopySuccess={(newProduct) => {
    // Обновить таблицу после копирования
    refetchProducts();
  }}
/>
```

### 3. Добавьте ToastContainer в корень App.tsx:
```typescript
<ToastContainer />
```

## Тестирование:
1. Откройте страницу Products
2. Найдите кнопку копирования (иконка Copy) в колонке ACTIONS
3. Кликните на неё
4. Должно появиться уведомление об успешном копировании
5. Таблица должна обновиться с новым товаром
EOF

# =====================================================
# 7. РЕЗУЛЬТАТ
# =====================================================

echo ""
echo "✅ РАЗВЕРТЫВАНИЕ ЗАВЕРШЕНО!"
echo "⏰ Время выполнения: ~30 секунд"
echo ""
echo "📁 Созданные файлы:"
echo "  - frontend/src/components/products/ProductCopyButton.tsx"
echo "  - frontend/src/components/products/ProductsTableExample.tsx"
echo "  - INTEGRATION_GUIDE.md"
echo ""
echo "🔧 Обновленные файлы:"
echo "  - backend/src/controllers/company/productsController.js"
echo "  - backend/src/routes/company/productsRoutes.js"
echo ""
echo "📦 Установленные пакеты:"
echo "  - react-toastify"
echo ""
echo "🎯 СЛЕДУЮЩИЕ ШАГИ:"
echo "  1. Интегрируйте ProductCopyButton в вашу таблицу"
echo "  2. Добавьте ToastContainer в App.tsx"
echo "  3. Протестируйте копирование"
echo ""
echo "📖 Подробная инструкция в файле: INTEGRATION_GUIDE.md"
echo ""
echo "🚀 КОСМИЧЕСКИЙ КОРАБЛЬ ГОТОВ К ПОЛЕТУ!"