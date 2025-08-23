// f/src/pages/company/chart-of-accounts/components/AccountsToolbar.tsx
import React, { useState, useEffect } from 'react';
import { AccountsToolbarProps, ACCOUNT_TYPES } from '../types/chartTypes';

const AccountsToolbar: React.FC<AccountsToolbarProps> = ({
  onAddAccount,
  onImportLithuanian,
  onSearch,
  onTypeFilter,
  onActiveFilter,
  searchTerm,
  typeFilter,
  activeFilter,
  totalAccounts
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, onSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setLocalSearchTerm('');
    onSearch('');
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Main Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left Side - Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add Account Button */}
          <button
            onClick={onAddAccount}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <span className="mr-2">➕</span>
            Add Account
          </button>

          {/* Import Lithuanian Button */}
          <button
            onClick={onImportLithuanian}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <span className="mr-2">📤</span>
            Import Lithuanian
          </button>

          {/* Export Button */}
          <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
            <span className="mr-2">📊</span>
            Export
          </button>

          {/* Total Accounts Info */}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <span className="text-gray-600 text-sm mr-2">📋</span>
            <span className="text-sm font-medium text-gray-700">
              {totalAccounts} accounts total
            </span>
          </div>
        </div>

        {/* Right Side - Search */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              value={localSearchTerm}
              onChange={handleSearchChange}
              placeholder="Search accounts..."
              className="w-64 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localSearchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            🔄
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        
        {/* Account Type Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Types</option>
            {ACCOUNT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={activeFilter}
            onChange={(e) => onActiveFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Lithuanian Class Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Class:</label>
          <select className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
            <option value="">All Classes</option>
            <option value="1">Class 1 - Non-current Assets</option>
            <option value="2">Class 2 - Current Assets</option>
            <option value="4">Class 4 - Equity</option>
            <option value="5">Class 5 - Liabilities</option>
            <option value="6">Class 6 - Expenses</option>
            <option value="7">Class 7 - Income</option>
            <option value="8">Class 8 - Results</option>
            <option value="9">Class 9 - Management</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(typeFilter || activeFilter || searchTerm) && (
          <button
            onClick={() => {
              onTypeFilter('');
              onActiveFilter('');
              onSearch('');
              setLocalSearchTerm('');
            }}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <span className="mr-1">✕</span>
            Clear Filters
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* View Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm">📋 Table</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 text-sm">🌳 Tree</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 text-sm">📊 Cards</button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {(typeFilter || activeFilter || searchTerm) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Search: "{searchTerm}"
              </span>
            )}
            
            {typeFilter && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Type: {ACCOUNT_TYPES.find(t => t.value === typeFilter)?.label || typeFilter}
              </span>
            )}
            
            {activeFilter && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                Status: {activeFilter === 'true' ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsToolbar;