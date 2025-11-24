import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export type PurchaseOrderStatus = 'draft' | 'pending' | 'approved' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id: number;
  product_id: number;
  variant_id?: number | null;
  quantity_ordered: number;
  quantity_received: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    featured_image?: string;
  };
  variant?: {
    id: number;
    variant_name: string;
    sku: string;
  };
}

export interface PurchaseOrder {
  id: number;
  supplier_id: number;
  supplier?: {
    id: number;
    name: string;
    contact_person?: string;
    phone?: string;
  };
  status: PurchaseOrderStatus;
  notes?: string;
  expected_delivery_date?: string;
  total_amount: number;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
  created_by?: number;
}

export interface CreatePurchaseOrderDto {
  supplier_id: number;
  notes?: string;
  expected_delivery_date?: string;
  items: {
    product_id: number;
    variant_id?: number | null;
    quantity_ordered: number;
    unit_cost: number;
    notes?: string;
  }[];
}

export interface UpdatePurchaseOrderDto {
  supplier_id?: number;
  status?: PurchaseOrderStatus;
  notes?: string;
  expected_delivery_date?: string;
}

export interface AddItemToPurchaseOrderDto {
  product_id: number;
  variant_id?: number | null;
  quantity_ordered: number;
  unit_cost: number;
  notes?: string;
}

export interface ReceiveItemDto {
  quantity_received: number;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class PurchaseOrdersService {
  private baseUrl = '/purchase-orders';

  // Lấy danh sách đơn nhập hàng
  async getPurchaseOrders(params?: {
    page?: number;
    limit?: number;
    status?: PurchaseOrderStatus;
    supplierId?: number;
  }): Promise<PurchaseOrderListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.supplierId) queryParams.append('supplierId', params.supplierId.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<PurchaseOrderListResponse>(
      `${this.baseUrl}${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy chi tiết đơn nhập hàng
  async getPurchaseOrderById(id: number): Promise<PurchaseOrder> {
    return await apiClient.get<PurchaseOrder>(`${this.baseUrl}/${id}`);
  }

  // Tạo đơn nhập hàng mới
  async createPurchaseOrder(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(this.baseUrl, dto);
  }

  // Cập nhật đơn nhập hàng
  async updatePurchaseOrder(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    return await apiClient.put<PurchaseOrder>(`${this.baseUrl}/${id}`, dto);
  }

  // Duyệt đơn nhập hàng
  async approvePurchaseOrder(id: number): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(`${this.baseUrl}/${id}/approve`);
  }

  // Nhận hàng (từng item)
  async receiveItem(
    orderId: number,
    itemId: number,
    dto: ReceiveItemDto
  ): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(
      `${this.baseUrl}/${orderId}/items/${itemId}/receive`,
      dto
    );
  }

  // Nhận toàn bộ hàng
  async receiveAllItems(orderId: number): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(`${this.baseUrl}/${orderId}/receive-all`);
  }

  // Hủy đơn nhập hàng
  async cancelPurchaseOrder(id: number): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(`${this.baseUrl}/${id}/cancel`);
  }

  // Thêm item vào đơn nhập hàng
  async addItemToOrder(
    orderId: number,
    dto: AddItemToPurchaseOrderDto
  ): Promise<PurchaseOrder> {
    return await apiClient.post<PurchaseOrder>(`${this.baseUrl}/${orderId}/items`, dto);
  }

  // Xóa item khỏi đơn nhập hàng
  async removeItemFromOrder(orderId: number, itemId: number): Promise<PurchaseOrder> {
    return await apiClient.delete<PurchaseOrder>(`${this.baseUrl}/${orderId}/items/${itemId}`);
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();

