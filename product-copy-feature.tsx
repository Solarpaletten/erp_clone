import React, { useState, useEffect } from 'react';
import { Copy, Edit, Trash2, Search, Plus, Download, Upload } from 'lucide-react';

const ProductsManagement = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      code: 'Residues technical rapeseed oil 1',
      name: 'Residues technical rapeseed oil 1',
      description: 'DE Residues technical rapeseed oil 1',
      category: 'Solar Equipment',
      unit: 'pcs',
      price: 710.00,
      cost: 710.00,
      stock: 0,
      status: 'Active'
    },
    {
      id: 2,
      code: 'OIL-002',
      name: 'Residues technical rapeseed oil new',
      description: 'Технические остатки рапсового масла',
      category: 'Solar Equipment', 
      unit: 't',
      price: 655.00,
      cost: 657.00,
      stock: 0,
      status: 'Inactive'
    }
  ]);

  const [selectedProducts, setSelectedProducts] = useState([1, 2]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [productToCopy, setProductToCopy] = useState(null);

  // Функция копирования продукта
  const handleCopyProduct = (product) => {
    setProductToCopy(product);
    setShowCopyModal(true);
  };

  // Создание копии продукта
  const createProductCopy = (copyData) => {
    const newProduct = {
      ...productToCopy,
      id: Date.now(),
      code: copyData.code,
      name: copyData.name,
      description: copyData.description || productToCopy.description,
      price: copyData.price || productToCopy.price,
      cost: copyData.cost || productToCopy.cost,
      status: 'Active'
    };

    setProducts([...products, newProduct]);
    setShowCopyModal(false);
    setProductToCopy(null);
  };

  const CopyModal = () => {
    const [copyData, setCopyData] = useState({
      code: productToCopy ? `${productToCopy.code}_copy` : '',
      name: productToCopy ? `${productToCopy.name} (Copy)` : '',
      description: productToCopy?.description || '',
      price: productToCopy?.price || 0,
      cost: productToCopy?.cost || 0
    });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Copy Product</h3>
              <button 
                onClick={() => setShowCopyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  value={copyData.code}
                  onChange={(e) => setCopyData({...copyData, code: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={copyData.name}
                  onChange={(e) => setCopyData({...copyData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={copyData.description}
                  onChange={(e) => setCopyData({...copyData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={copyData.price}
                    onChange={(e) => setCopyData({...copyData, price: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                  <input
                    type="number"
                    value={copyData.cost}
                    onChange={(e) => setCopyData({...copyData, cost: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createProductCopy(copyData)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Copy size={16} />
                <span>Create Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4">
            <h1 className="text-xl font-bold">📦 Products Management</h1>
            <p className="text-blue-100">Manage your product catalog</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-500">Total Products</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{products.filter(p => p.status === 'Active').length}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{products.filter(p => p.status === 'Inactive').length}</div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{products.filter(p => p.stock === 0).length}</div>
              <div className="text-sm text-gray-500">Low Stock</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">€NaN</div>
              <div className="text-sm text-gray-500">Stock Value</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-3">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                <Plus size={16} />
                <span>Add Product</span>
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                <Upload size={16} />
                <span>Import</span>
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                <Download size={16} />
                <span>Export</span>
              </button>
              <span className="text-sm text-gray-500 flex items-center">
                🏷️ {selectedProducts.length} products total
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-md px-3 py-2 bg-white">
                <option>All Categories</option>
                <option>Solar Equipment</option>
              </select>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{products.length} products • {selectedProducts.length} selected</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">🔄 Refresh</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 p-4 text-left">
                    <input type="checkbox" className="rounded" checked readOnly />
                  </th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CODE 🔽</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAME 🔽</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UNIT</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE 🔽</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">COST</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STOCK</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => {}}
                      />
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{product.code}</td>
                    <td className="p-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{product.category}</td>
                    <td className="p-4 text-sm text-gray-500">{product.unit}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">€{product.price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-gray-500">€{product.cost.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-center">{product.stock}</div>
                      <div className="text-xs text-red-500 text-center">Low stock!</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleCopyProduct(product)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                          title="Copy Product"
                        >
                          <Copy size={16} />
                        </button>
                        <button className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50">
                          <Edit size={16} />
                        </button>
                        <button className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyModal && <CopyModal />}
    </div>
  );
};

export default ProductsManagement;