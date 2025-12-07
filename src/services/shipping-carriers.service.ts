import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface ShippingCarrier {
  id: number;
  name: string;
  code: string;
  contact_phone?: string;
  contact_email?: string;
  api_endpoint?: string;
  api_key?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingCarrierDto {
  name: string;
  code: string;
  contact_phone?: string;
  contact_email?: string;
  api_endpoint?: string;
  api_key?: string;
  notes?: string;
}

export interface UpdateShippingCarrierDto {
  name?: string;
  code?: string;
  contact_phone?: string;
  contact_email?: string;
  api_endpoint?: string;
  api_key?: string;
  notes?: string;
  is_active?: boolean;
}

export interface ShippingCarrierListResponse {
  data: ShippingCarrier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class ShippingCarriersService {
  private baseUrl = '/shipping/carriers';

  // Lấy danh sách đơn vị vận chuyển
  async getCarriers(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ShippingCarrierListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<ShippingCarrierListResponse>(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy đơn vị vận chuyển đang hoạt động
  async getActiveCarriers(): Promise<ShippingCarrier[]> {
    return await apiClient.get<ShippingCarrier[]>(`${this.baseUrl}/active`);
  }

  // Lấy chi tiết đơn vị vận chuyển
  async getCarrierById(id: number): Promise<ShippingCarrier> {
    return await apiClient.get<ShippingCarrier>(`${this.baseUrl}/${id}`);
  }

  // Tạo đơn vị vận chuyển mới
  async createCarrier(dto: CreateShippingCarrierDto): Promise<ShippingCarrier> {
    return await apiClient.post<ShippingCarrier>(this.baseUrl, dto);
  }

  // Cập nhật đơn vị vận chuyển
  async updateCarrier(id: number, dto: UpdateShippingCarrierDto): Promise<ShippingCarrier> {
    return await apiClient.put<ShippingCarrier>(`${this.baseUrl}/${id}`, dto);
  }

  // Xóa đơn vị vận chuyển
  async deleteCarrier(id: number): Promise<void> {
    return await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const shippingCarriersService = new ShippingCarriersService();




