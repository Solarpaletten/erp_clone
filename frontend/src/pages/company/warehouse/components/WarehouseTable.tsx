// f/src/pages/company/warehouse/components/WarehouseTable.tsx
import React from 'react';
import { Warehouse } from '../types/warehouseTypes';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  loading: boolean;
  onView: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onInventory: (warehouse: Warehouse) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({ 
  warehouses, 
  loading, 
  onView, 
  onEdit, 
  onDelete, 
  onInventory,
  sortBy,
  sortOrder,
  onSort 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🏭</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Warehouses Found</h3>
        <p className="text-gray-500 mb-6">Create your first warehouse to start managing inventory</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
          Create Warehouse
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', text: 'Active', icon: '✅' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', text: 'Inactive', icon: '⏸️' },
      'MAINTENANCE': { color: 'bg-yellow-100 text-yellow-800', text: 'Maintenance', icon: '🔧' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleSort = (field: string) => {
    onSort(field);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          🏭 Warehouses ({warehouses.length})
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Warehouse {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('code')}
              >
                <div className="flex items-center gap-1">
                  Code {getSortIcon('code')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status {getSortIcon('status')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="flex items-center gap-2">
                      {warehouse.is_main && (
                        <span className="text-amber-500 text-lg" title="Main Warehouse">
                          ⭐
                        </span>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {warehouse.name}
                      </div>
                    </div>
                    {warehouse.address && (
                      <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        📍 {warehouse.address}
                      </div>
                    )}
                    {warehouse.description && (
                      <div className="text-xs text-gray-400 mt-1">
                        {warehouse.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {warehouse.code || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {warehouse.manager ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        👤 {warehouse.manager.first_name} {warehouse.manager.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {warehouse.manager.email}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">
                      No manager assigned
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(warehouse.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      📤 <span className="font-medium">{warehouse._count?.sales || 0}</span> Sales
                    </div>
                    <div className="flex items-center gap-1">
                      📥 <span className="font-medium">{warehouse._count?.purchases || 0}</span> Purchases
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => onInventory(warehouse)}
                      className="text-purple-600 hover:text-purple-900 transition-colors flex items-center gap-1"
                      title="View Inventory"
                    >
                      📦 Inventory
                    </button>
                    <button
                      onClick={() => onView(warehouse)}
                      className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                      title="View Details"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => onEdit(warehouse)}
                      className="text-green-600 hover:text-green-900 transition-colors flex items-center gap-1"
                      title="Edit Warehouse"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => onDelete(warehouse)}
                      className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                      title="Delete Warehouse"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer with totals */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Showing {warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              ✅ Active: {warehouses.filter(w => w.status === 'ACTIVE').length}
            </span>
            <span className="flex items-center gap-1">
              ⭐ Main: {warehouses.filter(w => w.is_main).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseTable;