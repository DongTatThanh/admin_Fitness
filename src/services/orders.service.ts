import { apiClient } from '../lib/api_client';


// Order Status Type
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Payment Status Type
export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

// Order Item Interface
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: string;
  subtotal: string;
  product?: {
    id: number;
    name: string;
    image: string;
  };
  variant?: {
    id: number;
    name: string;
    sku: string;
  };
}

// Order Interface
export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_ward?: string;
  status: OrderStatus;
  payment_method: string;
  payment_status: PaymentStatus;
  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total: string;
  notes?: string;
  tracking_number?: string;
  shipping_carrier?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  processing_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items: OrderItem[];
}

// Order Stats Interface
export interface OrderStats {
  totalOrders: number;
  byStatus: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  paidOrders: number;
  totalRevenue: number;
}

// Update Order Status DTO
export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

// Update Shipping Info DTO
export interface UpdateShippingInfoDto {
  tracking_number?: string;
  shipping_carrier?: string;
  shipped_at?: string;
}

// Cancel Order DTO
export interface CancelOrderDto {
  reason?: string;
}

// Orders Service
class OrdersService {
  // Get all orders with filters
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    search?: string;
  }): Promise<{ data: Order[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.payment_status) queryParams.append('payment_status', params.payment_status);
      if (params?.search) queryParams.append('search', params.search);

      const endpoint = `/api/orders/admin/list/all${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await apiClient.get<any>(endpoint);
      
      // Backend returns { data: [], total: number, page, limit, pages }
      return {
        data: response.data || [],
        total: response.total || 0
      };
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(error.message || 'Không thể tải danh sách đơn hàng');
    }
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await apiClient.get<Order>(`/api/orders/admin/${orderId}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      throw new Error(error.message || 'Không thể tải đơn hàng');
    }
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    try {
      const response = await apiClient.patch<Order>(
        `/api/orders/admin/${orderId}/status`,
        { status }
      );
      return response;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(error.message || 'Không thể cập nhật trạng thái đơn hàng');
    }
  }

  // Update shipping info
  async updateShippingInfo(orderId: number, data: UpdateShippingInfoDto): Promise<Order> {
    try {
      const response = await apiClient.patch<Order>(
        `/api/orders/admin/${orderId}/shipping`,
        data
      );
      return response;
    } catch (error: any) {
      console.error('Error updating shipping info:', error);
      throw new Error(error.message || 'Không thể cập nhật thông tin vận chuyển');
    }
  }

  // Cancel order
  async cancelOrder(orderId: number, reason?: string): Promise<Order> {
    try {
      const response = await apiClient.post<Order>(
        `/api/orders/admin/${orderId}/cancel`,
        { reason }
      );
      return response;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw new Error(error.message || 'Không thể hủy đơn hàng');
    }
  }

  // Delete order
  async deleteOrder(orderId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/api/orders/admin/${orderId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error deleting order:', error);
      throw new Error(error.message || 'Không thể xóa đơn hàng');
    }
  }

  // Get order statistics
  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await apiClient.get<OrderStats>('/api/orders/admin/stats/summary');
      return response;
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
      throw new Error(error.message || 'Không thể tải thống kê đơn hàng');
    }
  }
}

export const ordersService = new OrdersService();
export default ordersService;
