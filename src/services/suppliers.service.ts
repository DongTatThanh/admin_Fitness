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

export interface SuppliersListResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class SuppliersService {
  // Lấy danh sách nhà cung cấp với phân trang
  async getSuppliers(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<SuppliersListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('is_active', params.isActive.toString());

    const qs = queryParams.toString();
    const endpoint = qs ? `/suppliers?${qs}` : '/suppliers';
    const response = await apiClient.get<any>(endpoint);
    
    // Handle response format: { success: true, data: {...} } or direct response
    if (response.data) {
      return response.data;
    }
    return response;
  }

  // Lấy thông tin chi tiết một nhà cung cấp
  async getSupplierById(supplierId: number): Promise<Supplier> {
    const response = await apiClient.get<any>(`/suppliers/${supplierId}`);
    // Handle response format: { success: true, data: {...} } or direct response
    return response.data || response;
  }

  // Tạo nhà cung cấp mới
  async createSupplier(data: CreateSupplierDto): Promise<Supplier> {
    const response = await apiClient.post<any>('/suppliers', data);
    // Handle response format: { success: true, data: {...} } or direct response
    return response.data || response;
  }

  // Cập nhật thông tin nhà cung cấp
  async updateSupplier(supplierId: number, data: UpdateSupplierDto): Promise<Supplier> {
    const response = await apiClient.put<any>(`/suppliers/${supplierId}`, data);
    // Handle response format: { success: true, data: {...} } or direct response
    return response.data || response;
  }

  // Xóa nhà cung cấp
  async deleteSupplier(supplierId: number): Promise<void> {
    await apiClient.delete(`/suppliers/${supplierId}`);
  }

  // Lấy danh sách nhà cung cấp đang hoạt động (cho dropdown/filter)
  async getActiveSuppliers(): Promise<Supplier[]> {
    const response = await this.getSuppliers({
      isActive: true,
      limit: 1000, // Lấy tất cả nhà cung cấp đang hoạt động
    });
    return response.data || [];
  }
}

// Export singleton instance
export const suppliersService = new SuppliersService();
export default suppliersService;

