// f/src/pages/company/purchases/components/PurchasesTable.tsx
import React from 'react';
import { Purchase, PaymentStatus, DeliveryStatus } from '../types/purchasesTypes';

interface PurchasesTableProps {
  purchases: Purchase[];
  loading?: boolean;
  onView?: (purchase: Purchase) => void;
  onEdit?: (purchase: Purchase) => void;
  onDelete?: (purchase: Purchase) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

// Status Badge Component
const StatusBadge: React.FC<{ status: PaymentStatus | DeliveryStatus; type: 'payment' | 'delivery' }> = ({ status, type }) => {
  const getStatusColor = () => {
    if (type === 'payment') {
      switch (status) {
        case 'PAID': return 'bg-green-100 text-green-800';
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'PARTIAL': return 'bg-blue-100 text-blue-800';
        case 'OVERDUE': return 'bg-red-100 text-red-800';
        case 'CANCELLED': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (status) {
        case 'DELIVERED': return 'bg-green-100 text-green-800';
        case 'SHIPPED': return 'bg-blue-100 text-blue-800';
        case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
        case 'PENDING': return 'bg-gray-100 text-gray-800';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

// Sort Icon Component
const SortIcon: React.FC<{ field: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }> = ({ 
  field, 
  sortBy, 
  sortOrder 
}) => {
  if (sortBy !== field) {
    return <span className="text-gray-400">↕️</span>;
  }
  return (
    <span className="text-indigo-600">
      {sortOrder === 'asc' ? '↑' : '↓'}
    </span>
  );
};

const PurchasesTable: React.FC<PurchasesTableProps> = ({
  purchases,
  loading = false,
  onView,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort
}) => {
  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('document_number')}
              >
                <div className="flex items-center gap-1">
                  Document
                  <SortIcon field="document_number" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('supplier_id')}
              >
                <div className="flex items-center gap-1">
                  Supplier
                  <SortIcon field="supplier_id" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('document_date')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <SortIcon field="document_date" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_amount')}
              >
                <div className="flex items-center gap-1">
                  Amount
                  <SortIcon field="total_amount" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('payment_status')}
              >
                <div className="flex items-center gap-1">
                  Payment
                  <SortIcon field="payment_status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('delivery_status')}
              >
                <div className="flex items-center gap-1">
                  Delivery
                  <SortIcon field="delivery_status" sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                {/* Document Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.document_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {purchase.operation_type}
                    </div>
                  </div>
                </td>
                
                {/* Supplier Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {purchase.supplier?.name || 'Unknown Supplier'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {purchase.supplier?.email || purchase.supplier?.code || ''}
                    </div>
                  </div>
                </td>
                
                {/* Date Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(purchase.document_date)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {purchase.operation_type}
                  </div>
                </td>
                
                {/* Amount Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.total_amount, purchase.currency)}
                  </div>
                  {purchase.vat_amount > 0 && (
                    <div className="text-sm text-gray-500">
                      VAT: {formatCurrency(purchase.vat_amount, purchase.currency)}
                    </div>
                  )}
                </td>
                
                {/* Payment Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={purchase.payment_status} type="payment" />
                </td>
                
                {/* Delivery Status Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={purchase.delivery_status} type="delivery" />
                </td>
                
                {/* Actions Column */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(purchase)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        title="View Purchase"
                      >
                        👁️
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(purchase)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit Purchase"
                      >
                        ✏️
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(purchase)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete Purchase"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {purchases.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first purchase order or adjust your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchasesTable;