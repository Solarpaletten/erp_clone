// f/src/pages/company/chart-of-accounts/components/EditAccountModal.tsx
import React, { useState, useEffect } from 'react';
import { EditAccountModalProps, AccountFormData, ACCOUNT_TYPES, CURRENCY_OPTIONS } from '../types/chartTypes';

const EditAccountModal: React.FC<EditAccountModalProps> = ({ account, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AccountFormData>({
    account_code: account.account_code,
    account_name: account.account_name,
    account_type: account.account_type,
    currency: account.currency || '',
    is_active: account.is_active
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.account_code.trim()) {
      newErrors.account_code = 'Account code is required';
    } else if (!/^[0-9]{1,3}$/.test(formData.account_code.trim())) {
      newErrors.account_code = 'Account code must be 1-3 digits';
    }

    if (!formData.account_name.trim()) {
      newErrors.account_name = 'Account name is required';
    } else if (formData.account_name.trim().length < 3) {
      newErrors.account_name = 'Account name must be at least 3 characters';
    }

    if (!formData.account_type) {
      newErrors.account_type = 'Account type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error updating account:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.account_code !== account.account_code ||
      formData.account_name !== account.account_name ||
      formData.account_type !== account.account_type ||
      formData.currency !== (account.currency || '') ||
      formData.is_active !== account.is_active
    );
  };

  // Get Lithuanian class info
  const getLithuanianClassInfo = (code: string) => {
    const firstDigit = code.charAt(0);
    const classes: { [key: string]: { name: string; color: string } } = {
      '1': { name: 'Non-current Assets', color: 'text-blue-600' },
      '2': { name: 'Current Assets', color: 'text-cyan-600' },
      '4': { name: 'Equity', color: 'text-green-600' },
      '5': { name: 'Liabilities', color: 'text-red-600' },
      '6': { name: 'Expenses', color: 'text-orange-600' },
      '7': { name: 'Income', color: 'text-emerald-600' },
      '8': { name: 'Results', color: 'text-purple-600' },
      '9': { name: 'Management', color: 'text-gray-600' }
    };
    return classes[firstDigit] || { name: 'Other', color: 'text-gray-600' };
  };

  const classInfo = getLithuanianClassInfo(formData.account_code);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">✏️ Edit Account</h2>
            <p className="text-sm text-gray-500 mt-1">
              ID: {account.id} • Created: {new Date(account.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Account Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Code *
            </label>
            <input
              type="text"
              name="account_code"
              value={formData.account_code}
              onChange={handleChange}
              placeholder="e.g., 280"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.account_code ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.account_code && (
              <p className="text-red-500 text-xs mt-1">{errors.account_code}</p>
            )}
            
            {/* Lithuanian Class Info */}
            {formData.account_code && (
              <div className="mt-2 text-xs">
                <span className="text-gray-500">Lithuanian Class: </span>
                <span className={`font-medium ${classInfo.color}`}>
                  {formData.account_code.charAt(0)} - {classInfo.name}
                </span>
              </div>
            )}
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              name="account_name"
              value={formData.account_name}
              onChange={handleChange}
              placeholder="e.g., Bank accounts"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.account_name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.account_name && (
              <p className="text-red-500 text-xs mt-1">{errors.account_name}</p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type *
            </label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.account_type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {ACCOUNT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.account_type && (
              <p className="text-red-500 text-xs mt-1">{errors.account_type}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency (Optional)
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No specific currency</option>
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Account is active
            </label>
          </div>

          {/* Account Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Created:</span> {new Date(account.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(account.updated_at).toLocaleDateString()}
              </div>
              {account.creator && (
                <div>
                  <span className="font-medium">Created by:</span> {account.creator.username}
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span> 
                <span className={`ml-1 ${account.is_active ? 'text-green-600' : 'text-red-600'}`}>
                  {account.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Changes indicator */}
          {hasChanges() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <span className="text-sm text-yellow-800">
                  You have unsaved changes
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !hasChanges()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
              loading || !hasChanges() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="mr-2">⏳</span>
                Updating...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                {hasChanges() ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;