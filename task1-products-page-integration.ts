// pages/company/products/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ProductsTable from './components/ProductsTable';
import ProductsToolbar from './components/ProductsToolbar';
import ProductsStats from './components/ProductsStats';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import UniversalAirborneButton from '../../../components/universal/UniversalAirborneButton';
import { api } from '../../../api/axios';
import { Product, ProductsStats as StatsType } from '../../../types/products';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Загрузка продуктов и статистики при монтировании
  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/company/products');
      setProducts(response.data.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Не удалось загрузить продукты');
      toast.error('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/company/products/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      // Статистика не критична, не показываем ошибку пользователю
    }
  };

  const handleCreateProduct = async (formData: any) => {
    try {
      const response = await api.post('/api/company/products', formData);
      toast.success('Продукт успешно создан');
      setShowAddModal(false);
      
      // Оптимистичное обновление
      if (response.data.data) {
        setProducts(prev => [response.data.data, ...prev]);
      } else {
        // Fallback - перезагружаем все продукты
        await fetchProducts();
      }
      
      fetchStats(); // Обновляем статистику
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка создания продукта');
    }
  };

  const handleEditProduct = async (productId: number, formData: any) => {
    try {
      const response = await api.put(`/api/company/products/${productId}`, formData);
      toast.success('Продукт успешно обновлен');
      setShowEditModal(false);
      setEditingProduct(null);
      
      // Оптимистичное обновление
      if (response.data.data) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, ...response.data.data } : p
        ));
      } else {
        await fetchProducts();
      }
      
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка обновления продукта');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return;
    
    try {
      await api.delete(`/api/company/products/${productId}`);
      toast.success('Продукт успешно удален');
      
      // Оптимистичное удаление
      setProducts(prev => prev.filter(p => p.id !== productId));
      fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Ошибка удаления продукта');
    }
  };

  // =====================================================
  // ✈️ AIRBORNE COPY HANDLERS
  // =====================================================

  const handleAirborneSuccess = (newProduct: Product) => {
    console.log('Airborne copy success:', newProduct);
    
    // Оптимистичное добавление нового продукта в начало списка
    setProducts(prev => [newProduct, ...prev]);
    
    // Обновляем статистику
    fetchStats();

    // Показываем toast уведомление (дополнительно к системному)
    toast.success(`Товар "${newProduct.name}" воздушно скопирован!`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleAirborneError = (error: string) => {
    console.error('Airborne copy error:', error);
    
    // Показываем ошибку через toast
    toast.error(`Ошибка воздушного копирования: ${error}`, {
      position: "top-right",
      autoClose: 5000,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">📦 Products Management</h1>
          <p className="text-blue-100 text-sm">
            Управление каталогом товаров с воздушным копированием
          </p>
        </div>
        <button className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
          Support (FAQ: 15)
        </button>
      </div>

      {/* Stats */}
      {stats && <ProductsStats stats={stats} />}

      {/* Toolbar */}
      <ProductsToolbar 
        onAddProduct={() => setShowAddModal(true)}
        onSearch={setSearchTerm}
        onCategoryFilter={setCategoryFilter}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        totalProducts={products.length}
      />

      {/* Error Display */}
      {error && (
        <div className="mx-4 my-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
            <button 
              onClick={fetchProducts}
              className="ml-4 text-red-800 hover:text-red-900 underline"
            >
              Повторить
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="flex-1 overflow-hidden">
        <ProductsTable 
          products={products}
          loading={loading}
          onRefresh={fetchProducts}
          onEdit={(product) => {
            setEditingProduct(product);
            setShowEditModal(true);
          }}
          onDelete={handleDeleteProduct}
        />
      </div>

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

      {/* ✈️ ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
      <UniversalAirborneButton
        module="products"
        apiEndpoint="/api/company/products"
        itemName="товар"
        lastItemsCount={5}
        onSuccess={handleAirborneSuccess}
        onError={handleAirborneError}
      />
    </div>
  );
};

export default ProductsPage;