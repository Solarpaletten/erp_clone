// f/src/pages/company/purchases/types/purchasesTypes.ts

export interface Purchase {
    id: number;
    company_id: number;
    document_number: string;
    document_date: string;
    operation_type: PurchaseOperationType;
    supplier_id: number;
    warehouse_id?: number;
    purchase_manager_id?: number;
    subtotal: number;
    vat_amount: number;
    total_amount: number;
    currency: Currency;
    payment_status: PaymentStatus;
    delivery_status: DeliveryStatus;
    document_status: DocumentStatus;
    created_by: number;
    created_at: string;
    updated_by?: number;
    updated_at: string;
  
    // Relations
    supplier?: Client;
    warehouse?: Warehouse;
    purchase_manager?: User;
    creator?: User;
    modifier?: User;
    items?: PurchaseItem[];
  }
  
  export interface PurchaseItem {
    id: number;
    purchase_id: number;
    product_id: number;
    line_number?: number;
    quantity: number;
    unit_price_base: number;
    discount_percent?: number;
    vat_rate?: number;
    vat_amount?: number;
    line_total: number;
    description?: string;
    warehouse_id?: number;
    employee_id?: number;
    created_at: string;
    updated_at: string;
  
    // Relations
    product?: Product;
    warehouse?: Warehouse;
    employee?: User;
  }
  
  export interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    code?: string;
  }
  
  export interface Warehouse {
    id: number;
    name: string;
    code: string;
    address?: string;
  }
  
  export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }
  
  export interface Product {
    id: number;
    code: string;
    name: string;
    unit: string;
    price: number;
    cost_price?: number;
    currency: Currency;
    vat_rate?: number;
    category?: string;
    is_active: boolean;
  }
  
  export interface PurchasesStats {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalSpent: number;
    averageOrderValue: number;
    topSuppliers: number;
  }
  
  export interface PurchasesFilter {
    search?: string;
    status?: PaymentStatus;
    supplier_id?: number;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  export interface PurchaseFormData {
    document_number: string;
    document_date: string;
    operation_type: PurchaseOperationType;
    supplier_id: number;
    warehouse_id?: number;
    purchase_manager_id?: number;
    currency: Currency;
    payment_status: PaymentStatus;
    delivery_status: DeliveryStatus;
    document_status: DocumentStatus;
    items: PurchaseItemFormData[];
  }
  
  export interface PurchaseItemFormData {
    product_id: number;
    quantity: number;
    unit_price_base: number;
    discount_percent?: number;
    vat_rate?: number;
    description?: string;
    warehouse_id?: number;
    employee_id?: number;
  }
  
  // Enums
  export type PurchaseOperationType = 'PURCHASE' | 'RETURN' | 'ADJUSTMENT';
  
  export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  
  export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  
  export type DocumentStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  
  export type Currency = 'EUR' | 'USD' | 'AED' | 'RUB' | 'UAH';
  
  // API Response Types
  export interface PurchasesResponse {
    success: boolean;
    purchases: Purchase[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    companyId: number;
  }
  
  export interface PurchasesStatsResponse {
    success: boolean;
    stats: PurchasesStats;
    companyId: number;
  }
  
  export interface PurchaseResponse {
    success: boolean;
    purchase: Purchase;
    companyId: number;
  }
  
  export interface CreatePurchaseResponse {
    success: boolean;
    purchase: Purchase;
    message: string;
    companyId: number;
  }