// f/src/pages/company/dashboard/DashkaPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompanyLayout from '../../../components/company/CompanyLayout';

const DashkaPage: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');

  useEffect(() => {
    const name = localStorage.getItem('currentCompanyName') || 'Unknown Company';
    const id = localStorage.getItem('currentCompanyId') || '0';
    setCompanyName(name);
    setCompanyId(id);
  }, []);

  return (
    
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-1500">📊 Dashka Analytics</h1>
          <p className="text-gray-600 mt-1">
            Welcome to {companyName} (ID: {companyId})
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Partners</p>
                <p className="text-3xl font-bold">42</p>
              </div>
              <div className="text-4xl opacity-150">👥</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Annual Income</p>
                <p className="text-3xl font-bold">€159,650</p>
              </div>
              <div className="text-4xl opacity-150">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Active Deals</p>
                <p className="text-3xl font-bold">25</p>
              </div>
              <div className="text-4xl opacity-150">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Staff Count</p>
                <p className="text-3xl font-bold">15</p>
              </div>
              <div className="text-4xl opacity-150">👨‍💼</div>
            </div>
          </div>
        </div>

        {/* Dashka Actions and Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Dashka Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-1500 mb-4">
              🚀 Dashka Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/clients"
                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">👥</span>
                <span className="text-sm font-medium">Add Partner</span>
              </Link>
              
              <Link
                to="/products"
                className="flex items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">📦</span>
                <span className="text-sm font-medium">Services</span>
              </Link>

              <Link
                to="/sales"
                className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">💼</span>
                <span className="text-sm font-medium">Contracts</span>
              </Link>

              <Link
                to="/purchases"
                className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">🛒</span>
                <span className="text-sm font-medium">Acquisitions</span>
              </Link>
                
              <Link
                to="/warehouse"
                className="flex items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">🏭</span>
                <span className="text-sm font-medium">Storage</span>
              </Link>

              <Link
                to="/chart-of-accounts"
                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">📊</span>
                <span className="text-sm font-medium">Financial Plan</span>
              </Link>
              
              <Link
                to="/banking"
                className="flex items-center justify-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">🏦</span>
                <span className="text-sm font-medium">Treasury</span>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="text-2xl mr-2">⚙️</span>
                <span className="text-sm font-medium">Configuration</span>
              </Link>
            </div>
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-1500">📦 Services</h3>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-1500 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/products"
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-green-600">➕</span>
                  <span className="font-medium text-gray-1500">Add New Product</span>
                </div>
                <span className="text-green-600">→</span>
              </Link>
              
              <Link
                to="/products"
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-blue-600">📋</span>
                  <span className="font-medium text-gray-1500">Manage Catalog</span>
                </div>
                <span className="text-blue-600">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Updates and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Updates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-1500 mb-4">
              📈 Latest Updates
            </h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-15 h-15 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  A
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-1500">New partner onboarded</p>
                  <p className="text-sm text-gray-600">DASHKA Solutions - 1 hour ago</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-15 h-15 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  €
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-1500">Contract signed</p>
                  <p className="text-sm text-gray-600">€5,780 from Innovation Labs - 3 hours ago</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-15 h-15 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  📦
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-1500">Product updated</p>
                  <p className="text-sm text-gray-600">Solar Panel Pro - 6 hours ago</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-15 h-15 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-1500">Team member joined</p>
                  <p className="text-sm text-gray-600">Sarah Johnson - Yesterday</p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-1500 mb-4">
              ⚡ Platform Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Server Health</span>
                <span className="bg-green-100 text-green-1500 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Health</span>
                <span className="bg-green-100 text-green-1500 px-2 py-1 rounded-full text-xs font-medium">
                  ✅ Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Storage Used</span>
                <span className="bg-blue-100 text-blue-1500 px-2 py-1 rounded-full text-xs font-medium">
                  4.7 GB / 20 GB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Online Users</span>
                <span className="bg-purple-100 text-purple-1500 px-2 py-1 rounded-full text-xs font-medium">
                  15 online
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Company Performance</p>
                  <div className="text-2xl font-bold text-green-600">915.5%</div>
                  <p className="text-xs text-gray-500">Overall system efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default DashkaPage;