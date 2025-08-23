import React, { useState, useEffect } from 'react';

interface Sale {
  id: number;
  date: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
}

const SalesPage: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Простая загрузка данных (как в ProductsPage)
    setTimeout(() => {
      setSales([
        {
          id: 1,
          date: '2025-08-06',
          customer: 'ASSET BILANS SPOLKA',
          product: 'RESIDUES TECHNICAL OIL',
          quantity: 15,
          price: 850,
          total: 12750,
          status: 'Completed'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddSale = () => {
    const newSale: Sale = {
      id: sales.length + 1,
      date: new Date().toISOString().split('T')[0],
      customer: 'New Customer',
      product: 'RESIDUES TECHNICAL OIL',
      quantity: 5,
      price: 900,
      total: 4500,
      status: 'Pending'
    };
    
    setSales([...sales, newSale]);
    console.log('💰 Sale added - should deduct from warehouse!');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header - простой как в ProductsPage */}
      <div className="bg-green-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">💰 Sales Management</h1>
            <p className="text-green-100">Manage sales orders and customer relationships</p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Revenue tracking</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - простые как в ProductsPage */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{sales.length}</p>
              <p className="text-xs text-gray-500">Sales</p>
            </div>
            <div className="text-green-500 text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {sales.filter(s => s.status === 'Completed').length}
              </p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-green-500 text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {sales.filter(s => s.status === 'Pending').length}
              </p>
              <p className="text-xs text-gray-500">Orders</p>
            </div>
            <div className="text-orange-500 text-2xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                €{sales.reduce((sum, s) => sum + s.total, 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">EUR</p>
            </div>
            <div className="text-purple-500 text-2xl">💰</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(sales.map(s => s.customer)).size}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-teal-500 text-2xl">👥</div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={handleAddSale}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <span className="text-lg">➕</span>
          Add Sale
        </button>
      </div>

      {/* Table - простая как в ProductsPage */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
          <button className="text-green-600 hover:text-green-800">
            🔄 Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sale.quantity} T
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{sale.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    €{sale.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-600 hover:text-green-800 mr-3">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {sales.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">💰</div>
              <p className="text-gray-500">No sales found</p>
              <button 
                onClick={handleAddSale}
                className="mt-4 text-green-600 hover:text-green-800"
              >
                Add your first sale
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Integration Status */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="text-green-400 text-lg mr-3">🎯</div>
          <div className="flex-1">
            <h4 className="text-green-800 font-medium mb-2">Sales Flow Integration:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• ✅ Create sales orders</li>
              <li>• 🔄 Auto-deduct from warehouse (coming soon)</li>
              <li>• 📊 Real-time revenue tracking</li>
              <li>• 👥 Customer relationship management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
