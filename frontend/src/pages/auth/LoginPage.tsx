// f/src/pages/auth/LoginPage.tsx


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/account/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('solar@solar.com');
  const [password, setPassword] = useState('pass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔑 Attempting login with real API:', email);

      // 🔧 ИСПОЛЬЗУЕМ РЕАЛЬНЫЙ API ВМЕСТО MOKA

      const response = await authService.login(email, password);
      console.log('🔑 Login response:', response);

      if (!response || !response.user) {
        throw new Error('Не удалось получить данные пользователя');
      }

      //Перенаправляем на Dashboard
      navigate('/account/dashboard');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Ошибка входа в систему');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Быстрый логин с реальными данными
  const quickLogin = async () => {
    setEmail('solar@solar.com');
    setPassword('pass123');
    // Небольшая задержка для Ui
    setTimeout(() => {
      const form = document.querySelector('form') as HTMLFormElement;
      form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Navigation */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">SOLAR ERP</div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-blue-600">Product</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Integrations</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Training</a>
          <a href="#" className="text-gray-600 hover:text-blue-600">Prices</a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">☀️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Вход в систему</h1>
              <p className="text-gray-600">Real API Connection</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <strong>Ошибка:</strong> {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Quick Login Button */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Быстрый вход с тестовыми данными:</p>
              <button
                onClick={quickLogin}
                disabled={loading}
                className="w-full bg-green-100 hover:bg-green-200 text-green-800 py-2 px-4 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                🚀 Быстрый логин (solar@solar.com)
              </button>
            </div>

            {/* Test Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">🔧 Тестовые данные (Real API):</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• Email: <strong>solar@solar.com</strong></p>
                <p>• Password: <strong>pass123</strong></p>
                <p>• Backend: <strong>api.itsolar.pl</strong></p>
                <p>• Database: <strong>PostgreSQL</strong></p>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Нет аккаунта?{' '}
              <button
                onClick={() => navigate('/auth/register')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 text-center text-sm text-gray-500">
        <p>&copy; 2025 Solar ERP. Two-Level Multi-Tenant Architecture.</p>
      </div>
    </div>
  );
};

export default LoginPage;
