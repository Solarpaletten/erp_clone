// =====================================================
// 📝 TYPESCRIPT ТИПЫ ДЛЯ ГИБКОГО КОПИРОВАНИЯ
// frontend/src/types/flexibleCopyTypes.ts
// =====================================================

// 🎯 ЗАПРОС НА ГИБКОЕ КОПИРОВАНИЕ
export interface FlexibleCopyRequest {
    templateId: number;
    templateType: 'purchase' | 'sale' | 'full_operation';
    
    // 🎯 ФЛАГИ - ЧТО КОПИРОВАТЬ (галочки в UI)
    copyPurchase: boolean;        // 📦 Приход
    copySale: boolean;           // 💰 Реализация  
    copySupplierPayment: boolean; // 💸 Оплата поставщику
    copyCustomerPayment: boolean; // 💳 Поступление от покупателя
    
    // 🔧 ИЗМЕНЕНИЯ (опционально)
    changes?: {
      // Общие изменения
      supplier_id?: number;
      customer_id?: number;
      warehouse_id?: number;
      
      // Изменения прихода
      quantity?: number;
      unit_price?: number;
      total_net?: number;
      total_vat?: number;
      total_gross?: number;
      
      // Изменения реализации
      sale_quantity?: number;
      sale_price?: number;
      sale_net?: number;
      sale_vat?: number;
      sale_gross?: number;
      
      // Изменения платежей
      supplier_payment_amount?: number;
      customer_payment_amount?: number;
    };
  }
  
  // 🎊 ОТВЕТ ОТ СЕРВЕРА
  export interface FlexibleCopyResponse {
    success: boolean;
    message: string;
    
    // 📋 ЧТО БЫЛО СОЗДАНО
    created: {
      purchase: CreatedDocument | null;
      sale: CreatedDocument | null;
      supplierPayment: CreatedDocument | null;
      customerPayment: CreatedDocument | null;
    };
    
    // 📊 СТАТИСТИКА
    stats: {
      documentsCreated: number;
      accountingEntriesCreated: number;
      timeSaved: string;
      totalValue: number;
    };
    
    // 🎯 ФЛАГИ (для подтверждения)
    flags: {
      copyPurchase: boolean;
      copySale: boolean;
      copySupplierPayment: boolean;
      copyCustomerPayment: boolean;
    };
    
    // 📍 НАВИГАЦИЯ
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
  
  // 🎯 ШАБЛОНЫ ДЛЯ ВЫБОРА В МОДАЛЬНОМ ОКНЕ
  export interface TemplatesForCopy {
    success: boolean;
    templates: {
      purchases: TemplateOption[];
      sales: TemplateOption[];
      recent: TemplateOption[];
    };
    defaultFlags: {
      copyPurchase: boolean;
      copySale: boolean;
      copySupplierPayment: boolean;
      copyCustomerPayment: boolean;
    };
  }
  
  export interface TemplateOption {
    id: number;
    name: string;
    amount: number;
    date: string;
    type: 'purchase_template' | 'sale_template' | 'recent_purchase';
  }
  
  // 🎯 СОСТОЯНИЕ МОДАЛЬНОГО ОКНА КОПИРОВАНИЯ
  export interface CopyModalState {
    isOpen: boolean;
    selectedTemplate: TemplateOption | null;
    
    // Флаги копирования
    flags: {
      copyPurchase: boolean;
      copySale: boolean;
      copySupplierPayment: boolean;
      copyCustomerPayment: boolean;
    };
    
    // Быстрые изменения
    quickChanges: {
      quantity?: number;
      pricePerTon?: number;
      supplier?: { id: number; name: string };
      customer?: { id: number; name: string };
    };
    
    // Состояние загрузки
    isLoading: boolean;
    error: string | null;
  }
  
  // 🎯 ПРОПСЫ ДЛЯ КОМПОНЕНТОВ
  export interface FlexibleCopyButtonProps {
    templateId: number;
    templateType: 'purchase' | 'sale' | 'full_operation';
    buttonText?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline';
    onSuccess?: (response: FlexibleCopyResponse) => void;
    onError?: (error: string) => void;
  }
  
  export interface CopyModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: TemplatesForCopy['templates'];
    defaultFlags: TemplatesForCopy['defaultFlags'];
    onCopy: (request: FlexibleCopyRequest) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface CopyFlagsProps {
    flags: CopyModalState['flags'];
    onChange: (flags: CopyModalState['flags']) => void;
    disabled?: boolean;
  }
  
  export interface QuickChangesProps {
    changes: CopyModalState['quickChanges'];
    onChange: (changes: CopyModalState['quickChanges']) => void;
    selectedTemplate: TemplateOption | null;
  }
  
  // 🎯 ХУКИ
  export interface UseFlexibleCopy {
    copyWithFlags: (request: FlexibleCopyRequest) => Promise<FlexibleCopyResponse>;
    getTemplates: () => Promise<TemplatesForCopy>;
    isLoading: boolean;
    error: string | null;
    lastResponse: FlexibleCopyResponse | null;
  }
  
  // 📊 СТАТИСТИКА ИСПОЛЬЗОВАНИЯ
  export interface CopyStatistics {
    totalCopies: number;
    purchasesCopied: number;
    salesCopied: number;
    paymentsCopied: number;
    timeSavedMinutes: number;
    mostUsedTemplate: {
      id: number;
      name: string;
      useCount: number;
    };
    flagsUsage: {
      copyPurchase: number;
      copySale: number;
      copySupplierPayment: number;
      copyCustomerPayment: number;
    };
  }
  
  // 🎯 СОБЫТИЯ ДЛЯ АНАЛИТИКИ
  export type CopyEvent = {
    type: 'FLEXIBLE_COPY_STARTED';
    payload: {
      templateId: number;
      flags: FlexibleCopyRequest['flags'];
    };
  } | {
    type: 'FLEXIBLE_COPY_SUCCESS';
    payload: {
      documentsCreated: number;
      timeSaved: string;
    };
  } | {
    type: 'FLEXIBLE_COPY_ERROR';
    payload: {
      error: string;
    };
  } | {
    type: 'COPY_MODAL_OPENED';
    payload: {
      source: 'button' | 'shortcut' | 'menu';
    };
  } | {
    type: 'FLAGS_CHANGED';
    payload: {
      flags: FlexibleCopyRequest['flags'];
    };
  };
  
  export default FlexibleCopyRequest;