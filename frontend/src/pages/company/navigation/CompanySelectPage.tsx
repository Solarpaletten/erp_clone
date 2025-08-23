// src/pages/company/CompanySelectPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Моковые данные компаний с цифровыми ID
const mockCompanies = [
  { id: 1, name: 'Desert Solar DMCC', status: 'Active' },
  { id: 2, name: 'Emirates Energy', status: 'Active' },
  { id: 3, name: 'Test Energy Company', status: 'Active' },
];

const CompanySelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies] = useState(mockCompanies);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки данных о компаниях
    const timer = setTimeout(() => {
      setIsLoading(false);

      // ЛОГИКА КАК В B1.LT:
      if (companies.length === 0) {
        // Нет компаний - показать форму создания
        console.log('No companies - show create form');
      } else if (companies.length === 1) {
        // Одна компания - автоматический переход через транзит
        navigate(`/account/companies/select?id=${companies[0].id}`);
      } else {
        // Несколько компаний - показать список для выбора
        console.log('Multiple companies - show selection');
      }
    }, 500); // Небольшая задержка для показа загрузки

    return () => clearTimeout(timer);
  }, [companies, navigate]);

  const handleCompanySelect = (companyId: number) => {
    // Переходим на транзитную страницу с цифровым ID компании (как в B1.lt)
    navigate(`/account/companies/select?id=${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#f7931e] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solar ERP</h1>
          <p className="text-gray-600 mb-6">Загрузка компаний...</p>

          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f7931e]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f7931e] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solar ERP</h1>
          <p className="text-gray-600">Выберите компанию для работы</p>
        </div>

        <div className="space-y-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors hover:border-[#f7931e]"
              onClick={() => handleCompanySelect(company.id)}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#f7931e] rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">
                    {company.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{company.name}</h3>
                  <p className="text-sm text-green-600">{company.status}</p>
                </div>
                <div className="text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="w-full bg-[#f7931e] text-white py-2 px-4 rounded-lg hover:bg-[#e05e00] transition-colors">
            Создать новую компанию
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanySelectPage;
