// =====================================================
// 📋 CopyButton.tsx - Кнопка копирования документов
// Файл: f/src/components/airborne/CopyButton.tsx
// =====================================================

import React, { useState } from 'react';
import { Copy, Zap, Check } from 'lucide-react';

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

  const handleQuickCopy = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    
    setIsLoading(true);
    
    try {
      // Быстрое копирование - только основной документ
      const response = await fetch('/api/airborne/flexible-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          templateId: documentId,
          templateType: documentType,
          copyPurchase: documentType === 'purchase',
          copySale: documentType === 'sale',
          copySupplierPayment: false,
          copyCustomerPayment: false,
          changes: {}
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка копирования');
      }

      const result = await response.json();
      
      // Показываем успех
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
      
      if (onCopySuccess) {
        onCopySuccess(result);
      } else {
        // Уведомление по умолчанию
        alert(`✅ Документ скопирован! Создано: ${result.stats?.documentsCreated || 1} документ(ов)`);
        
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
  const getButtonStyles = () => {
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

  const getIcon = () => {
    if (justCopied) {
      return <Check className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} text-green-500`} />;
    }
    
    if (isLoading) {
      return (
        <div className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} border-2 border-current border-t-transparent rounded-full animate-spin`} />
      );
    }
    
    return <Copy className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />;
  };

  const getText = () => {
    if (justCopied) return 'Скопировано!';
    if (isLoading) return 'Копирование...';
    return 'Копировать';
  };

  const getTitle = () => {
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

// Специализированные кнопки для разных типов документов
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

// Floating Action Button для мобильных устройств
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

export default CopyButton;