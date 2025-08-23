// f/src/pages/company/chart-of-accounts/components/AddAccountModal.tsx
import React, { useState } from 'react';
import { AddAccountModalProps, AccountFormData, ACCOUNT_TYPES, CURRENCY_OPTIONS } from '../types/chartTypes';

const AddAccountModal: React.FC<AddAccountModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AccountFormData>({
    account_code: '',
    account_name: '',
    account_type: 'ASSET',
    currency: '',
    is_active: true
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
      console.error('Error creating account:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get suggested account name based on code
  const getSuggestedName = (code: string) => {
    const suggestions: { [key: string]: string } = {
      '10': 'Development',
      '11': 'Concessions, patents, licenses',
      '12': 'Trademarks',
      '13': 'Software',
      '20': 'Land',
      '21': 'Buildings and structures',
      '22': 'Machinery and equipment',
      '23': 'Vehicles',
      '24': 'Computers and IT equipment',
      '25': 'Furniture and fixtures',
      '200': 'Raw materials',
      '201': 'Work in progress',
      '202': 'Finished goods',
      '203': 'Goods for resale',
      '240': 'Trade receivables',
      '250': 'Notes receivable',
      '270': 'Cash on hand',
      '271': 'Cash in national currency',
      '272': 'Cash in foreign currency',
      '280': 'Bank accounts',
      '281': 'Current accounts',
      '282': 'Foreign currency accounts',
      '40': 'Share capital',
      '401': 'Ordinary shares',
      '41': 'Share premium',
      '43': 'Legal reserves',
      '45': 'Retained earnings',
      '47': 'Current year profit',
      '50': 'Long-term loans',
      '501': 'Bank loans',
      '55': 'Short-term loans',
      '56': 'Trade payables',
      '57': 'Tax payables',
      '571': 'VAT payable',
      '572': 'Income tax payable',
      '58': 'Payroll payables',
      '60': 'Cost of sales',
      '601': 'Materials',
      '602': 'Wages and salaries',
      '603': 'Social security contributions',
      '604': 'Depreciation',
      '61': 'Selling expenses',
      '62': 'Administrative expenses',
      '65': 'Financial expenses',
      '651': 'Interest on loans',
      '70': 'Sales revenue',
      '701': 'Sale of goods',
      '702': 'Rendering of services',
      '73': 'Other operating income',
      '75': 'Financial income',
      '751': 'Interest received'
    };
    return suggestions[code] || '';
  };

  // Auto-suggest name when code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    handleChange(e);
    
    const suggestedName = getSuggestedName(code);
    if (suggestedName && !formData.account_name) {
      setFormData(prev => ({
        ...prev,
        account_name: suggestedName
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">➕ Add New Account</h2>
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
              onChange={handleCodeChange}
              placeholder="e.g., 280"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.account_code ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.account_code && (
              <p className="text-red-500 text-xs mt-1">{errors.account_code}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Lithuanian standard: 1-3 digits (e.g., 10, 280, 571)
            </p>
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
            <p className="text-gray-500 text-xs mt-1">
              Leave empty for accounts that don't require specific currency
            </p>
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

          {/* Lithuanian Standard Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">ℹ️</span>
              <div className="text-sm text-blue-800">
                <strong>Lithuanian Chart Classes:</strong>
                <br />
                1-2: Assets • 4: Equity • 5: Liabilities • 6: Expenses • 7: Income
              </div>
            </div>
          </div>
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
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <span className="mr-2">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <span className="mr-2">➕</span>
                Create Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;