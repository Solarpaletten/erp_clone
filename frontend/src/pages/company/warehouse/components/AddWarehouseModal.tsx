// f/src/pages/company/warehouse/components/AddWarehouseModal.tsx
import React, { useState, useEffect } from 'react';
import { WarehouseFormData, User } from '../types/warehouseTypes';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WarehouseFormData) => Promise<void>;
  loading?: boolean;
}

// Mock data - в реальной версии это будет из API
const mockManagers: User[] = [
  { id: 1, first_name: 'John', last_name: 'Smith', email: 'john@company.com' },
  { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@company.com' },
  { id: 3, first_name: 'Mike', last_name: 'Davis', email: 'mike@company.com' },
  { id: 4, first_name: 'Lisa', last_name: 'Wilson', email: 'lisa@company.com' },
];

const AddWarehouseModal: React.FC<AddWarehouseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    code: '',
    description: '',
    address: '',
    manager_id: undefined,
    status: 'ACTIVE',
    is_main: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate warehouse code based on name
  const generateCode = (name: string) => {
    if (!name) return '';
    
    const words = name.trim().split(' ');
    const code = words
      .map(word => word.substring(0, 2).toUpperCase())
      .join('')
      .substring(0, 6);
    
    const timestamp = Date.now().toString().slice(-3);
    return `WH${code}${timestamp}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      code: prev.code || generateCode(name)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Warehouse name must be at least 2 characters';
    }

    // Code validation
    if (formData.code && (formData.code.length < 2 || formData.code.length > 10)) {
      newErrors.code = 'Code must be between 2 and 10 characters';
    }

    // Address validation
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Address must be less than 500 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success (parent will close modal)
      resetForm();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      // Error handling is done in parent component
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      address: '',
      manager_id: undefined,
      status: 'ACTIVE',
      is_main: false
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              🏭 Create New Warehouse
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Add a new warehouse to your inventory management system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Warehouse Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Main Distribution Center"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  ⚠️ {errors.name}
                </p>
              )}
            </div>

            {/* Warehouse Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="WHMAINDIST001"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  ⚠️ {errors.code}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                💡 Auto-generated from name, but you can customize it
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the warehouse purpose, capacity, or special features..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                ⚠️ {errors.description}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="123 Industrial Blvd, City, State, ZIP"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                ⚠️ {errors.address}
              </p>
            )}
          </div>

          {/* Manager and Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manager Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Manager
              </label>
              <select
                value={formData.manager_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  manager_id: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a manager...</option>
                {mockManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    👤 {manager.first_name} {manager.last_name} ({manager.email})
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                💡 Optional - you can assign a manager later
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="ACTIVE">✅ Active</option>
                <option value="INACTIVE">⏸️ Inactive</option>
                <option value="MAINTENANCE">🔧 Maintenance</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Warehouse Options</h3>
            <div className="space-y-3">
              {/* Main Warehouse */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="is_main"
                    checked={formData.is_main}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_main: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_main" className="font-medium text-gray-700 flex items-center gap-1">
                    ⭐ Set as Main Warehouse
                  </label>
                  <p className="text-gray-500">
                    The main warehouse will be used as default for operations and reports
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-sm font-medium text-blue-700 mb-2">📋 Preview</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">🏭 Name:</span>
                  <span>{formData.name}</span>
                  {formData.is_main && <span className="text-amber-500">⭐</span>}
                </div>
                {formData.code && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">🔢 Code:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded">{formData.code}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📍 Address:</span>
                    <span>{formData.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">📊 Status:</span>
                  <span>
                    {formData.status === 'ACTIVE' && '✅ Active'}
                    {formData.status === 'INACTIVE' && '⏸️ Inactive'}
                    {formData.status === 'MAINTENANCE' && '🔧 Maintenance'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  🏭 Create Warehouse
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWarehouseModal;