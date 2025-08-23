// f/src/pages/company/products/components/ProductsStats.tsx
import React from 'react';
import { ProductsStats as Stats } from '../types/productsTypes';

interface ProductsStatsProps {
  stats: Stats;
}

const ProductsStats: React.FC<ProductsStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600 font-medium">Total Products</div>
        </div>
        
        {/* Active Products */}
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600 font-medium">Active</div>
        </div>
        
        {/* Inactive Products */}
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600 font-medium">Inactive</div>
        </div>
        
        {/* Low Stock */}
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
          <div className="text-sm text-gray-600 font-medium">Low Stock</div>
        </div>
        
        {/* Stock Value */}
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.totalStockValue)}
          </div>
          <div className="text-sm text-gray-600 font-medium">Stock Value</div>
        </div>
        
        {/* Categories */}
        <div className="text-center p-3 bg-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{stats.categories.length}</div>
          <div className="text-sm text-gray-600 font-medium">Categories</div>
        </div>
      </div>

      {/* Categories breakdown */}
      {stats.categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories Breakdown:</h3>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {category.name}: {category.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsStats;