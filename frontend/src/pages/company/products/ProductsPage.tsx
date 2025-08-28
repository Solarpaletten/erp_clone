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

const ProductsPage: React.FC = () => {
  // ===============================================
  // 🏗️ STATE MANAGEMENT
  // ===============================================
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ===============================================
  // 📡 API FUNCTIONS
  // ===============================================
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get<ProductsResponse>('/api/company/products', {
        params: {
          search: searchTerm || undefined,
          category: categoryFilter || undefined,
          page: currentPage,
          limit: 50
        }
      });

      if (response.data.success) {
        setProducts(response.data.products || []);
      } else {
        setError('Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<ProductsStatsResponse>('/api/company/products/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateProduct = async (formData: ProductFormData) => {
    try {
      const response = await api.post('/api/company/products', formData);
      
      if (response.data.success) {
        setShowAddModal(false);
        await fetchProducts();
        await fetchStats();
      } else {
        throw new Error(response.data.message || 'Failed to create product');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Failed to create product');
    }
  };

  const handleEditProduct = async (id: number, formData: ProductFormData) => {
    try {
      const response = await api.put(`/api/company/products/${id}`, formData);
      
      if (response.data.success) {
        setShowEditModal(false);
        setEditingProduct(null);
        await fetchProducts();
        await fetchStats();
      } else {
        throw new Error(response.data.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/company/products/${id}`);
      
      if (response.data.success) {
        await fetchProducts();
        await fetchStats();
      } else {
        throw new Error(response.data.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // ===============================================
  // 🔄 EFFECTS
  // ===============================================
  
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // ===============================================
  // 🎨 RENDER
  // ===============================================

  return (
    
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">📦 Products Management</h1>
            <p className="text-blue-100 text-sm">Manage your product catalog</p>
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
            </div>
          </div>
        )}

        {/* Table */}
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


        {/* ВОЗДУШНАЯ ПЛАВАЮЩАЯ КНОПКА */}
        <AirborneProductCopy onProductCreated={fetchProducts} />
      </div>
    </CompanyLayout>
  );
};


export default ProductsPage;