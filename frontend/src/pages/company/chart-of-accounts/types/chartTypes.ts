// f/src/pages/company/chart-of-accounts/types/chartTypes.ts

export interface ChartAccount {
    id: number;
    company_id: number;
    account_code: string;
    account_name: string;
    account_type: AccountType;
    currency?: string | null;
    is_active: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    creator?: {
      id: number;
      username: string;
      email: string;
    };
  }
  
  export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
  
  export interface AccountFormData {
    account_code: string;
    account_name: string;
    account_type: AccountType;
    currency?: string;
    is_active: boolean;
  }
  
  export interface AccountsStats {
    total: number;
    active: number;
    inactive: number;
    byType: {
      ASSET: number;
      LIABILITY: number;
      EQUITY: number;
      INCOME: number;
      EXPENSE: number;
    };
    byClass: {
      [key: string]: number;
    };
  }
  
  export interface AccountsTableProps {
    accounts: ChartAccount[];
    loading: boolean;
    onRefresh: () => void;
    onEdit: (account: ChartAccount) => void;
    onDelete: (id: number) => void;
  }
  
  export interface AccountFormProps {
    account?: ChartAccount | null;
    onSubmit: (data: AccountFormData) => void;
    onCancel: () => void;
    loading: boolean;
  }
  
  export interface AccountsStatsProps {
    stats: AccountsStats;
  }
  
  export interface AccountsToolbarProps {
    onAddAccount: () => void;
    onImportLithuanian: () => void;
    onSearch: (term: string) => void;
    onTypeFilter: (type: string) => void;
    onActiveFilter: (active: string) => void;
    searchTerm: string;
    typeFilter: string;
    activeFilter: string;
    totalAccounts: number;
  }
  
  export interface AddAccountModalProps {
    onClose: () => void;
    onSubmit: (data: AccountFormData) => void;
  }
  
  export interface EditAccountModalProps {
    account: ChartAccount;
    onClose: () => void;
    onSubmit: (data: AccountFormData) => void;
  }
  
  export interface ImportLithuanianModalProps {
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
  }
  
  // API Response types
  export interface ChartAccountsResponse {
    success: boolean;
    accounts: ChartAccount[];
    total: number;
    companyId: number;
  }
  
  export interface AccountStatsResponse {
    success: boolean;
    stats: AccountsStats;
    companyId: number;
  }
  
  export interface CreateAccountResponse {
    success: boolean;
    message: string;
    account: ChartAccount;
    companyId: number;
  }
  
  export interface ImportLithuanianResponse {
    success: boolean;
    message: string;
    imported: number;
    skipped: number;
    total: number;
    companyId: number;
  }
  
  // Constants
  export const ACCOUNT_TYPES: { value: AccountType; label: string; color: string }[] = [
    { value: 'ASSET', label: 'Assets (Активы)', color: 'bg-blue-100 text-blue-800' },
    { value: 'LIABILITY', label: 'Liabilities (Обязательства)', color: 'bg-red-100 text-red-800' },
    { value: 'EQUITY', label: 'Equity (Капитал)', color: 'bg-green-100 text-green-800' },
    { value: 'INCOME', label: 'Income (Доходы)', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'EXPENSE', label: 'Expenses (Расходы)', color: 'bg-orange-100 text-orange-800' }
  ];
  
  export const CURRENCY_OPTIONS = [
    { value: 'EUR', label: '€ Euro' },
    { value: 'USD', label: '$ US Dollar' },
    { value: 'UAH', label: '₴ Ukrainian Hryvnia' },
    { value: 'AED', label: 'د.إ UAE Dirham' }
  ];
  
  export const LITHUANIAN_ACCOUNT_CLASSES = [
    { class: '1', name: 'Non-current Assets (Внеоборотные активы)', color: 'bg-blue-50' },
    { class: '2', name: 'Current Assets (Оборотные активы)', color: 'bg-cyan-50' },
    { class: '4', name: 'Equity (Капитал)', color: 'bg-green-50' },
    { class: '5', name: 'Liabilities (Обязательства)', color: 'bg-red-50' },
    { class: '6', name: 'Expenses (Расходы)', color: 'bg-orange-50' },
    { class: '7', name: 'Income (Доходы)', color: 'bg-emerald-50' },
    { class: '8', name: 'Results (Результаты)', color: 'bg-purple-50' },
    { class: '9', name: 'Management Accounting (Управленческий учёт)', color: 'bg-gray-50' }
  ];