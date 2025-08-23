// f/src/pages/company/settings/SettingsPage.tsx
import React from 'react';
import CompanyLayout from '../../../components/company/CompanyLayout.tsx';

const SettingsPage: React.FC = () => {
  return (
    
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              ⚙️ Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure your company settings and preferences
            </p>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-medium text-blue-900 mb-2">
              Settings Module Coming Soon
            </h3>
            <p className="text-blue-700 mb-6">
              We're working on bringing you comprehensive company settings and configuration options.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🏢 Company Settings</h4>
                <p className="text-sm text-blue-700">
                  Company profile, contact information, and business details
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">👥 User Management</h4>
                <p className="text-sm text-blue-700">
                  User roles, permissions, and access control
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔧 System Preferences</h4>
                <p className="text-sm text-blue-700">
                  Language, timezone, currency, and regional settings
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔔 Notifications</h4>
                <p className="text-sm text-blue-700">
                  Email alerts, system notifications, and communication preferences
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔒 Security</h4>
                <p className="text-sm text-blue-700">
                  Password policies, two-factor authentication, and security logs
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">🔗 Integrations</h4>
                <p className="text-sm text-blue-700">
                  Third-party integrations, API keys, and external services
                </p>
              </div>
            </div>
          </div>

          {/* Current System Status */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Company ID:</span>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                  {localStorage.getItem('currentCompanyId') || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Company Name:</span>
                <span className="font-medium">
                  {localStorage.getItem('currentCompanyName') || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User Email:</span>
                <span className="font-medium">
                  {localStorage.getItem('user_email') || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">System Version:</span>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                  v1.8.0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};

export default SettingsPage;