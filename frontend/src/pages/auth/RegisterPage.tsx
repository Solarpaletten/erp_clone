// src/pages/auth/RegisterPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/account/authService';
import LanguageSwitcher from '../../components/account/LanguageSwitcher';

interface RegisterFormData {
  email: string;
  phone: string;
  name: string;
  surname: string;
  password: string;
}

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const messageFromLocation = location.state?.message || null;

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    name: '',
    surname: '',
    password: '',
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Автозаполнение формы в режиме разработки
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setFormData({
        email: 'test@example.com',
        phone: '+49123456789',
        name: 'Test',
        surname: 'User',
        password: 'test1234',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setError(t('Please agree to LEANID SOLAR terms'));
      return;
    }
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        username: formData.name,
        name: formData.name,
        phone: formData.phone,
        surname: formData.surname,
      });

      console.log('Registration response:', response); // Для отладки

      // Сохраняем токен в localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      } else {
        console.error('No token received in registration response');
      }

      // Сохраняем другие данные
      localStorage.setItem('companyName', formData.name);
      localStorage.setItem('email', formData.email);
      localStorage.setItem('phone', formData.phone);
      // После регистрации, внутри блока try после сохранения токена
      localStorage.setItem('needsOnboarding', 'true');

      // Проверяем, было ли отправлено письмо с подтверждением email
      if (response.emailVerificationSent) {
        setSuccessMessage(
          response.message ||
            t(
              'Registration successful! Please check your email to confirm your account before logging in.'
            )
        );
      } else {
        setSuccessMessage(
          `${t('Registration successful')}! ${t('Your login')}: ${formData.email}`
        );
      }

      // Перенаправляем на онбординг с небольшой задержкой
      setTimeout(() => {
        navigate('/onboarding', { replace: true });
      }, 3000);
    } catch (err: any) {
      setError(err.message || t('Failed to register'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation bar with language switcher */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">LEANID SOLAR</div>
        <div className="flex space-x-4">
          <a href="#" className="text-gray-600 hover:text-blue-600">
            {t('product')}
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            {t('integrations')}
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            {t('training')}
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            {t('prices')}
          </a>
          <a href="#" className="text-gray-600 hover:text-blue-600">
            {t('accountingCompanies')}
          </a>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t('signIn')}
            </button>
            <button
              onClick={() => navigate('/auth/register')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {t('register')}
            </button>
          </div>
        </div>
      </nav>

      {/* Registration form */}
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded shadow">
          <h1 className="text-2xl font-bold mb-4 text-center">
            {t('registerTitle')}
          </h1>

          {messageFromLocation && (
            <div className="p-2 text-sm text-green-700 bg-green-100 border border-green-300 rounded mb-4">
              {messageFromLocation}
            </div>
          )}

          <div className="flex justify-center space-x-2 mb-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">
              Facebook
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded">
              Google
            </button>
          </div>
          <p className="text-center text-gray-600 mb-4">
            {t('Or fill out the registration form')}
          </p>
          {successMessage && (
            <div className="p-2 text-sm text-green-700 bg-green-100 border border-green-300 rounded mb-4">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="p-2 text-sm text-red-700 bg-red-100 border border-red-300 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('email')} *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('phone')} *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('firstName')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('lastName')} *
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('password')} *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm text-gray-600">
                {t('agreeToTerms')}{' '}
                <a href="#" className="text-blue-500 hover:underline">
                  terms
                </a>
              </label>
            </div>

            {/* Скрытая кнопка для ручного автозаполнения формы (только в режиме разработки) */}
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                hidden
                onClick={() =>
                  setFormData({
                    email: 'test@example.com',
                    phone: '+49123456789',
                    name: 'Test',
                    surname: 'User',
                    password: 'test1234',
                  })
                }
              >
                Autofill
              </button>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {t('register')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
