// f/src/pages/company/products/types/productsTypes.ts

export interface Product {
  id: number;
  company_id: number;
  code: string;
  name: string;
  description?: string;
  unit: string;
  price: string | number;
  cost_price?: string | number;
  currency: 'EUR' | 'USD' | 'PLN';
  vat_rate?: string | number;
  category?: string;
  subcategory?: string;
  min_stock?: string | number;
  current_stock?: string | number;
  is_active: boolean;
  is_service: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface ProductsStats {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  totalStockValue: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  companyId: number;
}

export interface ProductsStatsResponse {
  success: boolean;
  stats: ProductsStats;
  companyId: number;
}

export interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  copyStates: { [key: number]: 'idle' | 'copying' | 'success' | 'error' }; 
  onCopy: (productId: number, productName: string) => void; 
}

export interface ProductFormData {
  name: string;
  code: string;
  description: string;
  unit: string;
  price: number;
  cost_price: number;
  vat_rate: number;
  category: string;
  min_stock: number;
  current_stock: number;
  is_service: boolean;
  currency: 'EUR' | 'USD' | 'PLN';
}

export interface ProductsToolbarProps {
  onAddProduct: () => void;
  onSearch: (term: string) => void;
  onCategoryFilter: (category: string) => void;
  searchTerm: string;
  categoryFilter: string;
  totalProducts: number;
}

export interface AddProductModalProps {
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<void>;
}

export interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<void>;
}