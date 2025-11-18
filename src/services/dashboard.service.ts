// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3201';

// Dashboard Statistics Types
export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_growth?: number;
  orders_growth?: number;
  customers_growth?: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface RevenueByCategory {
  category_name: string;
  total_revenue: number;
  total_orders: number;
}

export interface CustomerStats {
  date: string;
  new_customers: number;
  total_customers: number;
}

// New detailed interfaces
export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
  average_order_value: number;
  unique_customers: number;
}

export interface ProductDetails {
  product_id: string;
  product_name: string;
  total_sold: number;
  total_orders: number;
  total_revenue: number;
  average_price: number;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    quantity_sold: number;
  }>;
}

export interface OrderDetailsByStatus {
  orders: Array<{
    order_id: string;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
    items: Array<{
      product_name: string;
      quantity: number;
      price: number;
    }>;
  }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CustomersByMonth {
  month: string;
  new_customers: number;
  active_customers: number;
  total_orders: number;
  total_revenue: number;
}

export interface CategoryDetails {
  category_id: string;
  category_name: string;
  total_revenue: number;
  total_orders: number;
  total_products: number;
  top_products: Array<{
    product_id: string;
    product_name: string;
    total_sold: number;
    total_revenue: number;
  }>;
  all_products: Array<{
    product_id: string;
    product_name: string;
    price: number;
    stock: number;
  }>;
}

// Dashboard API Service
class DashboardApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api`;
  }

  /**
   * Lấy thống kê tổng quan dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Lấy doanh thu theo tháng
   */
  async getRevenueByMonth(timeRange: '7days' | '30days' | '3months' | '12months' = '12months'): Promise<RevenueByMonth[]> {
    try {
      // Chuyển đổi timeRange sang số tháng cho API backend
      const monthsMap: Record<string, number> = {
        '7days': 1,
        '30days': 1,
        '3months': 3,
        '12months': 12
      };
      const months = monthsMap[timeRange];
      
      const response = await fetch(`${this.baseUrl}/dashboard/revenue-by-month?months=${months}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching revenue by month:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê đơn hàng theo trạng thái
   */
  async getOrdersByStatus(_timeRange: '7days' | '30days' | '3months' | '12months' = '30days'): Promise<OrdersByStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/orders-by-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  }

  /**
   * Lấy doanh thu theo danh mục
   */
  async getRevenueByCategory(_timeRange: '7days' | '30days' | '3months' | '12months' = '30days'): Promise<RevenueByCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/revenue-by-category`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching revenue by category:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê khách hàng mới
   */
  async getNewCustomers(timeRange: '7days' | '30days' | '3months' | '12months' = '30days'): Promise<CustomerStats[]> {
    try {
      // Chuyển đổi timeRange sang số ngày cho API backend
      const daysMap: Record<string, number> = {
        '7days': 7,
        '30days': 30,
        '3months': 90,
        '12months': 365
      };
      const days = daysMap[timeRange];
      
      const response = await fetch(`${this.baseUrl}/dashboard/new-customers?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching new customers:', error);
      throw error;
    }
  }

  /**
   * Lấy top sản phẩm bán chạy
   */
  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/top-products?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * Lấy doanh thu theo ngày
   */
  async getRevenueByDay(startDate: string, endDate: string): Promise<RevenueByDay[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/dashboard/revenue-by-day?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching revenue by day:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết sản phẩm
   */
  async getProductDetails(productId: string): Promise<ProductDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/product-details/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết đơn hàng theo trạng thái
   */
  async getOrderDetailsByStatus(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<OrderDetailsByStatus> {
    try {
      const response = await fetch(
        `${this.baseUrl}/dashboard/order-details-by-status/${status}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details by status:', error);
      throw error;
    }
  }

  /**
   * Lấy thống kê khách hàng theo tháng
   */
  async getCustomersByMonth(months: number = 12): Promise<CustomersByMonth[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/customers-by-month?months=${months}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching customers by month:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết danh mục
   */
  async getCategoryDetails(categoryId: string): Promise<CategoryDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/category-details/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category details:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardApi = new DashboardApiService();
