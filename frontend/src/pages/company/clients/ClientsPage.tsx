// f/src/pages/company/clients/ClientsPage.tsx - С ПРАВИЛЬНОЙ АВТОРИЗАЦИЕЙ
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CompanyLayout from '../../../components/company/CompanyLayout.tsx';
import { api } from '../../../api/axios';

// Types
interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  country?: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

interface CreateClientData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  country?: string;
  currency?: string;
}

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Company Context
  const [companyId, setCompanyId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    email: '',
    phone: '',
    role: 'CLIENT',
    country: 'Germany',
    currency: 'EUR',
  });

  // Get company context
  useEffect(() => {
    const id = localStorage.getItem('currentCompanyId') || '0';
    const name =
      localStorage.getItem('currentCompanyName') || 'Unknown Company';
    setCompanyId(id);
    setCompanyName(name);
  }, []);

  // 📡 Load clients with proper authentication
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const currentCompanyId = localStorage.getItem('currentCompanyId');

      if (!token) {
        setError('No authentication token found. Please login.');
        navigate('/login');
        return;
      }

      if (!currentCompanyId || currentCompanyId === '0') {
        setError('No company selected. Please select a company first.');
        // navigate('/account/dashboard');
        return;
      }

      console.log(
        '🔄 Fetching clients with auth for company:',
        currentCompanyId
      );

      // 🎯 ПРАВИЛЬНЫЙ API ЗАПРОС С ТОКЕНОМ И COMPANY ID
      const response = await api.get('/api/company/clients', {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': currentCompanyId,
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ API Response:', response.data);

      if (response.data.success) {
        setClients(response.data.clients || []);
        console.log(
          `✅ Loaded ${response.data.clients?.length || 0} clients from API`
        );
      } else {
        throw new Error(response.data.error || 'Failed to load clients');
      }
    } catch (err: any) {
      console.error('❌ Error fetching clients:', err);

      // Проверяем тип ошибки
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        localStorage.removeItem('auth_token');
        navigate('/login');
        return;
      }

      if (err.response?.status === 400) {
        setError('Company context missing. Please select a company.');
        navigate('/account/dashboard');
        return;
      }

      setError(
        err.response?.data?.error || err.message || 'Failed to load clients'
      );

      // 🎯 FALLBACK MOCK DATA только в case крайней ошибки
      console.log('⚠️ Using fallback mock data');
      setClients([
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+49 123 456 789',
          role: 'CLIENT',
          country: 'Germany',
          currency: 'EUR',
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          email: 'sarah.j@company.com',
          phone: '+49 987 654 321',
          role: 'SUPPLIER',
          country: 'Germany',
          currency: 'EUR',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId && companyId !== '0') {
      fetchClients();
    }
  }, [companyId]);

  // ➕ Create client with authentication
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('auth_token');
      const currentCompanyId = localStorage.getItem('currentCompanyId');

      if (!token || !currentCompanyId) {
        setError('Authentication or company context missing');
        return;
      }

      console.log('➕ Creating client:', formData);

      const response = await api.post('/api/company/clients', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': currentCompanyId,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        await fetchClients(); // Reload clients
        setShowCreateForm(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          role: 'CLIENT',
          country: 'Germany',
          currency: 'EUR',
        });
        console.log('✅ Client created successfully');
      } else {
        throw new Error(response.data.error || 'Failed to create client');
      }
    } catch (err: any) {
      console.error('❌ Error creating client:', err);
      setError(
        err.response?.data?.error || err.message || 'Failed to create client'
      );
    }
  };

  // 🗑️ Delete client
  const handleDeleteClient = async (clientId: number) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const currentCompanyId = localStorage.getItem('currentCompanyId');

      await api.delete(`/api/company/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-company-id': currentCompanyId,
        },
      });

      // Remove from local state
      setClients(clients.filter((c) => c.id !== clientId));
      console.log('✅ Client deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting client:', error);
      setError('Failed to delete client');
    }
  };

  // 🔄 Toggle status
  const handleToggleStatus = async (clientId: number) => {
    try {
      const token = localStorage.getItem('auth_token');
      const currentCompanyId = localStorage.getItem('currentCompanyId');
      const client = clients.find((c) => c.id === clientId);
      if (!client) return;

      const newStatus = !client.is_active;

      await api.put(
        `/api/company/clients/${clientId}`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-company-id': currentCompanyId,
          },
        }
      );

      setClients(
        clients.map((c) =>
          c.id === clientId ? { ...c, is_active: newStatus } : c
        )
      );

      console.log('✅ Client status updated');
    } catch (error: any) {
      console.error('❌ Error updating client status:', error);
      setError('Failed to update client status');
    }
  };

  // Filter clients
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (

      <div className="p-6">
        {/* Company Context Display */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-blue-800">
                Managing Clients for:
              </span>
              <span className="ml-2 font-semibold text-blue-900">
                {companyName}
              </span>
              <span className="ml-2 text-xs text-blue-600">
                (Company ID: {companyId})
              </span>
            </div>
            <div className="text-sm text-blue-700">
              {filteredClients.length} client
              {filteredClients.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                👥 Clients Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your company clients</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              ➕ Add Client
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2">❌</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        )}

        {/* Create Client Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  ➕ Add New Client
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="client@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+49 123 456 7890"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="SUPPLIER">Supplier</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="PLN">PLN</option>
                    </select>
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
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Clients Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Clients ({filteredClients.length})
              </h3>
            </div>

            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No clients found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Start by adding your first client'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    ➕ Add First Client
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr
                        key={client.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <Link
                                to={`/clients/${client.id}`}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {client.name}
                              </Link>
                              <div className="text-sm text-gray-500">
                                ID: {client.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="text-sm text-gray-500">
                              {client.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              client.role === 'CLIENT'
                                ? 'bg-blue-100 text-blue-800'
                                : client.role === 'SUPPLIER'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {client.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(client.id)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                              client.is_active
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {client.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(client.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                console.log('View client:', client.id)
                              }
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() =>
                                console.log('Edit client:', client.id)
                              }
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {!loading && clients.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-800">
                    {clients.length}
                  </div>
                  <div className="text-gray-600">Total Clients</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xl">
                  ✅
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-800">
                    {clients.filter((c) => c.is_active).length}
                  </div>
                  <div className="text-gray-600">Active Clients</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                  🤝
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-800">
                    {clients.filter((c) => c.role === 'SUPPLIER').length}
                  </div>
                  <div className="text-gray-600">Suppliers</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

  );
};

export default ClientsPage;
