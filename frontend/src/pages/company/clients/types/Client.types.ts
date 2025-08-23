// f/src/pages/company/clients/types/Client.types.ts
interface Client {
    id: number;
    company_id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    tax_number?: string;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
  }