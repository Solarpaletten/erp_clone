// f/src/services/companyService.ts
// ===============================================
// 🏗️ COMPANY SERVICE ДЛЯ ДВУХУРОВНЕВОЙ АРХИТЕКТУРЫ
// ===============================================

import { api } from '../../api/axios'; // ✅ Правильный путь к axios

export interface Company {
  id: number;
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  status?: string;
  created_at?: string;
  is_active?: boolean;
  clientsCount?: number;
  salesCount?: number;
  productsCount?: number;
  owner?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CompaniesResponse {
  success: boolean;
  companies: Company[];
  count: number;
}

export const companyService = {
  // ===============================================
  // 📋 Получить список компаний (Account Level)
  // ===============================================
  getCompanies: async (): Promise<CompaniesResponse> => {
    console.log('🏢 Getting companies...');
    
    try {
      const response = await api.get<CompaniesResponse>('/api/account/companies/stats');
      console.log('✅ Companies loaded from API:', response.data.companies?.length || 0);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  },

  // ===============================================
  // 🎯 Выбрать компанию и установить контекст
  // ===============================================
  selectCompany: async (companyId: number): Promise<{ success: boolean; companyId: number }> => {
    console.log(`🎯 Selecting company ID: ${companyId}`);
    
    try {
      // 1. Сохраняем в localStorage
      localStorage.setItem('currentCompanyId', companyId.toString());
      localStorage.setItem('companySelectedAt', new Date().toISOString());
      
      console.log(`✅ Company ${companyId} saved to localStorage`);
      
      // 2. Обновляем axios headers
      api.defaults.headers['x-company-id'] = companyId.toString();
      
      console.log(`✅ x-company-id header set to: ${companyId}`);
      
      // 3. Уведомляем backend о переключении компании
      try {
        await api.post('/api/account/switch-to-company', {
          companyId: companyId
        });
        console.log('✅ Backend notified about company selection');
      } catch (error) {
        console.warn('⚠️ Failed to notify backend, but continuing...', error);
      }
      
      return { success: true, companyId };
      
    } catch (error) {
      console.error('❌ Error selecting company:', error);
      throw error;
    }
  },

  // ===============================================
  // 📋 Получить текущую выбранную компанию
  // ===============================================
  getCurrentCompany: (): { id: number; selectedAt: Date } | null => {
    const companyId = localStorage.getItem('currentCompanyId');
    const selectedAt = localStorage.getItem('companySelectedAt');
    
    if (companyId) {
      console.log(`📋 Current company: ${companyId} (selected at ${selectedAt})`);
      return {
        id: parseInt(companyId),
        selectedAt: selectedAt ? new Date(selectedAt) : new Date()
      };
    }
    
    console.log('📋 No company currently selected');
    return null;
  },

  // ===============================================
  // 🧹 Очистить выбор компании (переход на Account Level)
  // ===============================================
  clearCompanySelection: (): void => {
    console.log('🧹 Clearing company selection');
    
    localStorage.removeItem('currentCompanyId');
    localStorage.removeItem('currentCompanyName');
    localStorage.removeItem('companySelectedAt');
    
    // Убираем header из axios
    if (api.defaults.headers['x-company-id']) {
      delete api.defaults.headers['x-company-id'];
    }
    
    console.log('✅ Company selection cleared');
  },

  // ===============================================
  // 🆕 Создать новую компанию
  // ===============================================
  createCompany: async (companyData: Partial<Company>): Promise<Company> => {
    console.log('🆕 Creating new company...', companyData);
    
    try {
      const response = await api.post<{success: boolean, company: Company}>('/api/account/companies', companyData);
      
      if (response.data.success && response.data.company) {
        console.log('✅ Company created:', response.data.company);
        return response.data.company;
      } else {
        throw new Error('Failed to create company');
      }
    } catch (error: any) {
      console.error('❌ Error creating company:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.status === 409) {
        throw new Error('Company with this code already exists');
      } else {
        throw new Error('Failed to create company. Please try again.');
      }
    }
  },

  // ===============================================
  // 🔧 Автоматическое восстановление контекста при загрузке
  // ===============================================
  restoreCompanyContext: (): boolean => {
    const currentCompany = companyService.getCurrentCompany();
    
    if (currentCompany) {
      api.defaults.headers['x-company-id'] = currentCompany.id.toString();
      
      console.log(`🔄 Company context restored: ${currentCompany.id}`);
      return true;
    }
    
    console.log('🔄 No company context to restore');
    return false;
  }
};

// ===============================================
// 🚀 АВТОМАТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ КОНТЕКСТА ПРИ ИМПОРТЕ
// ===============================================
companyService.restoreCompanyContext();

export default companyService;