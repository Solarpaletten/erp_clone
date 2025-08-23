// f/src/pages/company/warehouse/components/WarehouseStats.tsx
import React from 'react';
import { WarehouseStats } from '../types/warehouseTypes';

interface WarehouseStatsProps {
  stats: WarehouseStats;
  loading?: boolean;
}

const WarehouseStatsComponent: React.FC<WarehouseStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: 'Total Warehouses',
      value: stats.total_warehouses || 0,
      icon: '🏭',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-400',
      textColor: 'text-blue-100',
      description: 'All registered warehouses'
    },
    {
      title: 'Active Warehouses',
      value: stats.active_warehouses || 0,
      icon: '✅',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-400',
      textColor: 'text-green-100',
      description: 'Currently operational',
      percentage: stats.total_warehouses > 0 ? Math.round((stats.active_warehouses / stats.total_warehouses) * 100) : 0
    },
    {
      title: 'Total Products',
      value: stats.total_products || 0,
      icon: '📦',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-400',
      textColor: 'text-purple-100',
      description: 'Items in inventory'
    },
    {
      title: 'Low Stock Items',
      value: stats.low_stock_items || 0,
      icon: '⚠️',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-400',
      textColor: 'text-orange-100',
      description: 'Need restocking',
      alert: (stats.low_stock_items || 0) > 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <div
          key={index}
          className={`bg-gradient-to-r ${item.gradient} rounded-lg p-6 text-white relative overflow-hidden transition-transform hover:scale-105`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-4 -right-4 text-6xl">{item.icon}</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className={`${item.textColor} text-sm font-medium mb-1`}>
                  {item.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">
                    {item.value.toLocaleString()}
                  </p>
                  {item.percentage !== undefined && (
                    <span className="text-sm opacity-80">
                      ({item.percentage}%)
                    </span>
                  )}
                </div>
                <p className={`${item.textColor} text-xs mt-1 opacity-90`}>
                  {item.description}
                </p>
              </div>
              <div className={`${item.bgColor} rounded-full p-3 shadow-lg`}>
                <span className="text-2xl">{item.icon}</span>
              </div>
            </div>
            
            {/* Alert indicator for low stock */}
            {item.alert && (
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="animate-pulse">🚨</span>
                <span className="font-medium">Attention Required</span>
              </div>
            )}
            
            {/* Progress bar for utilization */}
            {item.percentage !== undefined && (
              <div className="mt-3">
                <div className="bg-white bg-opacity-30 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-500"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WarehouseStatsComponent;