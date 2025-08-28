// frontend/src/hooks/useCopyProduct.ts
import { useState } from 'react';
import { api } from '../api/axios';

interface CopyState {
  [key: number]: 'idle' | 'copying' | 'success' | 'error';
}

export const useCopyProduct = (onSuccess?: () => void) => {
  const [copyStates, setCopyStates] = useState<CopyState>({});

  const copyProduct = async (productId: number, productName: string) => {
    // Устанавливаем состояние копирования
    setCopyStates(prev => ({ ...prev, [productId]: 'copying' }));

    try {
      const response = await api.post(`/api/company/products/${productId}/copy`);
      
      if (response.data.success) {
        // Успешное копирование
        setCopyStates(prev => ({ ...prev, [productId]: 'success' }));
        
        // Вызываем callback для обновления списка
        if (onSuccess) {
          onSuccess();
        }
        
        // Сбрасываем состояние через 2 секунды
        setTimeout(() => {
          setCopyStates(prev => ({ ...prev, [productId]: 'idle' }));
        }, 2000);
        
        console.log('Товар успешно скопирован:', response.data);
      } else {
        throw new Error(response.data.message || 'Ошибка копирования');
      }
    } catch (error: any) {
      console.error('Ошибка при копировании товара:', error);
      
      // Состояние ошибки
      setCopyStates(prev => ({ ...prev, [productId]: 'error' }));
      
      // Показываем ошибку
      alert(error.response?.data?.message || 'Ошибка при копировании товара');
      
      // Сбрасываем состояние через 3 секунды
      setTimeout(() => {
        setCopyStates(prev => ({ ...prev, [productId]: 'idle' }));
      }, 3000);
    }
  };

  return {
    copyStates,
    copyProduct
  };
};