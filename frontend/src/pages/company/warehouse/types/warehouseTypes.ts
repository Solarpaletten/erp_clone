// f/src/pages/company/warehouse/types/warehouseTypes.ts

export interface Warehouse {
    id: number;
    company_id: number;
    name: string;
    code?: string;
    description?: string;
    address?: string;
    manager_id?: number;
    status: WarehouseStatus;
    is_main: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
  
    // Relations
    manager?: User;
    creator?: User;
    sales?: Sale[];
    purchases?: Purchase[];
    _count?: {
      sales: number;
      purchases: number;
    };
  }
  
  export interface WarehouseInventoryItem {
    id: number;
    code: string;
    name: string;
    unit: string;
    current_stock: number;
    min_stock?: number;
    price: number;
    cost_price?: number;
    currency: Currency;
    category?: string;
    updated_at: string;
    
    // Calculated fields
    stock_status?: 'OK' | 'LOW' | 'OUT';
    stock_value?: number;
  }
  
  export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }
  
  export interface Sale {
    id: number;
    document_number: string;
    total_amount: number;
    created_at: string;
  }
  
  export interface Purchase {
    id: number;
    document_number: string;
    total_amount: number;
    created_at: string;
  }
  
  export interface WarehouseStats {
    total_warehouses: number;
    active_warehouses: number;
    total_products: number;
    low_stock_items: number;
    warehouse_utilization: number;
  }
  
  export interface WarehouseFilter {
    search?: string;
    status?: WarehouseStatus;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  export interface InventoryFilter {
    search?: string;
    low_stock_only?: boolean;
    page?: number;
    limit?: number;
  }
  
  export interface WarehouseFormData {
    name: string;
    code?: string;
    description?: string;
    address?: string;
    manager_id?: number;
    status: WarehouseStatus;
    is_main: boolean;
  }
  
  // Enums
  export type WarehouseStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  
  export type Currency = 'EUR' | 'USD' | 'AED' | 'RUB' | 'UAH';
  
  // API Response Types
  export interface WarehousesResponse {
    success: boolean;
    warehouses: Warehouse[];
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
  
  export interface WarehouseStatsResponse {
    success: boolean;
    stats: WarehouseStats;
    companyId: number;
  }
  
  export interface WarehouseResponse {
    success: boolean;
    warehouse: Warehouse;
    companyId: number;
  }
  
  export interface WarehouseInventoryResponse {
    success: boolean;
    warehouse: Warehouse;
    products: WarehouseInventoryItem[];
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
  
  export interface CreateWarehouseResponse {
    success: boolean;
    warehouse: Warehouse;
    message: string;
    companyId: number;
  }