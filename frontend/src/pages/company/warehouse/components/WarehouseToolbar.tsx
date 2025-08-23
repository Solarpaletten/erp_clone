// f/src/pages/company/warehouse/components/WarehouseToolbar.tsx
import React from 'react';
import { WarehouseFilter } from '../types/warehouseTypes';

interface WarehouseToolbarProps {
  filters: WarehouseFilter;
  onFiltersChange: (filters: WarehouseFilter) => void;
  onAddWarehouse: () => void;
  onExport: () => void;
  totalCount: number;
  loading: boolean;
}

const WarehouseToolbar: React.FC<WarehouseToolbarProps> = ({
  filters,
  onFiltersChange,
  onAddWarehouse,
  onExport,
  totalCount,
  loading
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? undefined : e.target.value;
    onFiltersChange({ ...filters, status: value as any, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sort_by, sort_order] = e.target.value.split(':');
    onFiltersChange({ 
      ...filters, 
      sort_by, 
      sort_order: sort_order as 'asc' | 'desc',
      page: 1 
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 50,
      sort_by: 'name',
      sort_order: 'asc'
    });
  };

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-gray-900">🔍 Warehouse Filters</h2>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Filters Applied
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading...
              </div>
            ) : (
              `${totalCount} warehouse${totalCount !== 1 ? 's' : ''} found`
            )}
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Warehouses
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters.search || ''}
              onChange={handleSearchChange}
              placeholder="Search by name, code, or address..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">✅ Active</option>
            <option value="INACTIVE">⏸️ Inactive</option>
            <option value="MAINTENANCE">🔧 Maintenance</option>
          </select>
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={`${filters.sort_by}:${filters.sort_order}`}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name:asc">📝 Name (A-Z)</option>
            <option value="name:desc">📝 Name (Z-A)</option>
            <option value="code:asc">🔢 Code (A-Z)</option>
            <option value="code:desc">🔢 Code (Z-A)</option>
            <option value="status:asc">📊 Status (A-Z)</option>
            <option value="status:desc">📊 Status (Z-A)</option>
            <option value="created_at:desc">📅 Newest First</option>
            <option value="created_at:asc">📅 Oldest First</option>
            <option value="updated_at:desc">🔄 Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
        <button
          onClick={() => onFiltersChange({ ...filters, status: 'ACTIVE', page: 1 })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 ring-2 ring-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✅ Active Only
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, status: 'MAINTENANCE', page: 1 })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.status === 'MAINTENANCE'
              ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔧 Maintenance
        </button>
        <button
          onClick={() => onFiltersChange({ ...filters, search: 'main', page: 1 })}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            filters.search === 'main'
              ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ⭐ Main Warehouses
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              🔄 Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExport}
            disabled={loading || totalCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded-lg transition-colors"
          >
            📊 Export CSV
          </button>
          <button
            onClick={onAddWarehouse}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            ➕ Add Warehouse
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="text-sm text-gray-500 bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              {hasActiveFilters ? (
                <span>
                  Showing {totalCount} warehouse{totalCount !== 1 ? 's' : ''} matching your filters
                </span>
              ) : (
                <span>
                  Showing all {totalCount} warehouse{totalCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                ✅ <strong>Active</strong>
              </span>
              <span className="flex items-center gap-1">
                🔧 <strong>Maintenance</strong>
              </span>
              <span className="flex items-center gap-1">
                ⭐ <strong>Main</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseToolbar;