import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface ShippingRate {
  id: number;
  carrier_id: number;
  zone_id: number;
  name: string;
  min_weight: number;
  max_weight?: number | null;
  base_fee: number;
  fee_per_kg: number;
  estimated_days: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  carrier?: {
    id: number;
    name: string;
    code: string;
  };
  zone?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface CreateShippingRateDto {
  carrier_id: number;
  zone_id: number;
  name: string;
  min_weight: number;
  max_weight?: number | null;
  base_fee: number;
  fee_per_kg: number;
  estimated_days: number;
  priority: number;
}

export interface UpdateShippingRateDto {
  carrier_id?: number;
  zone_id?: number;
  name?: string;
  min_weight?: number;
  max_weight?: number | null;
  base_fee?: number;
  fee_per_kg?: number;
  estimated_days?: number;
  priority?: number;
  is_active?: boolean;
}

export interface ShippingRateListResponse {
  data: ShippingRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class ShippingRatesService {
  private baseUrl = '/shipping/rates';

  // Lấy danh sách bảng giá
  async getRates(params?: {
    page?: number;
    limit?: number;
    carrierId?: number;
    zoneId?: number;
  }): Promise<ShippingRateListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.carrierId) queryParams.append('carrierId', params.carrierId.toString());
    if (params?.zoneId) queryParams.append('zoneId', params.zoneId.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<ShippingRateListResponse>(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy chi tiết bảng giá
  async getRateById(id: number): Promise<ShippingRate> {
    return await apiClient.get<ShippingRate>(`${this.baseUrl}/${id}`);
  }

  // Tạo bảng giá mới
  async createRate(dto: CreateShippingRateDto): Promise<ShippingRate> {
    return await apiClient.post<ShippingRate>(this.baseUrl, dto);
  }

  // Cập nhật bảng giá
  async updateRate(id: number, dto: UpdateShippingRateDto): Promise<ShippingRate> {
    return await apiClient.put<ShippingRate>(`${this.baseUrl}/${id}`, dto);
  }

  // Xóa bảng giá
  async deleteRate(id: number): Promise<void> {
    return await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const shippingRatesService = new ShippingRatesService();

