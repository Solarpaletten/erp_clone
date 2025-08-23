import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { api } from '../../../api/axios';

interface Client {
  id: number;
  name: string;
  email: string;
  code: string;
  vat_code: string;
  phone: string;
  registrationDate: string;
  isActive?: boolean;
}

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const currentCompanyId = localStorage.getItem('currentCompanyId');
        
        const response = await api.get(`/api/company/clients/${id}`);
        setClient(response.data);
      } catch (err) {
        console.error('Error fetching client:', err);
        setError('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/company/clients/${id}`);
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f7931e]"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-red-600">{error || 'Client not found'}</p>
        <Link
          to="/clients"
          className="mt-4 inline-flex items-center text-[#f7931e] hover:text-[#e67e00]"
        >
          <FaArrowLeft className="mr-2" />
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to="/clients"
            className="inline-flex items-center text-[#f7931e] hover:text-[#e67e00]"
          >
            <FaArrowLeft className="mr-2" />
            Back to Clients
          </Link>

          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/api/company/clients/${id}/edit`)}
              className="inline-flex items-center px-4 py-2 bg-[#f7931e] text-white rounded hover:bg-[#e67e00]"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h1 className="text-2xl font-semibold text-gray-800">
              {client.name}
            </h1>
            <div className="flex items-center mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {client.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ID: {client.id}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Contact Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">
                  Business Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-medium">
                      {client.code !== '-' ? client.code : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">VAT Code</p>
                    <p className="font-medium">
                      {client.vat_code !== '-'
                        ? client.vat_code
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="font-medium">{client.registrationDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-3">
                Activity History
              </h2>
              <div className="bg-gray-50 rounded p-4 text-gray-500">
                No activity recorded yet.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Confirm Deletion
            </h3>
            <p className="text-gray-500 mb-5">
              Are you sure you want to delete{' '}
              <span className="font-medium">{client.name}</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7931e]"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaCheck className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetailPage;
