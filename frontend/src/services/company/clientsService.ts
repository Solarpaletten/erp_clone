// src/services/clientsService.ts
import { api } from '../../api/axios';
const API_URL = '/api/company/clients';

export enum ClientRole {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: ClientRole;
  is_active?: boolean;
  code?: string;
  vat_code?: string;
  created_at?: string;
  updated_at?: string;
}

const clientsService = {
  getClientsList: async (): Promise<Client[]> => {
    try {
      const response = await api.get<Client[]>(`${API_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [
        {
          id: 1,
          name: 'ASSET LOGISTICS GMBH',
          email: 'info@assetlogistics.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 2,
          name: 'SWAPOIL GMBH',
          email: 'info@swapoil.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 3,
          name: 'ASSET BILANS SPOLKA Z O O',
          email: 'info@assetbilans.pl',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 4,
          name: 'RAPSOIL OU',
          email: 'info@rapsoil.ee',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
      ];
    }
  },

  getSuppliersList: async (): Promise<Client[]> => {
    try {
      const response = await api.get<Client[]>(`${API_URL}?role=SUPPLIER`);
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [
        {
          id: 1,
          name: 'ASSET LOGISTICS GMBH',
          email: 'info@assetlogistics.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 2,
          name: 'SWAPOIL GMBH',
          email: 'info@swapoil.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 3,
          name: 'ASSET BILANS SPOLKA Z O O',
          email: 'info@assetbilans.pl',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        {
          id: 4,
          name: 'RAPSOIL OU',
          email: 'info@rapsoil.ee',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
      ];
    }
  },

  getClientById: async (id: number): Promise<Client | null> => {
    try {
      const response = await api.get<Client>(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      const mockClients: Record<number, Client> = {
        1: {
          id: 1,
          name: 'ASSET LOGISTICS GMBH',
          email: 'info@assetlogistics.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        2: {
          id: 2,
          name: 'SWAPOIL GMBH',
          email: 'info@swapoil.com',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        3: {
          id: 3,
          name: 'ASSET BILANS SPOLKA Z O O',
          email: 'info@assetbilans.pl',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
        4: {
          id: 4,
          name: 'RAPSOIL OU',
          email: 'info@rapsoil.ee',
          role: ClientRole.SUPPLIER,
          is_active: true,
        },
      };
      return mockClients[id] || null;
    }
  },

  createClient: async (
    clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Client> => {
    try {
      const response = await api.post<Client>(API_URL, clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Failed to create client');
    }
  },

  updateClient: async (
    id: number,
    clientData: Partial<Client>
  ): Promise<Client> => {
    try {
      const response = await api.put<Client>(`${API_URL}/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
      throw new Error('Failed to update client');
    }
  },

  getMyCompanies: async (): Promise<Client[]> => {
    try {
      const response = await api.get<Client[]>(`${API_URL}/companies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Failed to fetch companies');
    }
  },
};

export default clientsService;
