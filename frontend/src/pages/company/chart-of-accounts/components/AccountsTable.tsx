import React from 'react';
import { ChartAccount } from '../types/chartTypes';

interface AccountsTableProps {
  accounts: ChartAccount[];
  onEdit: (account: ChartAccount) => void;
  onDelete: (accountId: number) => void;
}

const AccountsTable: React.FC<AccountsTableProps> = ({ accounts, onEdit, onDelete }) => {
  const getTypeColor = (type: string) => {
    const colors = {
      'ASSET': 'bg-blue-100 text-blue-800',
      'LIABILITY': 'bg-red-100 text-red-800',
      'EQUITY': 'bg-green-100 text-green-800',
      'INCOME': 'bg-emerald-100 text-emerald-800',
      'EXPENSE': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getAccountIcon = (type: string, code: string) => {
    if (code.startsWith('20') || code.startsWith('203')) return '📦'; // Товары
    if (code.startsWith('24') || code.startsWith('240')) return '💰'; // Дебиторы
    if (code.startsWith('27') || code.startsWith('280')) return '🏦'; // Банк
    if (code.startsWith('44') || code.startsWith('56')) return '🏪'; // Поставщики
    if (code.startsWith('70') || code.startsWith('701')) return '💎'; // Выручка
    if (code.startsWith('60') || code.startsWith('601')) return '📉'; // Расходы
    if (type === 'ASSET') return '📊';
    if (type === 'LIABILITY') return '📋';
    if (type === 'INCOME') return '📈';
    if (type === 'EXPENSE') return '📉';
    return '📄';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Счёт
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Валюта
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">
                      {getAccountIcon(account.account_type, account.account_code)}
                    </span>
                    <span className="text-sm font-mono font-medium text-gray-900">
                      {account.account_code}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {account.account_name}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(account.account_type)}`}>
                    {account.account_type}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {account.currency || 'EUR'}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {account.is_active ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(account)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(account.id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {accounts.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Всего счетов: {accounts.length}</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Активы
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Пассивы
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                Доходы
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Расходы
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsTable;
