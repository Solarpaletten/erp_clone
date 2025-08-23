// f/src/pages/company/chart-of-accounts/ChartOfAccountsPage.tsx
import React, { useState, useEffect } from 'react';
import CompanyLayout from '../../../components/company/CompanyLayout.tsx';
import AccountsStats from './components/AccountsStats';
import AccountsToolbar from './components/AccountsToolbar';
import AccountsTable from './components/AccountsTable';
import AddAccountModal from './components/AddAccountModal';
import EditAccountModal from './components/EditAccountModal';
import ImportLithuanianModal from './components/ImportLithuanianModal';
import { ChartAccount, AccountFormData, AccountsStats as StatsType } from './types/chartTypes';

const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartAccount | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // API Base URL
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    const companyId = localStorage.getItem('currentCompanyId');
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-company-id': companyId || '4'
    };
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (typeFilter) queryParams.append('account_type', typeFilter);
      if (activeFilter) queryParams.append('is_active', activeFilter);

      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts?${queryParams}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts/stats`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Create account
  const handleCreateAccount = async (formData: AccountFormData) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      setShowAddModal(false);
      await fetchAccounts();
      await fetchStats();
    } catch (error) {
      console.error('Error creating account:', error);
      alert(error instanceof Error ? error.message : 'Failed to create account');
    }
  };

  // Edit account
  const handleEditAccount = async (id: number, formData: AccountFormData) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts/${id}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update account');
      }

      setShowEditModal(false);
      setEditingAccount(null);
      await fetchAccounts();
      await fetchStats();
    } catch (error) {
      console.error('Error updating account:', error);
      alert(error instanceof Error ? error.message : 'Failed to update account');
    }
  };

  // Delete account
  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      await fetchAccounts();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  // Import Lithuanian chart
  const handleImportLithuanian = async () => {
    try {
      setImportLoading(true);
      
      const response = await fetch(
        `${API_BASE}/api/company/chart-of-accounts/import-lithuanian`,
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import Lithuanian chart');
      }

      const data = await response.json();
      alert(`Successfully imported: ${data.imported} accounts, ${data.skipped} skipped`);
      
      setShowImportModal(false);
      await fetchAccounts();
      await fetchStats();
    } catch (error) {
      console.error('Error importing Lithuanian chart:', error);
      alert(error instanceof Error ? error.message : 'Failed to import Lithuanian chart');
    } finally {
      setImportLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, [searchTerm, typeFilter, activeFilter]);

  return (
   
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">📊 Chart of Accounts</h1>
              <p className="text-purple-100 text-sm">Manage your accounting structure</p>
            </div>
            <button className="bg-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
              Lithuanian Standard
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && <AccountsStats stats={stats} />}

        {/* Toolbar */}
        <AccountsToolbar 
          onAddAccount={() => setShowAddModal(true)}
          onImportLithuanian={() => setShowImportModal(true)}
          onSearch={setSearchTerm}
          onTypeFilter={setTypeFilter}
          onActiveFilter={setActiveFilter}
          searchTerm={searchTerm}
          typeFilter={typeFilter}
          activeFilter={activeFilter}
          totalAccounts={accounts.length}
        />

        {/* Error Display */}
        {error && (
          <div className="mx-4 my-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <AccountsTable 
            accounts={accounts}
            loading={loading}
            onRefresh={fetchAccounts}
            onEdit={(account) => {
              setEditingAccount(account);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteAccount}
          />
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddAccountModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateAccount}
          />
        )}

        {showEditModal && editingAccount && (
          <EditAccountModal
            account={editingAccount}
            onClose={() => {
              setShowEditModal(false);
              setEditingAccount(null);
            }}
            onSubmit={(formData) => handleEditAccount(editingAccount.id, formData)}
          />
        )}

        {showImportModal && (
          <ImportLithuanianModal
            onClose={() => setShowImportModal(false)}
            onConfirm={handleImportLithuanian}
            loading={importLoading}
          />
        )}
      </div>
    
  );
};

export default ChartOfAccountsPage;