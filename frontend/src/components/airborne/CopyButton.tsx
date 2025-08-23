// =====================================================
// 📋 CopyButton.tsx - Исправленная кнопка копирования
// Файл: f/src/components/airborne/CopyButton.tsx
// =====================================================

import React, { useState } from 'react';
import { Copy, Zap, Check, Loader } from 'lucide-react';

interface CopyButtonProps {
  documentId: number;
  documentType: 'purchase' | 'sale' | 'payment' | 'receipt';
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onCopySuccess?: (response: any) => void;
  onCopyError?: (error: string) => void;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  documentId,
  documentType,
  variant = 'secondary',
  size = 'md',
  showText = true,
  onCopySuccess,
  onCopyError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleQuickCopy = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation(); // Предотвращаем всплытие события
    
    setIsLoading(true);
    
    try {
      // Получаем токен авторизации
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      // Быстрое копирование - только основной документ
      const response = await fetch('/api/airborne/flexible-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: documentId,
          templateType: documentType === 'purchase' ? 'purchase' : 'sale',
          copyPurchase: documentType === 'purchase',
          copySale: documentType === 'sale',
          copySupplierPayment: false,
          copyCustomerPayment: false,
          changes: {}
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка копирования');
      }

      const result = await response.json();
      
      // Показываем успех
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
      
      if (onCopySuccess) {
        onCopySuccess(result);
      } else {
        // Уведомление по умолчанию
        const documentsCount = result.stats?.documentsCreated || 1;
        const timeSaved = result.stats?.timeSaved || '5 минут';
        
        alert(`✅ Документ скопирован! Создано: ${documentsCount} документ(ов). Сэкономлено: ${timeSaved}`);
        
        // Перенаправляем на редактирование
        if (result.navigation?.primaryAction) {
          window.location.href = result.navigation.primaryAction;
        }
      }

    } catch (error) {
      console.error('Copy error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка копирования';
      
      if (onCopyError) {
        onCopyError(errorMessage);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Стили для разных вариантов
  const getButtonStyles = (): string => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg transition-all font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const variantStyles = {
      primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500 shadow-md',
      secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500',
      minimal: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    };

    const disabledStyles = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-current';

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${disabledStyles} ${className}`;
  };

  const getIcon = (): React.ReactNode => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    if (justCopied) {
      return <Check className={`${iconSize} text-green-500`} />;
    }
    
    if (isLoading) {
      return <Loader className={`${iconSize} animate-spin`} />;
    }
    
    return <Copy className={iconSize} />;
  };

  const getText = (): string => {
    if (justCopied) return 'Скопировано!';
    if (isLoading) return 'Копирование...';
    return 'Копировать';
  };

  const getTitle = (): string => {
    const docNames = {
      purchase: 'приход',
      sale: 'реализацию',
      payment: 'платеж',
      receipt: 'поступление'
    };
    
    return `Быстро скопировать ${docNames[documentType]} (10 секунд)`;
  };

  return (
    <button
      type="button"
      onClick={handleQuickCopy}
      disabled={isLoading}
      className={getButtonStyles()}
      title={getTitle()}
    >
      {getIcon()}
      {showText && (
        <span className={justCopied ? 'text-green-600' : ''}>
          {getText()}
        </span>
      )}
      
      {!isLoading && !justCopied && variant === 'primary' && (
        <Zap className="w-3 h-3 opacity-75" />
      )}
    </button>
  );
};

// =====================================================
// 🎯 СПЕЦИАЛИЗИРОВАННЫЕ КНОПКИ
// =====================================================

export const CopyPurchaseButton: React.FC<Omit<CopyButtonProps, 'documentType'>> = (props) => (
  <CopyButton {...props} documentType="purchase" />
);

export const CopySaleButton: React.FC<Omit<CopyButtonProps, 'documentType'>> = (props) => (
  <CopyButton {...props} documentType="sale" />
);

export const CopyPaymentButton: React.FC<Omit<CopyButtonProps, 'documentType'>> = (props) => (
  <CopyButton {...props} documentType="payment" />
);

export const CopyReceiptButton: React.FC<Omit<CopyButtonProps, 'documentType'>> = (props) => (
  <CopyButton {...props} documentType="receipt" />
);

// =====================================================
// 📱 FLOATING ACTION BUTTON
// =====================================================

export const FloatingCopyButton: React.FC<{
  documentId: number;
  documentType: CopyButtonProps['documentType'];
  onCopySuccess?: CopyButtonProps['onCopySuccess'];
}> = ({ documentId, documentType, onCopySuccess }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 md:hidden">
      <CopyButton
        documentId={documentId}
        documentType={documentType}
        variant="primary"
        size="lg"
        showText={false}
        onCopySuccess={onCopySuccess}
        className="shadow-xl hover:shadow-2xl rounded-full w-14 h-14"
      />
    </div>
  );
};

// =====================================================
// 🎯 ГРУППОВАЯ КНОПКА КОПИРОВАНИЯ
// =====================================================

interface CopyAllButtonProps {
  documents: Array<{
    id: number;
    type: CopyButtonProps['documentType'];
  }>;
  onCopySuccess?: (results: any[]) => void;
  onCopyError?: (error: string) => void;
  className?: string;
}

export const CopyAllButton: React.FC<CopyAllButtonProps> = ({
  documents,
  onCopySuccess,
  onCopyError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCopyAll = async (): Promise<void> => {
    if (documents.length === 0) return;

    setIsLoading(true);
    setProgress(0);
    
    try {
      const results = [];
      
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch('/api/airborne/flexible-copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            templateId: doc.id,
            templateType: doc.type === 'purchase' ? 'purchase' : 'sale',
            copyPurchase: doc.type === 'purchase',
            copySale: doc.type === 'sale',
            copySupplierPayment: false,
            copyCustomerPayment: false,
            changes: {}
          })
        });

        if (response.ok) {
          const result = await response.json();
          results.push(result);
        }

        setProgress(((i + 1) / documents.length) * 100);
        
        // Небольшая пауза между запросами
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (onCopySuccess) {
        onCopySuccess(results);
      } else {
        alert(`✅ Скопировано ${results.length} из ${documents.length} документов!`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка массового копирования';
      
      if (onCopyError) {
        onCopyError(errorMessage);
      } else {
        alert(`❌ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleCopyAll}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="w-4 h-4 animate-spin" />
          <span>Копирование {Math.round(progress)}%</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Копировать все ({documents.length})</span>
          <Zap className="w-3 h-3 opacity-75" />
        </>
      )}
    </button>
  );
};

export default CopyButton;