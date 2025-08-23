// 🔧 Исправленный файл f/src/pages/company/sales/components/AddSaleModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  SaleFormData, 
  SaleItemFormData, 
  SalesDocumentType, 
  PaymentStatus, 
  DeliveryStatus, 
  DocumentStatus, 
  Currency,
  Client,
  Product,
  Warehouse,
  User
} from '../types/salesTypes';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SaleFormData) => Promise<void>;
  loading?: boolean;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  // ✅ РЕАЛЬНЫЕ ДАННЫЕ ВМЕСТО МОКОВ
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [formData, setFormData] = useState<SaleFormData>({
    document_number: '',
    document_date: new Date().toISOString().split('T')[0],
    document_type: 'INVOICE',
    delivery_date: undefined,
    due_date: undefined,
    client_id: 0,
    warehouse_id: undefined,
    sales_manager_id: undefined,
    currency: 'EUR',
    payment_status: 'PENDING',
    delivery_status: 'PENDING',
    document_status: 'DRAFT',
    items: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ ЗАГРУЗКА РЕАЛЬНЫХ ДАННЫХ
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      try {
        setDataLoading(true);
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('token');
        const companyId = localStorage.getItem('currentCompanyId');
        
        if (!token || !companyId) {
          console.error('Missing token or company ID');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'x-company-id': companyId,
          'Content-Type': 'application/json'
        };

        // Параллельная загрузка всех данных
        const [clientsRes, productsRes, warehousesRes] = await Promise.all([
          fetch('/api/company/clients', { headers }),
          fetch('/api/company/products', { headers }),
          fetch('/api/company/warehouse', { headers })
        ]);

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData.clients || []);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.products || []);
        }

        if (warehousesRes.ok) {
          const warehousesData = await warehousesRes.json();
          setWarehouses(warehousesData.warehouses || []);
        }

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  // ✅ ГЕНЕРАЦИЯ НОМЕРА ДОКУМЕНТА
  useEffect(() => {
    if (isOpen && !formData.document_number) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      setFormData(prev => ({
        ...prev,
        document_number: `INV-${year}${month}${day}-${random}`
      }));
    }
  }, [isOpen]);

  const addItem = () => {
    const newItem: SaleItemFormData = {
      product_id: 0,
      quantity: 1,
      unit_price_base: 0,
      discount_percent: 0,
      total_discount: 0,
      vat_rate: 20,
      description: ''
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

  const updateItem = (index: number, field: keyof SaleItemFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // ✅ ПРАВИЛЬНАЯ ЛОГИКА ДЛЯ ВЫБОРА ТОВАРА
          if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
              updatedItem.unit_price_base = selectedProduct.price;
              updatedItem.vat_rate = selectedProduct.vat_rate || 20;
              
              // ✅ ПРОВЕРКА ОСТАТКОВ
              const availableStock = parseFloat(selectedProduct.current_stock || '0');
              if (!selectedProduct.is_service && availableStock <= 0) {
                alert(`⚠️ Товар "${selectedProduct.name}" отсутствует на складе!`);
              }
            }
          }
          
          // ✅ ПРОВЕРКА КОЛИЧЕСТВА
          if (field === 'quantity') {
            const selectedProduct = products.find(p => p.id === item.product_id);
            if (selectedProduct && !selectedProduct.is_service) {
              const requestedQty = parseFloat(value);
              const availableStock = parseFloat(selectedProduct.current_stock || '0');
              
              if (requestedQty > availableStock) {
                alert(`⚠️ Недостаточно товара на складе!\nЗапрошено: ${requestedQty}\nДоступно: ${availableStock}`);
                updatedItem.quantity = Math.min(requestedQty, availableStock);
              }
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateItemTotal = (item: SaleItemFormData) => {
    const subtotal = item.quantity * item.unit_price_base;
    const discount = item.total_discount || 0;
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
      const itemDiscount = item.total_discount || 0;
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
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required';
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
      // Reset form after successful submission
      setFormData({
        document_number: '',
        document_date: new Date().toISOString().split('T')[0],
        document_type: 'INVOICE',
        delivery_date: undefined,
        due_date: undefined,
        client_id: 0,
        warehouse_id: undefined,
        sales_manager_id: undefined,
        currency: 'EUR',
        payment_status: 'PENDING',
        delivery_status: 'PENDING',
        document_status: 'DRAFT',
        items: []
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  const totals = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Sale</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {dataLoading && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg">
              Loading clients, products, and warehouses...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Number *
                </label>
                <input
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  Document Type
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_type: e.target.value as SalesDocumentType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="INVOICE">Invoice</option>
                  <option value="QUOTE">Quote</option>
                  <option value="ORDER">Order</option>
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Date *
                </label>
                <input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, document_date: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Client and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_id: parseInt(e.target.value) }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.client_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading || dataLoading}
                >
                  <option value={0}>Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.code})
                    </option>
                  ))}
                </select>
                {errors.client_id && (
                  <p className="text-red-600 text-sm mt-1">{errors.client_id}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as Currency }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="AED">AED - UAE Dirham</option>
                </select>
              </div>
            </div>

            {/* Status Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value as PaymentStatus }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            {/* Sale Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Sale Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading || dataLoading}
                >
                  + Add Item
                </button>
              </div>

              {errors.items && (
                <p className="text-red-600 text-sm mb-4">{errors.items}</p>
              )}

              <div className="space-y-4">
                {formData.items.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === item.product_id);
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Product */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) => updateItem(index, 'product_id', parseInt(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_product`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          >
                            <option value={0}>Select product...</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </option>
                            ))}
                          </select>
                          {selectedProduct && (
                            <div className="text-xs text-gray-500 mt-1">
                              {selectedProduct.is_service ? (
                                <span>🔧 Service (no stock check)</span>
                              ) : (
                                <span>📦 Stock: {selectedProduct.current_stock || 0} {selectedProduct.unit}</span>
                              )}
                            </div>
                          )}
                          {errors[`item_${index}_product`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_product`]}</p>
                          )}
                        </div>

                        {/* Quantity */}
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </div>

                        {/* Unit Price */}
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            disabled={loading}
                          />
                          {errors[`item_${index}_price`] && (
                            <p className="text-red-600 text-sm mt-1">{errors[`item_${index}_price`]}</p>
                          )}
                        </div>

                        {/* VAT % */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            VAT %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.vat_rate}
                            onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-full px-3 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50"
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium text-gray-700">
                          Item Total: €{calculateItemTotal(item).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total VAT:</span>
                  <span>€{totals.totalVat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>€{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading || dataLoading}
              >
                {loading ? 'Creating...' : 'Create Sale'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSaleModal;