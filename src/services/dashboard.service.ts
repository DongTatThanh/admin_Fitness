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
  async getRevenueByMonth(months: number = 12): Promise<RevenueByMonth[]> {
    try {
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
}

// Export singleton instance
export const dashboardApi = new DashboardApiService();
