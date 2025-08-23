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