import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export interface TrackingHistory {
  id: number;
  shipment_id: number;
  status: ShipmentStatus;
  location?: string;
  description?: string;
  timestamp: string;
}

export interface Shipment {
  id: number;
  order_id: number;
  carrier_id: number;
  tracking_number: string;
  status: ShipmentStatus;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  notes?: string;
  picked_up_at?: string;
  in_transit_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  failed_at?: string;
  returned_at?: string;
  created_at: string;
  updated_at: string;
  carrier?: {
    id: number;
    name: string;
    code: string;
  };
  order?: {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
  };
  tracking_history?: TrackingHistory[];
}

export interface CreateShipmentDto {
  order_id: number;
  carrier_id: number;
  tracking_number?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  notes?: string;
}

export interface UpdateShipmentStatusDto {
  status: ShipmentStatus;
  location?: string;
  description?: string;
}

export interface ShipmentListResponse {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CalculateShippingDto {
  address: string;
  city: string;
  district: string;
  weight: number;
  carrier_id?: number;
}

export interface CalculateShippingResponse {
  zone?: {
    id: number;
    name: string;
    code: string;
  };
  weight: number;
  carrier?: {
    id: number;
    name: string;
    code: string;
  };
  rate?: {
    id: number;
    name: string;
    base_fee: number;
    fee_per_kg: number;
  };
  shipping_fee?: number;
  estimated_days?: number;
  options?: Array<{
    carrier: {
      id: number;
      name: string;
      code: string;
    };
    shipping_fee: number;
    estimated_days: number;
  }>;
}

// ============== SERVICE ==============
class ShipmentsService {
  private baseUrl = '/shipping';

  // Lấy danh sách đơn vận chuyển
  async getShipments(params?: {
    page?: number;
    limit?: number;
    status?: ShipmentStatus;
    carrierId?: number;
    orderId?: number;
  }): Promise<ShipmentListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.carrierId) queryParams.append('carrierId', params.carrierId.toString());
    if (params?.orderId) queryParams.append('orderId', params.orderId.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<ShipmentListResponse>(
      `${this.baseUrl}/shipments${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy chi tiết đơn vận chuyển
  async getShipmentById(id: number): Promise<Shipment> {
    return await apiClient.get<Shipment>(`${this.baseUrl}/shipments/${id}`);
  }

  // Tạo đơn vận chuyển
  async createShipment(dto: CreateShipmentDto): Promise<Shipment> {
    return await apiClient.post<Shipment>(`${this.baseUrl}/shipments`, dto);
  }

  // Cập nhật trạng thái đơn vận chuyển
  async updateShipmentStatus(
    id: number,
    dto: UpdateShipmentStatusDto
  ): Promise<Shipment> {
    return await apiClient.put<Shipment>(`${this.baseUrl}/shipments/${id}/status`, dto);
  }

  // Lấy lịch sử tracking
  async getTrackingHistory(id: number): Promise<TrackingHistory[]> {
    return await apiClient.get<TrackingHistory[]>(`${this.baseUrl}/shipments/${id}/tracking`);
  }

  // Tra cứu đơn hàng (public - không cần auth)
  async trackShipment(trackingNumber: string): Promise<Shipment> {
    return await apiClient.get<Shipment>(`${this.baseUrl}/track/${trackingNumber}`);
  }

  // Tính phí vận chuyển (public - không cần auth)
  async calculateShipping(dto: CalculateShippingDto): Promise<CalculateShippingResponse> {
    return await apiClient.post<CalculateShippingResponse>(`${this.baseUrl}/calculate`, dto);
  }
}

export const shipmentsService = new ShipmentsService();




