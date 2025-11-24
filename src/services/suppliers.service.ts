import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierDto {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SupplierListResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class SuppliersService {
  private baseUrl = '/suppliers';

  // Lấy danh sách nhà cung cấp
  async getSuppliers(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<SupplierListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<SupplierListResponse>(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy nhà cung cấp đang hoạt động (cho dropdown)
  async getActiveSuppliers(): Promise<Supplier[]> {
    return await apiClient.get<Supplier[]>(`${this.baseUrl}/active`);
  }

  // Lấy chi tiết nhà cung cấp
  async getSupplierById(id: number): Promise<Supplier> {
    return await apiClient.get<Supplier>(`${this.baseUrl}/${id}`);
  }

  // Tạo nhà cung cấp mới
  async createSupplier(dto: CreateSupplierDto): Promise<Supplier> {
    return await apiClient.post<Supplier>(this.baseUrl, dto);
  }

  // Cập nhật nhà cung cấp
  async updateSupplier(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    return await apiClient.put<Supplier>(`${this.baseUrl}/${id}`, dto);
  }

  // Xóa nhà cung cấp (soft delete)
  async deleteSupplier(id: number): Promise<void> {
    return await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const suppliersService = new SuppliersService();

