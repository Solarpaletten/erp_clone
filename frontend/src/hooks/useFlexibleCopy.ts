// =====================================================
// 🪝 useFlexibleCopy.ts - React Hook для гибкого копирования
// Файл: f/src/hooks/useFlexibleCopy.ts
// =====================================================

import { useState, useCallback } from 'react';

// Типы для API
interface FlexibleCopyRequest {
  templateId: number;
  templateType: 'purchase' | 'sale' | 'full_operation';
  copyPurchase: boolean;
  copySale: boolean;
  copySupplierPayment: boolean;
  copyCustomerPayment: boolean;
  changes?: {
    supplier_id?: number;
    customer_id?: number;
    warehouse_id?: number;
    quantity?: number;
    unit_price?: number;
    total_net?: number;
    total_vat?: number;
    total_gross?: number;
    sale_quantity?: number;
    sale_price?: number;
    sale_net?: number;
    sale_vat?: number;
    sale_gross?: number;
    supplier_payment_amount?: number;
    customer_payment_amount?: number;
  };
}

interface CreatedDocument {
  id: number;
  docNumber: string;
  amount: number;
  client: string;
  editUrl: string;
}

interface FlexibleCopyResponse {
  success: boolean;
  message: string;
  created: {
    purchase: CreatedDocument | null;
    sale: CreatedDocument | null;
    supplierPayment: CreatedDocument | null;
    customerPayment: CreatedDocument | null;
  };
  stats: {
    documentsCreated: number;
    accountingEntriesCreated: number;
    timeSaved: string;
    totalValue: number;
  };
  flags: {
    copyPurchase: boolean;
    copySale: boolean;
    copySupplierPayment: boolean;
    copyCustomerPayment: boolean;
  };
  navigation: {
    primaryAction: string | null;
    secondaryActions: string[];
  };
}

interface Template {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'purchase_template' | 'sale_template' | 'recent_purchase' | 'recent_sale';
  client: string;
  itemsCount: number;
  firstProduct?: string;
}

interface TemplatesResponse {
  success: boolean;
  templates: {
    purchases: Template[];
    sales: Template[];
    recentPurchases: Template[];
    recentSales: Template[];
  };
  defaultFlags: {
    copyPurchase: boolean;
    copySale: boolean;
    copySupplierPayment: boolean;
    copyCustomerPayment: boolean;
  };
}

interface UseFlexibleCopyResult {
  // Состояние
  isLoading: boolean;
  error: string | null;
  lastResponse: FlexibleCopyResponse | null;
  templates: TemplatesResponse['templates'] | null;

  // Функции
  copyWithFlags: (request: FlexibleCopyRequest) => Promise<FlexibleCopyResponse>;
  getTemplates: () => Promise<TemplatesResponse>;
  quickCopy: (templateId: number, documentType: 'purchase' | 'sale') => Promise<FlexibleCopyResponse>;
  clearError: () => void;
  reset: () => void;
}

const useFlexibleCopy = (): UseFlexibleCopyResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<FlexibleCopyResponse | null>(null);
  const [templates, setTemplates] = useState<TemplatesResponse['templates'] | null>(null);

  // Получение токена авторизации
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  // Базовая функция для API запросов
  const apiRequest = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> => {
    const token = getAuthToken();
    
    const response = await fetch(`/api/airborne${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Если не удалось парсить JSON, используем статусный текст
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }, [getAuthToken]);

  // Главная функция гибкого копирования
  const copyWithFlags = useCallback(async (request: FlexibleCopyRequest): Promise<FlexibleCopyResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<FlexibleCopyResponse>('/flexible-copy', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка копирования';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Получение шаблонов для модального окна
  const getTemplates = useCallback(async (): Promise<TemplatesResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<TemplatesResponse>('/templates/for-flexible-copy');
      setTemplates(response.templates);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки шаблонов';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  // Быстрое копирование (только один документ)
  const quickCopy = useCallback(async (
    templateId: number, 
    documentType: 'purchase' | 'sale'
  ): Promise<FlexibleCopyResponse> => {
    const request: FlexibleCopyRequest = {
      templateId,
      templateType: documentType,
      copyPurchase: documentType === 'purchase',
      copySale: documentType === 'sale',
      copySupplierPayment: false,
      copyCustomerPayment: false,
    };

    return copyWithFlags(request);
  }, [copyWithFlags]);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Сброс состояния
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResponse(null);
    setTemplates(null);
  }, []);

  return {
    // Состояние
    isLoading,
    error,
    lastResponse,
    templates,

    // Функции
    copyWithFlags,
    getTemplates,
    quickCopy,
    clearError,
    reset,
  };
};

// Дополнительный хук для статистики
export const useAirborneStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/airborne/stats/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }

      const data = await response.json();
      setStats(data.dashboard);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
};

// Хук для инициализации шаблонов
export const useTemplateInitialization = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  const initializeTemplates = useCallback(async (companyId: number) => {
    setIsInitializing(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch('/api/airborne/company/init-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка инициализации шаблонов');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка инициализации шаблонов';
      setError(errorMessage);
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [getAuthToken]);

  const checkTemplates = useCallback(async (companyId: number) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/airborne/company/${companyId}/templates/check`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка проверки шаблонов');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error checking templates:', err);
      return { oilTradingReady: false };
    }
  }, [getAuthToken]);

  return {
    isInitializing,
    error,
    initializeTemplates,
    checkTemplates,
  };
};

export default useFlexibleCopy;