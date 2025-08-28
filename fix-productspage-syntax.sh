#!/bin/bash

echo "Fixing ProductsPage.tsx syntax error..."

# Создаем правильную версию конца файла ProductsPage.tsx
cat > temp_fix_ending.tsx << 'EOF'
        {/* Modals */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateProduct}
          />
        )}

        {showEditModal && editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => {
              setShowEditModal(false);
              setEditingProduct(null);
            }}
            onSubmit={(formData) => handleEditProduct(editingProduct.id, formData)}
          />
        )}

        {/* ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
        <AirborneProductCopy onProductCreated={fetchProducts} />
      </div>
    </CompanyLayout>
  );
};

export default ProductsPage;
EOF

# Находим строку с модалями и заменяем все после неё
sed -i '/\/\* Modals \*\//,$d' frontend/src/pages/company/products/ProductsPage.tsx

# Добавляем правильное окончание
cat temp_fix_ending.tsx >> frontend/src/pages/company/products/ProductsPage.tsx

# Удаляем временный файл
rm temp_fix_ending.tsx

echo "✅ ProductsPage.tsx syntax fixed"
echo "🚀 Ready for deployment!"