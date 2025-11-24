import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface ShippingZone {
  id: number;
  name: string;
  code: string;
  provinces: string[];
  districts: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShippingZoneDto {
  name: string;
  code: string;
  provinces: string[];
  districts?: string[];
}

export interface UpdateShippingZoneDto {
  name?: string;
  code?: string;
  provinces?: string[];
  districts?: string[];
  is_active?: boolean;
}

export interface ShippingZoneListResponse {
  data: ShippingZone[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class ShippingZonesService {
  private baseUrl = '/shipping/zones';

  // Lấy danh sách khu vực
  async getZones(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ShippingZoneListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<ShippingZoneListResponse>(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy chi tiết khu vực
  async getZoneById(id: number): Promise<ShippingZone> {
    return await apiClient.get<ShippingZone>(`${this.baseUrl}/${id}`);
  }

  // Tạo khu vực mới
  async createZone(dto: CreateShippingZoneDto): Promise<ShippingZone> {
    return await apiClient.post<ShippingZone>(this.baseUrl, dto);
  }

  // Cập nhật khu vực
  async updateZone(id: number, dto: UpdateShippingZoneDto): Promise<ShippingZone> {
    return await apiClient.put<ShippingZone>(`${this.baseUrl}/${id}`, dto);
  }

  // Xóa khu vực
  async deleteZone(id: number): Promise<void> {
    return await apiClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}

export const shippingZonesService = new ShippingZonesService();

