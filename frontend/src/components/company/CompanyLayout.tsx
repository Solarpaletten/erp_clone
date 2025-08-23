import React from 'react';
import CompanySidebar from './CompanySidebar';
import CompanyHeader from './CompanyHeader';

interface CompanyLayoutProps {
  children: React.ReactNode;
} 

const CompanyLayout: React.FC<CompanyLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Company Sidebar */}
      <CompanySidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <CompanyHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;
