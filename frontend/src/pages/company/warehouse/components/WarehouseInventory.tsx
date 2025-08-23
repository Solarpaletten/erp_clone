// f/src/pages/company/warehouse/components/WarehouseInventory.tsx
import React, { useState, useEffect } from 'react';
import { WarehouseInventoryItem, InventoryFilter, Warehouse } from '../types/warehouseTypes';

interface WarehouseInventoryProps {
  warehouse: Warehouse;
  onClose: () => void;
}

// Mock API service for inventory
const inventoryService = {
  async getInventory(warehouseId: number, filters: InventoryFilter = {}) {
    // Mock data - в реальной версии это будет API запрос
    const mockInventory: WarehouseInventoryItem[] = [
      {
        id: 1,
        code: 'PRD001',
        name: 'Residius Oil Technical',
        unit: 'liter',
        current_stock: 150,
        min_stock: 50,
        price: 80,
        cost_price: 65,
        currency: 'EUR',
        category: 'Oils',
        updated_at: new Date().toISOString(),
        stock_status: 'OK',
        stock_value: 150 * 65
      },
      {
        id: 2,
        code: 'PRD002',
        name: 'Industrial Equipment',
        unit: 'piece',
        current_stock: 25,
        min_stock: 10,
        price: 1200,
        cost_price: 950,
        currency: 'EUR',
        category: 'Equipment',
        updated_at: new Date().toISOString(),
        stock_status: 'OK',
        stock_value: 25 * 950
      },
      {
        id: 3,
        code: 'PRD003',
        name: 'Maintenance Parts',
        unit: 'piece',
        current_stock: 5,
        min_stock: 20,
        price: 45,
        cost_price: 35,
        currency: 'EUR',
        category: 'Parts',
        updated_at: new Date().toISOString(),
        stock_status: 'LOW',
        stock_value: 5 * 35
      },
      {
        id: 4,
        code: 'PRD004',
        name: 'Safety Equipment',
        unit: 'piece',
        current_stock: 0,
        min_stock: 15,
        price: 125,
        cost_price: 100,
        currency: 'EUR',
        category: 'Safety',
        updated_at: new Date().toISOString(),
        stock_status: 'OUT',
        stock_value: 0
      }
    ];

    // Apply filters
    let filtered = mockInventory;
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.code.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search)
      );
    }

    if (filters.low_stock_only) {
      filtered = filtered.filter(item => item.stock_status === 'LOW' || item.stock_status === 'OUT');
    }

    return {
      products: filtered,
      pagination: {
        page: 1,
        limit: 50,
        total: filtered.length,
        pages: 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }
};

const WarehouseInventory: React.FC<WarehouseInventoryProps> = ({ warehouse, onClose }) => {
  const [inventory, setInventory] = useState<WarehouseInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<InventoryFilter>({
    search: '',
    low_stock_only: false,
    page: 1,
    limit: 50
  });

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventory(warehouse.id, filters);
      setInventory(response.products);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [warehouse.id, filters]);

  const getStockStatusBadge = (status: string, current: number, min?: number) => {
    const statusConfig = {
      'OK': { color: 'bg-green-100 text-green-800', text: 'In Stock', icon: '✅' },
      'LOW': { color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock', icon: '⚠️' },
      'OUT': { color: 'bg-red-100 text-red-800', text: 'Out of Stock', icon: '🚨' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['OK'];
    
    return (
      <div className="space-y-1">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
          <span className="mr-1">{config.icon}</span>
          {config.text}
        </span>
        <div className="text-xs text-gray-500">
          {current} / {min || 0} min
        </div>
      </div>
    );
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.stock_value || 0), 0);
  const lowStockCount = inventory.filter(item => item.stock_status === 'LOW' || item.stock_status === 'OUT').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                📦 {warehouse.name} - Inventory
              </h2>
              <p className="text-gray-600 mt-1">
                Current stock levels and inventory management
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{inventory.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">€{totalValue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{lowStockCount}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {inventory.filter(i => i.stock_status === 'OK').length}
              </div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.low_stock_only}
                onChange={(e) => setFilters(prev => ({ ...prev, low_stock_only: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">⚠️ Low stock only</span>
            </label>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : inventory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-500">
                {filters.search || filters.low_stock_only ? 
                  'No items match your search criteria' : 
                  'This warehouse has no inventory items yet'
                }
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Unit: {item.unit}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {item.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStockStatusBadge(item.stock_status || 'OK', item.current_stock, item.min_stock)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          €{item.price.toLocaleString()}
                        </div>
                        {item.cost_price && (
                          <div className="text-xs text-gray-500">
                            Cost: €{item.cost_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        €{(item.stock_value || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          📊 Adjust
                        </button>
                        <button className="text-green-600 hover:text-green-900 transition-colors">
                          📥 Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {inventory.length} items • Total value: €{totalValue.toLocaleString()}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                📊 Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseInventory;