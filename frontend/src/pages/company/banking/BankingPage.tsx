// f/src/pages/company/banking/BankingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLayout from '../../../components/company/CompanyLayout.tsx';
import { api } from '../../../api/axios';

interface BankAccount {
  id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  balance: number;
  is_active: boolean;
  created_at: string;
}

const BankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Company Context
  const [companyName, setCompanyName] = useState<string>('');

  // Form data
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    currency: 'EUR',
    initial_balance: 0
  });

  useEffect(() => {
    const name = localStorage.getItem('currentCompanyName') || 'Unknown Company';
    setCompanyName(name);
    // Временно используем mock данные
    setAccounts([
      {
        id: 1,
        account_name: 'Main Business Account',
        account_number: 'DE89 3704 0044 0532 0130 00',
        bank_name: 'Deutsche Bank AG',
        currency: 'EUR',
        balance: 15750.50,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        account_name: 'USD Operations',
        account_number: 'US64 NWBK 6016 1331 9268 19',
        bank_name: 'Chase Bank',
        currency: 'USD',
        balance: 8450.00,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]);
    setLoading(false);
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🏦 Creating bank account:', formData);
    
    // Mock создание счета
    const newAccount: BankAccount = {
      id: accounts.length + 1,
      ...formData,
      balance: formData.initial_balance,
      is_active: true,
      created_at: new Date().toISOString()
    };
    
    setAccounts([...accounts, newAccount]);
    setFormData({
      account_name: '',
      account_number: '',
      bank_name: '',
      currency: 'EUR',
      initial_balance: 0
    });
    setShowCreateForm(false);
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">Loading banking data...</span>
        </div>
      </CompanyLayout>
    );
  }

  return (
    
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🏦 Banking</h1>
            <p className="text-gray-600 mt-1">
              Manage bank accounts for {companyName}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            ➕ Add Bank Account
          </button>
        </div>

        {/* Bank Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {account.account_name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {account.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Bank:</strong> {account.bank_name}</p>
                  <p><strong>Account:</strong> {account.account_number}</p>
                  <p><strong>Currency:</strong> {account.currency}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="text-2xl font-bold text-gray-800">
                    {account.balance.toLocaleString()} {account.currency}
                  </div>
                  <div className="text-sm text-gray-500">Current Balance</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm">
                    View Details
                  </button>
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm">
                    Transfer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No bank accounts found</p>
              <p className="text-gray-400 mt-2">Create your first bank account to get started</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Balance</h3>
            <div className="text-3xl font-bold">
              {accounts.reduce((sum, acc) => sum + (acc.currency === 'EUR' ? acc.balance : 0), 0).toLocaleString()} EUR
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Active Accounts</h3>
            <div className="text-3xl font-bold">
              {accounts.filter(acc => acc.is_active).length}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Currencies</h3>
            <div className="text-3xl font-bold">
              {new Set(accounts.map(acc => acc.currency)).size}
            </div>
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  🏦 Add Bank Account
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.account_name}
                    onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Main Business Account"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.account_number}
                    onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="DE89 3704 0044 0532 0130 00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Deutsche Bank AG"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                      <option value="PLN">PLN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Balance
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.initial_balance}
                      onChange={(e) => setFormData({...formData, initial_balance: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default BankingPage;
