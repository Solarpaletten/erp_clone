// =====================================================
// 🔧 airborneService.ts - API Service для "Воздушной Бухгалтерии"
// Файл: f/src/services/airborneService.ts
// =====================================================

// Базовая конфигурация API
const API_BASE_URL = '/api/airborne';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

const config: ApiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 секунд
  retries: 3
};

// Утилита для получения токена
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Базовый класс для HTTP запросов
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number = 30000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = getAuthToken();

    // Создаем AbortController для таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || data.error || 'Unknown error');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Превышено время ожидания запроса');
        }
        throw error;
      }
      
      throw new Error('Неизвестная ошибка');
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Специфичные ошибки
      if (response.status === 401) {
        // Redirect to login or refresh token
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        errorMessage = 'Недостаточно прав для выполнения операции';
      }
      
      if (response.status === 404) {
        errorMessage = 'Ресурс не найден';
      }
      
      if (response.status >= 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже.';
      }
      
    } catch {
      // Если не удалось парсить JSON ошибки, используем статусный текст
    }
    
    throw new Error(errorMessage);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Создаем экземпляр HTTP клиента
const httpClient = new HttpClient(config.baseURL, config.timeout);

// =====================================================
// 🎯 ТИПЫ ДЛЯ API
// =====================================================

export interface FlexibleCopyRequest {
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

export interface FlexibleCopyResponse {
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

export interface CreatedDocument {
  id: number;
  docNumber: string;
  amount: number;
  client: string;
  editUrl: string;
}

export interface Template {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'purchase_template' | 'sale_template' | 'recent_purchase' | 'recent_sale';
  client: string;
  itemsCount: number;
  firstProduct?: string;
}

export interface TemplatesResponse {
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

export interface InitTemplatesRequest {
  companyId: number;
}

export interface InitTemplatesResponse {
  success: boolean;
  message: string;
  data: {
    templates: {
      warehouse: { id: number; name: string; code: string };
      product: { id: number; name: string; price: string; quantity: string; vat: string };
      supplier: { id: number; name: string; account: string };
      customer: { id: number; name: string; account: string };
      responsiblePerson: { id: number; name: string };
      chartOfAccounts: { count: number; accounts: string[] };
    };
    companyId: number;
    createdAt: string;
    readyForOilTrading: boolean;
  };
}

export interface StatsResponse {
  success: boolean;
  stats: {
    totalCopies: number;
    copiedPurchases: number;
    copiedSales: number;
    minutesSaved: number;
    hoursSaved: number;
    daysSaved: number;
    efficiency: string;
    message: string;
  };
}

export interface DashboardStats {
  success: boolean;
  dashboard: {
    today: { copies: number; timeSaved: string };
    week: { copies: number; timeSaved: string };
    month: { copies: number; timeSaved: string };
    templates: { total: number; ready: boolean };
    mostUsed: string;
    airborneStatus: 'READY' | 'SETUP_REQUIRED';
  };
}

// =====================================================
// 🚀 ОСНОВНЫЕ API ФУНКЦИИ
// =====================================================

export class AirborneService {
  // 🎯 ГИБКОЕ КОПИРОВАНИЕ - ГЛАВНАЯ ФУНКЦИЯ
  static async flexibleCopy(request: FlexibleCopyRequest): Promise<FlexibleCopyResponse> {
    return httpClient.post<FlexibleCopyResponse>('/flexible-copy', request);
  }

  // 📋 ПОЛУЧЕНИЕ ШАБЛОНОВ ДЛЯ МОДАЛЬНОГО ОКНА
  static async getTemplatesForCopy(): Promise<TemplatesResponse> {
    return httpClient.get<TemplatesResponse>('/templates/for-flexible-copy');
  }

  // 🏗️ ИНИЦИАЛИЗАЦИЯ БАЗОВЫХ ШАБЛОНОВ
  static async initCompanyTemplates(companyId: number): Promise<InitTemplatesResponse> {
    return httpClient.post<InitTemplatesResponse>('/company/init-templates', { companyId });
  }

  // 🔍 ПРОВЕРКА СУЩЕСТВОВАНИЯ ШАБЛОНОВ
  static async checkTemplatesExist(companyId: number): Promise<{
    success: boolean;
    oilTradingReady: boolean;
    templates: {
      warehouse: boolean;
      oilProduct: boolean;
      assetBilans: boolean;
      swapoil: boolean;
    };
    readyForAirborne: boolean;
    message: string;
  }> {
    return httpClient.get(`/company/${companyId}/templates/check`);
  }

  // ⚡ БЫСТРОЕ КОПИРОВАНИЕ (только один документ)
  static async quickCopy(
    templateId: number, 
    documentType: 'purchase' | 'sale'
  ): Promise<FlexibleCopyResponse> {
    const request: FlexibleCopyRequest = {
      templateId,
      templateType: documentType,
      copyPurchase: documentType === 'purchase',
      copySale: documentType === 'sale',
      copySupplierPayment: false,
      copyCustomerPayment: false,
    };

    return this.flexibleCopy(request);
  }

