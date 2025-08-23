// f/src/pages/company/chart-of-accounts/components/ImportLithuanianModal.tsx
import React from 'react';
import { ImportLithuanianModalProps, LITHUANIAN_ACCOUNT_CLASSES } from '../types/chartTypes';

const ImportLithuanianModal: React.FC<ImportLithuanianModalProps> = ({ 
  onClose, 
  onConfirm, 
  loading 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              🇱🇹 Import Lithuanian Chart of Accounts
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Standard Lithuanian IFRS-compliant chart of accounts
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-blue-600 text-xl mr-3">📊</span>
              <div>
                <h3 className="text-blue-900 font-medium mb-2">
                  Lithuanian Standard Chart of Accounts
                </h3>
                <p className="text-blue-800 text-sm">
                  This will import the standard Lithuanian chart of accounts based on IFRS standards. 
                  The chart includes 51 essential accounts covering all major business operations.
                </p>
              </div>
            </div>
          </div>

          {/* Account Classes Overview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              📋 What will be imported:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LITHUANIAN_ACCOUNT_CLASSES.map((classInfo) => (
                <div 
                  key={classInfo.class}
                  className={`${classInfo.color} border rounded-lg p-3`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-white rounded border flex items-center justify-center mr-3">
                      <span className="font-bold text-gray-700">{classInfo.class}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        Class {classInfo.class}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {classInfo.name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              ✨ Features included:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                EU IFRS Compliant
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Multi-currency Ready
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Complete Asset Coverage
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Standard Liability Accounts
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Income & Expense Structure
              </div>
              <div className="flex items-center text-green-600">
                <span className="mr-2">✅</span>
                Equity & Capital Accounts
              </div>
            </div>
          </div>

          {/* Sample Accounts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              📝 Sample accounts to be imported:
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <div className="grid grid-cols-3 gap-4 font-medium text-gray-700 border-b border-gray-200 pb-2">
                <span>Code</span>
                <span>Name</span>
                <span>Type</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-600">
                <span className="font-mono">280</span>
                <span>Bank accounts</span>
                <span className="text-blue-600">ASSET</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-600">
                <span className="font-mono">40</span>
                <span>Share capital</span>
                <span className="text-green-600">EQUITY</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-600">
                <span className="font-mono">56</span>
                <span>Trade payables</span>
                <span className="text-red-600">LIABILITY</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-600">
                <span className="font-mono">70</span>
                <span>Sales revenue</span>
                <span className="text-emerald-600">INCOME</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-gray-600">
                <span className="font-mono">60</span>
                <span>Cost of sales</span>
                <span className="text-orange-600">EXPENSE</span>
              </div>
              <div className="text-center text-gray-500 text-xs pt-2 border-t border-gray-200">
                ... and 46 more accounts
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-yellow-600 text-lg mr-3">⚠️</span>
              <div>
                <h3 className="text-yellow-900 font-medium mb-2">Important Notes:</h3>
                <ul className="text-yellow-800 text-sm space-y-1">
                  <li>• Existing accounts with the same codes will be skipped</li>
                  <li>• All imported accounts will be set as "Active" by default</li>
                  <li>• You can modify account names and settings after import</li>
                  <li>• This operation cannot be undone (but accounts can be deleted individually)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">51</div>
              <div className="text-xs text-gray-500">Total Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-xs text-gray-500">Account Classes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-xs text-gray-500">Account Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">🇪🇺</div>
              <div className="text-xs text-gray-500">EU Standard</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Ready to import Lithuanian standard chart of accounts?
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <span className="mr-2">⏳</span>
                  Importing...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Import Chart of Accounts
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportLithuanianModal;