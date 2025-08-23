// f/src/api/axios.ts
// ===============================================
// 🌐 ИСПРАВЛЕННЫЙ AXIOS КЛИЕНТ С ПРАВИЛЬНЫМИ КЛЮЧАМИ LOCALSTORAGE
// ===============================================

import axios from 'axios';

// Автоматическое определение API URL
const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Продакшен
    if (hostname === 'itsolar.pl') {
      return 'https://api.itsolar.pl';
    }

    // Локальная разработка
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }

  // Fallback
  return 'http://localhost:4000';
};

// Создаем экземпляр axios
export const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`🔗 API URL: ${getApiUrl()}`);

// ===============================================
// 🔧 ИСПРАВЛЕННЫЙ REQUEST INTERCEPTOR
// ===============================================
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

    // 1. Добавляем токен авторизации
    const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token'); // Исправлено: используем auth_token как в ClientsPage.tsx
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Added auth token`);
    }

    // 2. Автоматически добавляем x-company-id для Company Level запросов
    // 🔥 ИСПРАВЛЕНИЕ: Используем тот же ключ что и в ClientsPage.tsx
    const currentCompanyId = localStorage.getItem('currentCompanyId'); // camelCase!

    // ===============================================
    // 🎯 ОПРЕДЕЛЕНИЕ COMPANY LEVEL ЗАПРОСОВ
    // ===============================================
    const isCompanyLevelRequest = (url: string): boolean => {
      // Прямые Company Level endpoints
      if (url.includes('/api/company/')) return true;

      // Endpoints которые требуют x-company-id
      const companyEndpoints = [
        '/clients',
        '/sales',
        '/purchases',
        '/stats',
        '/bank-operations',
        '/assistant',
        '/dashboard',
      ];

      return companyEndpoints.some(endpoint => url.includes(endpoint));
    };

    // ===============================================
    // 🏢 АВТОМАТИЧЕСКОЕ ДОБАВЛЕНИЕ X-COMPANY-ID
    // ===============================================
    if (config.url && isCompanyLevelRequest(config.url)) {
      if (currentCompanyId && currentCompanyId !== '0') {
        config.headers['x-company-id'] = currentCompanyId; // Используем lowercase как в middleware
        console.log(`🏢 Added x-company-id: ${currentCompanyId} to ${config.url}`);
      } else {
        console.warn(`⚠️ Company Level request to ${config.url} without valid company ID!`);
        console.warn(`💡 Current Company ID: ${currentCompanyId}`);
        console.warn('💡 Hint: Select a company first on /account/dashboard');
      }
    }

    // ===============================================
    // 📋 ACCOUNT LEVEL - НЕ ДОБАВЛЯЕМ X-COMPANY-ID  
    // ===============================================
    const isAccountLevelRequest = (url: string): boolean => {
      const accountEndpoints = [
        '/api/account/',
        '/api/auth/',
        '/login',
        '/register'
      ];

      return accountEndpoints.some(endpoint => url.includes(endpoint));
    };

    if (config.url && isAccountLevelRequest(config.url)) {
      console.log(`🏛️ Account Level request: ${config.url} (no x-company-id needed)`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ===============================================
// 🔄 RESPONSE INTERCEPTOR
// ===============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);

    // Логируем успешные ответы с данными
    if (response.data && response.config.url) {
      if (response.config.url.includes('/companies')) {
        console.log(`📊 Companies data:`, response.data.length || response.data.count || 'unknown');
      }
      if (response.config.url.includes('/clients')) {
        console.log(`👥 Clients data:`, Array.isArray(response.data.clients) ? response.data.clients.length : 'unknown count');
      }
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const errorMessage = error.response?.data?.error || error.message;

    console.error(`❌ API Error: ${status || 'Network'} ${url}`);
    console.error(`❌ Error details:`, errorMessage);

    // ===============================================
    // 🔒 ОБРАБОТКА ОШИБОК АВТОРИЗАЦИИ
    // ===============================================
    if (status === 401) {
      console.warn('🔒 Unauthorized - clearing auth data');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentCompanyId');
      localStorage.removeItem('currentCompanyName');

      // Редирект на логин (если не уже там)
      if (!window.location.pathname.includes('/login')) {
        console.log('🔀 Redirecting to login...');
        window.location.href = '/login';
      }
    }

    // ===============================================
    // 🏢 ОБРАБОТКА ОШИБОК КОНТЕКСТА КОМПАНИИ
    // ===============================================
    if (status === 400 && (
      errorMessage?.includes('Company context') || 
      errorMessage?.includes('Company ID') ||
      errorMessage?.includes('x-company-id')
    )) {
      console.warn('🏢 Company context error - redirecting to company selection');
      
      // Очищаем неверный контекст
      localStorage.removeItem('currentCompanyId');
      localStorage.removeItem('currentCompanyName');

      // Редирект на выбор компании
      if (!window.location.pathname.includes('/account/dashboard')) {
        console.log('🔀 Redirecting to account dashboard...');
        window.location.href = '/account/dashboard';
      }
    }

    // ===============================================
    // 📊 ПОЛЕЗНЫЕ СОВЕТЫ ПО ОШИБКАМ
    // ===============================================
    if (status === 404 && url?.includes('/clients')) {
      console.info('💡 Tip: Make sure you have selected a company and it has clients');
    }

    if (url?.includes('/api/company/') && !error.config?.headers?.['x-company-id']) {
      console.info('💡 Tip: x-company-id header is missing - check localStorage currentCompanyId');
    }

    return Promise.reject(error);
  }
);

export default api;