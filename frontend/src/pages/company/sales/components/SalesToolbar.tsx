// f/src/pages/company/sales/components/SalesToolbar.tsx
import React, { useState } from 'react';
import { SalesFilter, PaymentStatus, DeliveryStatus } from '../types/salesTypes';

interface SalesToolbarProps {
  filters: SalesFilter;
  onFiltersChange: (filters: SalesFilter) => void;
  onAddSale?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  totalCount?: number;
  loading?: boolean;
}

const SalesToolbar: React.FC<SalesToolbarProps> = ({
  filters,
  onFiltersChange,
  onAddSale,
  onExport,
  onImport,
  totalCount = 0,
  loading = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      payment_status: undefined,
      delivery_status: undefined,
      client_id: undefined,
      date_from: '',
      date_to: '',
      sort_by: 'document_date',
      sort_order: 'desc'
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.payment_status ||
      filters.delivery_status ||
      filters.client_id ||
      filters.date_from ||
      filters.date_to
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Main Toolbar */}
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Side - Search and Basic Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search sales by document number, client name..."
                  value={filters.search || ''}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {filters.search && (
                  <button
                    onClick={() => onFiltersChange({ ...filters, search: '' })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <span className="text-gray-400 hover:text-gray-600">✕</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={filters.payment_status || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  payment_status: e.target.value as PaymentStatus | undefined 
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Payment</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={filters.delivery_status || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  delivery_status: e.target.value as DeliveryStatus | undefined 
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Delivery</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  showAdvancedFilters || hasActiveFilters()
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                🔧 Filters
                {hasActiveFilters() && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    !
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex gap-2">
            {hasActiveFilters() && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                🔄 Clear
              </button>
            )}
            
            {onImport && (
              <button
                onClick={onImport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                📥 Import
              </button>
            )}
            
            {onExport && (
              <button
                onClick={onExport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                📤 Export
              </button>
            )}
            
            {onAddSale && (
              <button
                onClick={onAddSale}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                ➕ Add Sale
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {totalCount > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Loading...
              </span>
            ) : (
              <span>
                Showing {totalCount} sale{totalCount !== 1 ? 's' : ''}
                {hasActiveFilters() && ' (filtered)'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort_by || 'document_date'}
                onChange={(e) => onFiltersChange({ ...filters, sort_by: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="document_date">Date</option>
                <option value="document_number">Document Number</option>
                <option value="total_amount">Amount</option>
                <option value="client_id">Client</option>
                <option value="payment_status">Payment Status</option>
                <option value="delivery_status">Delivery Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={filters.sort_order || 'desc'}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  sort_order: e.target.value as 'asc' | 'desc' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Advanced Filter Actions */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Advanced filters help you find specific sales quickly
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="px-3 py-1 text-sm bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Hide Filters
              </button>
              {hasActiveFilters() && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesToolbar;