// src/services/account/authService.ts 
import { api } from '../../api/axios';

export interface Company {
  id: number;
  code: string;
  name: string;
  director_name: string;
  user_id: number;
  is_active: boolean;
  setup_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  username?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
  redirectTo?: string;
}

export interface RegisterResponse extends LoginResponse {
  emailVerificationSent?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  name?: string;
  phone?: string;
  surname?: string;
}

export interface CompanySetupData {
  companyCode: string;
  directorName: string;
  name?: string;
  email?: string;
  phone?: string;
}

const authService = {
  /**
   * Авторизация пользователя
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      // Сохраняем токен и пользователя в localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Проверяем наличие редиректа в ответе
      if (response.data.redirectTo) {
        // Сохраняем URL для дальнейшего использования
        localStorage.setItem('pendingRedirect', response.data.redirectTo);
      }

      return response.data;
    } catch (error: any) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Не удалось выполнить вход');
    }
  },

  /**
   * Регистрация нового пользователя с автоматическим созданием компании
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data);

      // Сохраняем токен и пользователя в localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Сохраняем данные, необходимые для онбординга
      localStorage.setItem('companyName', data.name || data.username);
      localStorage.setItem('email', data.email);
      if (data.phone) localStorage.setItem('phone', data.phone);

      // Устанавливаем флаг необходимости онбординга
      localStorage.setItem('needsOnboarding', 'true');

      // Проверяем наличие редиректа в ответе
      if (response.data.redirectTo) {
        localStorage.setItem('pendingRedirect', response.data.redirectTo);
      }

      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Не удалось зарегистрироваться');
    }
  },

  /**
   * Настройка компании (вызывается после регистрации)
   */
  setupCompany: async (
    data: CompanySetupData
  ): Promise<{ company: Company; client: any; redirectTo?: string }> => {
    try {
      // Стандартизируем код компании, удаляя возможный суффикс
      const cleanCompanyCode = standardizeCompanyCode(data.companyCode);

      // Логируем для отладки оригинальный и очищенный код
      console.log('Company code standardization:', {
        original: data.companyCode,
        standardized: cleanCompanyCode,
      });

      const requestData = {
        ...data,
        companyCode: cleanCompanyCode,
      };

      const response = await api.post('/onboarding/setup', requestData);

      // Удаляем флаг онбординга
      localStorage.removeItem('needsOnboarding');

      // Проверяем, пришел ли обновленный токен
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Проверяем, есть ли информация о том, куда перенаправить пользователя
      if (response.data.redirectTo) {
        localStorage.setItem('pendingRedirect', response.data.redirectTo);
      }

      // Если пришел ID компании, сохраняем его
      if (response.data.company && response.data.company.id) {
        localStorage.setItem(
          'currentCompanyId',
          response.data.company.id.toString()
        );
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Не удалось настроить компанию');
    }
  },

  /**
   * Проверка токена на валидность
   */
  validateToken: async (
    token: string
  ): Promise<{ valid: boolean; user?: AuthUser; redirectTo?: string }> => {
    try {
      const response = await api.post('/auth/validate-token', { token });

      // Если токен валидный и пришли данные пользователя, обновляем их в localStorage
      if (response.data.valid && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Если пришло указание для редиректа
      if (response.data.redirectTo) {
        localStorage.setItem('pendingRedirect', response.data.redirectTo);
      }

      return response.data;
    } catch (error) {
      return { valid: false };
    }
  },

  /**
   * Получение списка компаний текущего пользователя
   */
  getMyCompanies: async (): Promise<Company[]> => {
    try {
      const response = await api.get('/clients/companies');
      return response.data;
    } catch (error: any) {
      throw new Error('Не удалось получить список компаний');
    }
  },

  /**
   * Выбор компании пользователя - запрос на сервер для обновления токена
   * с информацией о выбранной компании + сохранение ID в localStorage
   */
  selectCompany: async (companyId: number | string): Promise<void> => {
    try {
      // Отправляем запрос на сервер для выбора компании и обновления токена
      const response = await api.post(`/auth/companies/${companyId}/select`);

      // Обновляем токен в localStorage
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }

      // Сохраняем ID выбранной компании
      localStorage.setItem('currentCompanyId', companyId.toString());

      // Проверяем, есть ли указание для редиректа
      if (response.data.redirectTo) {
        window.location.href = response.data.redirectTo;
      } else {
        // Возвращаем на корневой URL после выбора компании
        window.location.href = '/';
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Не удалось выбрать компанию');
    }
  },

  /**
   * Получение текущего пользователя
   */
  getCurrentUser: (): AuthUser | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (error) {
      return null;
    }
  },

  /**
   * Получение ID выбранной компании
   */
  getSelectedCompanyId: (): number | null => {
    const id = localStorage.getItem('currentCompanyId');
    return id ? parseInt(id, 10) : null;
  },

  /**
   * Проверка, авторизован ли пользователь
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Проверка необходимости онбординга
   */
  needsOnboarding: (): boolean => {
    return localStorage.getItem('needsOnboarding') === 'true';
  },

  /**
   * Выход из системы
   * @param serverLogout - если true, то будет отправлен запрос на сервер для инвалидации токена
   */
  logout: async (serverLogout: boolean = false): Promise<void> => {
    if (serverLogout) {
      try {
        // Отправляем запрос на сервер для инвалидации токена
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Error during server logout:', error);
        // Даже если запрос не удался, продолжаем очистку localStorage
      }
    }

    // Очищаем все данные пользователя из localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentCompanyId');
    localStorage.removeItem('needsOnboarding');
    localStorage.removeItem('companyName');
    localStorage.removeItem('email');
    localStorage.removeItem('phone');
    localStorage.removeItem('pendingRedirect');
  },

  /**
   * Восстановление пароля (отправка ссылки на email)
   */
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error('Не удалось отправить ссылку для восстановления пароля');
    }
  },

  /**
   * Сброс пароля по токену
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      await api.post('/auth/reset-password', { token, password });
    } catch (error: any) {
      throw new Error('Не удалось сбросить пароль');
    }
  },

  /**
   * Подтверждение email по токену
   */
  verifyEmail: async (
    token: string
  ): Promise<{ message: string; redirectTo?: string }> => {
    try {
      const response = await api.get(`/auth/confirm?token=${token}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Не удалось подтвердить email');
    }
  },

  /**
   * Повторная отправка подтверждения email
   */
  resendVerification: async (email: string): Promise<void> => {
    try {
      await api.post('/auth/resend-verification', { email });
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Не удалось отправить повторное подтверждение email');
    }
  },

  /**
   * Проверка наличия и возврат пендинга для редиректа
   */
  getPendingRedirect: (): string | null => {
    return localStorage.getItem('pendingRedirect');
  },

  /**
   * Очистка пендинга для редиректа после использования
   */
  clearPendingRedirect: (): void => {
    localStorage.removeItem('pendingRedirect');
  },
};

export default authService;
