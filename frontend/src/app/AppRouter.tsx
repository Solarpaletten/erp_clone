import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import AuthGuard from '../components/account/AuthGuard';
import AccountDashboardPage from '../pages/account/dashboard/AccountDashboardPage';
import CompanyLayout from '../components/company/CompanyLayout';

// Company Pages
import DashboardPage from '../pages/company/dashboard/DashboardPage';
import DashkaPage from '../pages/company/dashka/DashkaPage';
import ClientsPage from '../pages/company/clients/ClientsPage';
import ProductsPage from '../pages/company/products/ProductsPage';
import PurchasesPage from '../pages/company/purchases/PurchasesPage';
import SalesPage from '../pages/company/sales/SalesPage';
import WarehousePage from '../pages/company/warehouse/WarehousePage';
import ChartOfAccountsPage from '../pages/company/chart-of-accounts/ChartOfAccountsPage';
import BankingPage from '../pages/company/banking/BankingPage';
import SettingsPage from '../pages/company/settings/SettingsPage';
import TabBookDemo from '../components/tabbook/TabBookDemo';
import SolarCloudIDE from '../components/cloudide/SolarCloudIDE';
import InventoryFlowPage from '../pages/company/integration/InventoryFlowPage';
import InventoryAccountsIntegration from '../components/integration/InventoryAccountsIntegration';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<LoginPage />} />

        {/* Account Level */}
        <Route
          path="/account/dashboard"
          element={
            <AuthGuard>
              <AccountDashboardPage />
            </AuthGuard>
          }
        />

        {/* Company Level - All wrapped in CompanyLayout */}
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <CompanyLayout>
                <DashboardPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/clients"
          element={
            <AuthGuard>
              <CompanyLayout>
                <ClientsPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/products"
          element={
            <AuthGuard>
              <CompanyLayout>
                <ProductsPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/purchases"
          element={
            <AuthGuard>
              <CompanyLayout>
                <PurchasesPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/sales"
          element={
            <AuthGuard>
              <CompanyLayout>
                <SalesPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/warehouse"
          element={
            <AuthGuard>
              <CompanyLayout>
                <WarehousePage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/chart-of-accounts"
          element={
            <AuthGuard>
              <CompanyLayout>
                <ChartOfAccountsPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/company/chart-of-accounts"
          element={
            <AuthGuard>
              <CompanyLayout>
                <ChartOfAccountsPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/company/inventory-integration"
          element={
            <AuthGuard>
              <CompanyLayout>
                <InventoryAccountsIntegration />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/banking"
          element={
            <AuthGuard>
              <CompanyLayout>
                <BankingPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/tabbook"
          element={
            <AuthGuard>
              <CompanyLayout>
                <TabBookDemo />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/cloudide"
          element={
            <AuthGuard>
              <CompanyLayout>
                <SolarCloudIDE />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/inventory-flow"
          element={
            <AuthGuard>
              <CompanyLayout>
                <InventoryFlowPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/settings"
          element={
            <AuthGuard>
              <CompanyLayout>
                <SettingsPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        <Route
          path="/dashka"
          element={
            <AuthGuard>
              <CompanyLayout>
                <DashkaPage />
              </CompanyLayout>
            </AuthGuard>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/account/dashboard" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
