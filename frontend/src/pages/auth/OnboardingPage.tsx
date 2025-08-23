import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import authService from '../../services/account/authService';

interface OnboardingFormData {
  companyCode: string;
  directorName: string;
  name?: string;
  email?: string;
  phone?: string;
}

// Схема валидации с Yup
const OnboardingSchema = Yup.object().shape({
  companyCode: Yup.string()
    .required('Company code is required')
    .min(3, 'Company code must be at least 3 characters')
    .max(50, 'Company code must be at most 50 characters')
    .matches(
      /^[a-zA-Z0-9_-]+$/,
      'Company code can only contain letters, numbers, dash and underscore'
    ),

  directorName: Yup.string()
    .required('Director name is required')
    .min(2, 'Director name must be at least 2 characters')
    .max(100, 'Director name must be at most 100 characters'),

  name: Yup.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be at most 100 characters'),

  email: Yup.string().email('Invalid email format'),

  phone: Yup.string()
    .min(7, 'Phone number must be at least 7 characters')
    .max(20, 'Phone number must be at most 20 characters'),
});

const OnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const initialValues: OnboardingFormData = {
    companyCode: '',
    directorName: '',
    name: localStorage.getItem('companyName') || '',
    email: localStorage.getItem('email') || '',
    phone: localStorage.getItem('phone') || '',
  };

  const handleSubmit = async (
    values: OnboardingFormData,
    { setSubmitting }: FormikHelpers<OnboardingFormData>
  ) => {
    setError(null);
    setSuccessMessage(null);

    try {
      await authService.setupCompany(values);

      setSuccessMessage(t('Company setup successful'));
      localStorage.removeItem('needsOnboarding'); // Удаляем флаг необходимости онбординга

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('Failed to complete setup'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Очистить токен и другие данные пользователя
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastUsedCompanyId');
    localStorage.removeItem('needsOnboarding');

    // Перенаправить на страницу входа
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('setupYourCompany')}</h1>

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

      <Formik
        initialValues={initialValues}
        validationSchema={OnboardingSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('companyCode')} *
              </label>
              <Field
                type="text"
                name="companyCode"
                className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                  errors.companyCode && touched.companyCode
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="companyCode"
                component="p"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('directorName')} *
              </label>
              <Field
                type="text"
                name="directorName"
                className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                  errors.directorName && touched.directorName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="directorName"
                component="p"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('companyName')}
              </label>
              <Field
                type="text"
                name="name"
                className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                  errors.name && touched.name
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="name"
                component="p"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('email')}
              </label>
              <Field
                type="email"
                name="email"
                className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                  errors.email && touched.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('phone')}
              </label>
              <Field
                type="text"
                name="phone"
                className={`mt-1 block w-full border rounded px-3 py-2 text-sm ${
                  errors.phone && touched.phone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ErrorMessage
                name="phone"
                component="p"
                className="mt-1 text-sm text-red-600"
              />
            </div>

            <div className="flex justify-between space-x-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t('logout')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? t('processing') : t('finishSetup')}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OnboardingPage;
