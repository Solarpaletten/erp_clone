// f/src/pages/company/sales/types/salesTypes.ts

export interface Sale {
    id: number;
    company_id: number;
    document_number: string;
    document_date: string;
    document_type: SalesDocumentType;
    delivery_date?: string;
    due_date?: string;
    client_id: number;
    warehouse_id?: number;
    sales_manager_id?: number;
    subtotal: number;
    vat_amount: number;
    discount_amount: number;
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
    client?: Client;
    warehouse?: Warehouse;
    sales_manager?: User;
    creator?: User;
    modifier?: User;
    items?: SaleItem[];
  }
  
  export interface SaleItem {
    id: number;
    sale_id: number;
    product_id: number;
    line_number?: number;
    quantity: number;
    unit_price_base: number;
    discount_percent?: number;
    total_discount?: number;
    vat_rate?: number;
    vat_amount?: number;
    line_total: number;
    description?: string;
    created_at: string;
    updated_at: string;
  
    // Relations
    product?: Product;
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
  
  export interface SalesStats {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
    delivered: number;
    pending_delivery: number;
    totalRevenue: number;
    averageOrderValue: number;
    topClients: number;
    monthlyRevenue: MonthlyRevenue[];
  }
  
  export interface MonthlyRevenue {
    month: string;
    count: number;
    revenue: number;
  }
  
  export interface SalesFilter {
    search?: string;
    payment_status?: PaymentStatus;
    delivery_status?: DeliveryStatus;
    client_id?: number;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  export interface SaleFormData {
    document_number: string;
    document_date: string;
    document_type: SalesDocumentType;
    delivery_date?: string;
    due_date?: string;
    client_id: number;
    warehouse_id?: number;
    sales_manager_id?: number;
    currency: Currency;
    payment_status: PaymentStatus;
    delivery_status: DeliveryStatus;
    document_status: DocumentStatus;
    items: SaleItemFormData[];
  }
  
  export interface SaleItemFormData {
    product_id: number;
    quantity: number;
    unit_price_base: number;
    discount_percent?: number;
    total_discount?: number;
    vat_rate?: number;
    description?: string;
  }
  
  // Enums
  export type SalesDocumentType = 'INVOICE' | 'QUOTE' | 'ORDER' | 'RECEIPT';
  
  export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  
  export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  
  export type DocumentStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  
  export type Currency = 'EUR' | 'USD' | 'AED' | 'RUB' | 'UAH';
  
  // API Response Types
  export interface SalesResponse {
    success: boolean;
    sales: Sale[];
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
  
  export interface SalesStatsResponse {
    success: boolean;
    stats: SalesStats;
    companyId: number;
  }
  
  export interface SaleResponse {
    success: boolean;
    sale: Sale;
    companyId: number;
  }
  
  export interface CreateSaleResponse {
    success: boolean;
    sale: Sale;
    message: string;
    companyId: number;
  }