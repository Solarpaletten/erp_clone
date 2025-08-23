// f/src/components/auth/AuthGuard.tsx
// ===============================================
// ��️ ПРОСТОЙ AUTH GUARD ДЛЯ ЗАЩИТЫ РОУТОВ
// ===============================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      // Проверяем наличие токенов (старый и новый формат)
      const authToken = localStorage.getItem('auth_token');
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      const userEmail = localStorage.getItem('user_email');

      console.log('🔍 Checking authentication...', {
        authToken: authToken ? `${authToken.substring(0, 20)}...` : 'none',
        token: token ? `${token.substring(0, 20)}...` : 'none',
        userEmail
      });

      if (authToken || token) {
        // Пользователь авторизован
        setIsAuthenticated(true);
        setUserEmail(userEmail || 'unknown');
        console.log('✅ User is authenticated:', userEmail);
      } else {
        // Пользователь не авторизован
        console.log('❌ No valid token found');
        setIsAuthenticated(false);
      }

    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setIsAuthenticated(false);
    }
  };

  // Показываем загрузку пока проверяем
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // Если нужна авторизация, но пользователь не авторизован → на логин
  if (requireAuth && !isAuthenticated) {
    console.log('🔒 Redirecting to login - auth required but user not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь авторизован, но пытается попасть на логин → на dashboard
  if (!requireAuth && isAuthenticated && location.pathname === '/login') {
    console.log('🔄 Redirecting authenticated user to dashboard');
    return <Navigate to="/account/dashboard" replace />;
  }

  // Добавляем данные пользователя в window для отладки
  if (typeof window !== 'undefined' && isAuthenticated) {
    (window as any).__SOLAR_AUTH = {
      authenticated: true,
      email: userEmail,
      location: location.pathname
    };
  }

  return <>{children}</>;
};

export default AuthGuard;