  // 📊 СТАТИСТИКА ЭКОНОМИИ ВРЕМЕНИ
  static async getTimeSavedStats(): Promise<StatsResponse> {
    return httpClient.get<StatsResponse>('/stats/time-saved');
  }

  // 📈 DASHBOARD СТАТИСТИКА
  static async getDashboardStats(): Promise<DashboardStats> {
    return httpClient.get<DashboardStats>('/stats/dashboard');
  }

  // 📋 ВСЕ ШАБЛОНЫ КОМПАНИИ
  static async getAllTemplates(): Promise<{
    success: boolean;
    templates: {
      warehouses: any[];
      products: any[];
      clients: any[];
      purchases: any[];
      sales: any[];
    };
    count: {
      warehouses: number;
      products: number;
      clients: number;
      purchases: number;
      sales: number;
      total: number;
    };
  }> {
    return httpClient.get('/templates');
  }

  // 🔄 ИЗМЕНЕНИЕ ПОРЯДКА ШАБЛОНОВ
  static async reorderTemplates(
    templateType: 'purchases' | 'sales' | 'clients' | 'products' | 'warehouses',
    items: Array<{ id: number; order: number }>
  ): Promise<{
    success: boolean;
    message: string;
    updatedCount: number;
  }> {
    return httpClient.post('/templates/reorder', { templateType, items });
  }

  // 🗑️ УДАЛЕНИЕ ШАБЛОНА
  static async deleteTemplate(
    type: 'warehouse' | 'product' | 'client' | 'purchase' | 'sale',
    id: number
  ): Promise<{
    success: boolean;
    message: string;
    deletedId: number;
  }> {
    return httpClient.delete(`/templates/${type}/${id}`);
  }

  // 📊 СТАТИСТИКА ИСПОЛЬЗОВАНИЯ ШАБЛОНОВ
  static async getTemplateUsageStats(): Promise<{
    success: boolean;
    stats: {
      totalCopies: number;
      recentActivity: number;
      timeSavedMinutes: number;
      timeSavedHours: number;
      topTemplates: Array<{ name: string; totalUses: number }>;
      efficiency: {
        documentsPerDay: string;
        timePerDocument: string;
        efficiency: string;
      };
    };
  }> {
    return httpClient.get('/templates/usage-stats');
  }
}

// =====================================================
// 🛠️ УТИЛИТЫ И ХЕЛПЕРЫ
// =====================================================

export class AirborneUtils {
  // Форматирование времени экономии
  static formatTimeSaved(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return remainingMinutes > 0 ? `${hours} ч ${remainingMinutes} мин` : `${hours} ч`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    return `${days} дн ${remainingHours} ч`;
  }

  // Получение иконки для типа документа
  static getDocumentIcon(type: string): string {
    const icons = {
      purchase: '📦',
      sale: '💰',
      payment: '💸',
      receipt: '💳',
      purchase_template: '📋',
      sale_template: '📋',
      recent_purchase: '🕐',
      recent_sale: '🕐'
    };
    
    return icons[type as keyof typeof icons] || '📄';
  }

  // Получение цвета для типа документа
  static getDocumentColor(type: string): string {
    const colors = {
      purchase: 'blue',
      sale: 'green',
      payment: 'red',
      receipt: 'purple',
      purchase_template: 'blue',
      sale_template: 'green',
      recent_purchase: 'gray',
      recent_sale: 'gray'
    };
    
    return colors[type as keyof typeof colors] || 'gray';
  }

  // Валидация запроса на копирование
  static validateCopyRequest(request: FlexibleCopyRequest): string | null {
    if (!request.templateId) {
      return 'ID шаблона обязателен';
    }

    const hasAnyFlag = request.copyPurchase || request.copySale || 
                      request.copySupplierPayment || request.copyCustomerPayment;
    
    if (!hasAnyFlag) {
      return 'Выберите хотя бы один документ для копирования';
    }

    if (request.changes?.quantity && request.changes.quantity <= 0) {
      return 'Количество должно быть больше нуля';
    }

    if (request.changes?.unit_price && request.changes.unit_price <= 0) {
      return 'Цена должна быть больше нуля';
    }

    return null;
  }

  // Расчет общей стоимости с НДС
  static calculateTotalWithVAT(
    quantity: number, 
    pricePerUnit: number, 
    vatRate: number = 23
  ): {
    net: number;
    vat: number;
    gross: number;
  } {
    const net = quantity * pricePerUnit;
    const vat = net * (vatRate / 100);
    const gross = net + vat;

    return {
      net: Math.round(net * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      gross: Math.round(gross * 100) / 100
    };
  }

  // Генерация уведомления об успешном копировании
  static generateSuccessMessage(response: FlexibleCopyResponse): string {
    const docs = [];
    if (response.created.purchase) docs.push('приход');
    if (response.created.sale) docs.push('реализацию');
    if (response.created.supplierPayment) docs.push('платеж поставщику');
    if (response.created.customerPayment) docs.push('поступление от покупателя');

    const docsList = docs.join(', ');
    return `✅ Успешно скопированы: ${docsList}. Сэкономлено: ${response.stats.timeSaved}`;
  }
}

// Экспорт по умолчанию
export default AirborneService;