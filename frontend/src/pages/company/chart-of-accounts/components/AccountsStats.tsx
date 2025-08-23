// f/src/pages/company/chart-of-accounts/components/AccountsStats.tsx
import React from 'react';
import { AccountsStats as StatsType } from '../types/chartTypes';

interface AccountsStatsProps {
  stats: StatsType;
}

const AccountsStats: React.FC<AccountsStatsProps> = ({ stats }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {/* Total Accounts */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-700 font-medium">Total Accounts</div>
          <div className="text-xs text-blue-500 mt-1">Complete Chart</div>
        </div>

        {/* Active Accounts */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-green-700 font-medium">Active</div>
          <div className="text-xs text-green-500 mt-1">In Use</div>
        </div>

        {/* Inactive Accounts */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-red-700 font-medium">Inactive</div>
          <div className="text-xs text-red-500 mt-1">Disabled</div>
        </div>

        {/* Assets */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.byType.ASSET}</div>
          <div className="text-sm text-indigo-700 font-medium">Assets</div>
          <div className="text-xs text-indigo-500 mt-1">Resources</div>
        </div>

        {/* Income */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.byType.INCOME}</div>
          <div className="text-sm text-emerald-700 font-medium">Income</div>
          <div className="text-xs text-emerald-500 mt-1">Revenue</div>
        </div>
      </div>

      {/* Account Types Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Types */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            📊 Account Types Distribution
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Assets</span>
              </div>
              <span className="text-sm font-medium text-blue-600">{stats.byType.ASSET}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Liabilities</span>
              </div>
              <span className="text-sm font-medium text-red-600">{stats.byType.LIABILITY}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Equity</span>
              </div>
              <span className="text-sm font-medium text-green-600">{stats.byType.EQUITY}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Income</span>
              </div>
              <span className="text-sm font-medium text-emerald-600">{stats.byType.INCOME}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700">Expenses</span>
              </div>
              <span className="text-sm font-medium text-orange-600">{stats.byType.EXPENSE}</span>
            </div>
          </div>
        </div>

        {/* Lithuanian Classes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            🇱🇹 Lithuanian Chart Classes
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.byClass).map(([classCode, count]) => {
              const getClassInfo = (code: string) => {
                switch (code) {
                  case '1': return { name: 'Non-current Assets', color: 'text-blue-600' };
                  case '2': return { name: 'Current Assets', color: 'text-cyan-600' };
                  case '4': return { name: 'Equity', color: 'text-green-600' };
                  case '5': return { name: 'Liabilities', color: 'text-red-600' };
                  case '6': return { name: 'Expenses', color: 'text-orange-600' };
                  case '7': return { name: 'Income', color: 'text-emerald-600' };
                  default: return { name: `Class ${code}`, color: 'text-gray-600' };
                }
              };

              const classInfo = getClassInfo(classCode);
              
              return (
                <div key={classCode} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center mr-2 text-xs font-bold ${classInfo.color} bg-white`}>
                      {classCode}
                    </div>
                    <span className="text-sm text-gray-700">{classInfo.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${classInfo.color}`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>📈 Standard: Lithuanian IFRS</span>
            <span>🔄 Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              ✅ EU Compliant
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              🌍 Multi-currency Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsStats;