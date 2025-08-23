// f/src/pages/company/products/components/ProductsToolbar.tsx
import React, { useState, useEffect } from 'react';
import { ProductsToolbarProps } from '../types/productsTypes';

const ProductsToolbar: React.FC<ProductsToolbarProps> = ({
  onAddProduct,
  onSearch,
  onCategoryFilter,
  searchTerm,
  categoryFilter,
  totalProducts
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearch]);

  const categories = [
    'All Categories',
    'Solar Equipment', 
    'Electronics',
    'Tools',
    'Services',
    'Materials',
    'Accessories'
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented soon!');
  };

  const handleImport = () => {
    // TODO: Implement import functionality
    alert('Import functionality will be implemented soon!');
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onAddProduct}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 font-medium"
          >
            <span>➕</span>
            <span>Add Product</span>
          </button>
          
          <button 
            onClick={handleImport}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Import</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <span>📤</span>
            <span>Export</span>
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-600 ml-4">
            <span>📦</span>
            <span>{totalProducts} products total</span>
          </div>
        </div>

        {/* Right side - Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            
            {/* Clear search button */}
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {(searchTerm || categoryFilter) && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            
            {searchTerm && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button 
                  onClick={() => {
                    setLocalSearchTerm('');
                    onSearch('');
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ✕
                </button>
              </span>
            )}
            
            {categoryFilter && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Category: {categoryFilter}
                <button 
                  onClick={() => onCategoryFilter('')}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </span>
            )}
            
            <button 
              onClick={() => {
                setLocalSearchTerm('');
                onSearch('');
                onCategoryFilter('');
              }}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsToolbar;