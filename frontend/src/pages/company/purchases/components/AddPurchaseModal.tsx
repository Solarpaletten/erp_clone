// f/src/pages/company/purchases/components/AddPurchaseModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  PurchaseFormData, 
  PurchaseItemFormData, 
  PurchaseOperationType, 
  PaymentStatus, 
  DeliveryStatus, 
  DocumentStatus, 
  Currency,
  Client,
  Product,
  Warehouse,
  User
} from '../types/purchasesTypes';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseFormData) => Promise<void>;
  loading?: boolean;
}

const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  // ===============================================
  // 🏗️ STATE MANAGEMENT
  // ===============================================
  const [formData, setFormData] = useState<PurchaseFormData>({
    document_number: '',
    document_date: new Date().toISOString().split('T')[0],
    operation_type: 'PURCHASE',
    supplier_id: 0,
    warehouse_id: undefined,
    purchase_manager_id: undefined,
    currency: 'EUR',
    payment_status: 'PENDING',
    delivery_status: 'PENDING',
    document_status: 'DRAFT',
    items: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ===============================================
  // 🔄 REAL DATA FROM API (НЕ МОКИ!)
  // ===============================================
  const [suppliers, setSuppliers] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // ===============================================
  // 📡 ЗАГРУЗКА РЕАЛЬНЫХ ДАННЫХ
  // ===============================================
  const fetchRealData = async () => {
    if (!isOpen) return;
    
    setDataLoading(true);
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('token');
    const companyId = localStorage.getItem('currentCompanyId');

    try {
      // 1. Загружаем поставщиков (клиенты с ролью SUPPLIER)
      const suppliersResponse = await fetch('/api/company/clients?role=SUPPLIER', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId || '',
          'Content-Type': 'application/json'
        }
      });

      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData.clients || []);
        console.log('✅ Loaded suppliers:', suppliersData.clients?.length || 0);
      }

      // 2. Загружаем склады
      const warehousesResponse = await fetch('/api/company/warehouses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId || '',
          'Content-Type': 'application/json'
        }
      });

      if (warehousesResponse.ok) {
        const warehousesData = await warehousesResponse.json();
        setWarehouses(warehousesData.warehouses || []);
        console.log('✅ Loaded warehouses:', warehousesData.warehouses?.length || 0);
      }

      // 3. Загружаем товары
      const productsResponse = await fetch('/api/company/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId || '',
          'Content-Type': 'application/json'
        }
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
        console.log('✅ Loaded products:', productsData.products?.length || 0);
      }

      // 4. Загружаем сотрудников (пока используем пользователей компании)
      // TODO: Создать отдельную таблицу employees
      setEmployees([
        { id: 1, first_name: 'John', last_name: 'Smith', email: 'john@company.com' },
        { id: 2, first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@company.com' }
      ]);

    } catch (error) {
      console.error('❌ Error loading real data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // ===============================================
  // 🔄 EFFECTS
  // ===============================================
  useEffect(() => {
    if (isOpen) {
      // Генерируем номер документа
      if (!formData.document_number) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        setFormData(prev => ({
          ...prev,
          document_number: `PO-${year}${month}${day}-${random}`
        }));
      }

      // Загружаем реальные данные
      fetchRealData();
    } else {
      // Сбрасываем форму при закрытии
      setFormData({
        document_number: '',
        document_date: new Date().toISOString().split('T')[0],
        operation_type: 'PURCHASE',
        supplier_id: 0,
        warehouse_id: undefined,
        purchase_manager_id: undefined,
        currency: 'EUR',
        payment_status: 'PENDING',
        delivery_status: 'PENDING',
        document_status: 'DRAFT',
        items: []
      });
      setErrors({});
    }
  }, [isOpen]);

  // ===============================================
  // 🔧 HELPER FUNCTIONS
  // ===============================================
  const addItem = () => {
    const newItem: PurchaseItemFormData = {
      product_id: 0,
      quantity: 1,
      unit_price_base: 0,
      discount_percent: 0,
      vat_rate: 20,
      description: '',
      warehouse_id: formData.warehouse_id,
      employee_id: undefined
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // Auto-update price when product changes
          if (field === 'product_id') {
            const product = products.find(p => p.id === parseInt(value));
            if (product) {
              updatedItem.unit_price_base = product.cost_price || product.price;
              updatedItem.vat_rate = product.vat_rate || 20;
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateItemTotal = (item: PurchaseItemFormData) => {
    const subtotal = item.quantity * item.unit_price_base;
    const discount = (subtotal * (item.discount_percent || 0)) / 100;
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * ((item.vat_rate || 0) / 100);
    return afterDiscount + vat;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    formData.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unit_price_base;
      const itemDiscount = (itemSubtotal * (item.discount_percent || 0)) / 100;
      const itemAfterDiscount = itemSubtotal - itemDiscount;
      const itemVat = itemAfterDiscount * ((item.vat_rate || 0) / 100);

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;
      totalVat += itemVat;
    });

    return {
      subtotal,
      totalDiscount,
      totalVat,
      total: subtotal - totalDiscount + totalVat
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.document_number.trim()) {
      newErrors.document_number = 'Document number is required';
    }
    if (!formData.document_date) {
      newErrors.document_date = 'Document date is required';
    }
    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Supplier is required';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = 'Product is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_price_base <= 0) {
        newErrors[`item_${index}_price`] = 'Price must be greater than 0';
      }
    });

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
      onClose();
    } catch (error) {
      console.error('Error submitting purchase:', error);
    }
  };

  if (!isOpen) return null;

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-lg">🛍️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Create New Purchase</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Number *
              </label>
              <input
                type="text"
                value={formData.document_number}
                onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.document_number ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.document_number && (
                <p className="text-red-600 text-sm mt-1">{errors.document_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operation Type
              </label>
              <select
                value={formData.operation_type}
                onChange={(e) => setFormData(prev => ({ ...prev, operation_type: e.target.value as PurchaseOperationType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="PURCHASE">Purchase</option>
                <option value="RETURN">Return</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Date *
              </label>
              <input
                type="date"
                value={formData.document_date}
                onChange={(e) => setFormData(prev => ({ ...prev, document_date: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.document_date ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.document_date && (
                <p className="text-red-600 text-sm mt-1">{errors.document_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.supplier_id ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading || dataLoading}
              >
                <option value={0}>
                  {dataLoading ? 'Loading suppliers...' : 'Select a supplier...'}
                </option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.code})
                  </option>
                ))}
              </select>
              {errors.supplier_id && (
                <p className="text-red-600 text-sm mt-1">{errors.supplier_id}</p>
              )}
              {suppliers.length === 0 && !dataLoading && (
                <p className="text-yellow-600 text-sm mt-1">No suppliers found. Create suppliers in Clients section first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse
              </label>
              <select
                value={formData.warehouse_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  warehouse_id: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading || dataLoading}
              >
                <option value="">
                  {dataLoading ? 'Loading warehouses...' : 'Select warehouse...'}
                </option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
              </select>
              {warehouses.length === 0 && !dataLoading && (
                <p className="text-yellow-600 text-sm mt-1">No warehouses found. Create warehouses first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Manager
              </label>
              <select
                value={formData.purchase_manager_id || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  purchase_manager_id: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Select manager...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dollar</option>
                <option value="AED">AED - Dirham</option>
                <option value="RUB">RUB - Ruble</option>
                <option value="UAH">UAH - Hryvnia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as PaymentStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Status
              </label>
              <select
                value={formData.delivery_status}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_status: e.target.value as DeliveryStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Status
              </label>
              <select
                value={formData.document_status}
                onChange={(e) => setFormData(prev => ({ ...prev, document_status: e.target.value as DocumentStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Purchase Items */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Purchase Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                disabled={loading}
              >
                <span>+</span>
                Add Item
              </button>
            </div>

            {errors.items && (
              <p className="text-red-600 text-sm mb-4">{errors.items}</p>
            )}

            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product *
                    </label>
                    <select
                      value={item.product_id}
                      onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors[`item_${index}_product`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading || dataLoading}
                    >
                      <option value={0}>
                        {dataLoading ? 'Loading products...' : 'Select product...'}
                      </option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.code})
                        </option>
                      ))}
                    </select>
                    {errors[`item_${index}_product`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unit_price_base}
                      onChange={(e) => updateItem(index, 'unit_price_base', parseFloat(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors[`item_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                    {errors[`item_${index}_price`] && (
                      <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_price`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.discount_percent || 0}
                      onChange={(e) => updateItem(index, 'discount_percent', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={item.vat_rate || 0}
                      onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      disabled={loading}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Employee
                    </label>
                    <select
                      value={item.employee_id || ''}
                      onChange={(e) => updateItem(index, 'employee_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">Select employee...</option>
                      {employees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Additional notes..."
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-sm font-medium text-gray-900">
                    Item Total: €{calculateItemTotal(item).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            {products.length === 0 && !dataLoading && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No products available. Create products first.</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Subtotal:</span>
              <span className="text-sm font-bold text-gray-900">€{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total VAT:</span>
              <span className="text-sm font-bold text-gray-900">€{totals.totalVat.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-indigo-600">€{totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || dataLoading || formData.items.length === 0}
            >
              {loading ? 'Creating...' : 'Create Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseModal;