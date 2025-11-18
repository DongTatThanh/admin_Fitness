    import { useState, useEffect } from 'react';
import { dashboardApi } from '../../services';
import '../../styles/Statistics.css';

interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

interface RevenueByCategory {
  category_name: string;
  total_revenue: number;
  total_orders: number;
}

interface CustomerStats {
  date: string;
  new_customers: number;
  total_customers: number;
}

export default function Statistics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '3months' | '12months'>('30days');

  // Stats data
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonth[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[]>([]);
  const [customerStats, setCustomerStats] = useState<CustomerStats[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueData, ordersData, categoryData, customerData, dashStats] = await Promise.all([
        dashboardApi.getRevenueByMonth(timeRange).catch(() => []),
        dashboardApi.getOrdersByStatus(timeRange).catch(() => []),
        dashboardApi.getRevenueByCategory(timeRange).catch(() => []),
        dashboardApi.getNewCustomers(timeRange).catch(() => []),
        dashboardApi.getDashboardStats().catch(() => null),
      ]);

      setRevenueByMonth(revenueData);
      setOrdersByStatus(ordersData);
      setRevenueByCategory(categoryData);
      setCustomerStats(customerData);
      setOrderStats(dashStats);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getMaxRevenue = () => {
    if (revenueByMonth.length === 0) return 0;
    return Math.max(...revenueByMonth.map(r => r.revenue));
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#fbbf24',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="statistics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadStatistics} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const maxRevenue = getMaxRevenue();

  return (
    <div className="statistics">
      <div className="statistics-header">
        <div className="header-content">
          <h2>Thống kê & Báo cáo</h2>
          <p className="subtitle">Phân tích chi tiết doanh thu và đơn hàng</p>
        </div>
        <div className="time-range-selector">
          <button
            className={timeRange === '7days' ? 'active' : ''}
            onClick={() => setTimeRange('7days')}
          >
            7 ngày
          </button>
          <button
            className={timeRange === '30days' ? 'active' : ''}
            onClick={() => setTimeRange('30days')}
          >
            30 ngày
          </button>
          <button
            className={timeRange === '3months' ? 'active' : ''}
            onClick={() => setTimeRange('3months')}
          >
            3 tháng
          </button>
          <button
            className={timeRange === '12months' ? 'active' : ''}
            onClick={() => setTimeRange('12months')}
          >
            12 tháng
          </button>
        </div>
      </div>

      {/* Order Stats Summary */}
      {orderStats && (
        <div className="stats-summary">
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#3b82f620' }}>
            </div>
            <div className="summary-content">
              <h3>{orderStats.total_orders || 0}</h3>
              <p>Tổng đơn hàng</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#10b98120' }}>
            </div>
            <div className="summary-content">
              <h3>{orderStats.total_customers || 0}</h3>
              <p>Tổng khách hàng</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#8b5cf620' }}>
            </div>
            <div className="summary-content">
              <h3>{orderStats.pending_orders || 0}</h3>
              <p>Đơn chờ xử lý</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#10b98120' }}>
            </div>
            <div className="summary-content">
              <h3>{formatCurrency(orderStats.total_revenue || 0)}</h3>
              <p>Tổng doanh thu</p>
            </div>
          </div>
        </div>
      )}

      <div className="statistics-main-grid">
        {/* Revenue by Month Chart */}
        <div className="stat-card revenue-chart-card">
          <div className="card-header">
            <h3>Doanh thu theo thời gian</h3>
          </div>
          <div className="chart-container">
            {revenueByMonth.length > 0 ? (
              <div className="bar-chart">
                {revenueByMonth.map((item, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{
                          height: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : '0%',
                        }}
                      >
                        <span className="bar-tooltip">
                          {formatCurrency(item.revenue)}
                          <br />
                          {item.orders} đơn
                        </span>
                      </div>
                    </div>
                    <div className="bar-label">{item.month}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-chart">
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="stat-card orders-status-card">
          <div className="card-header">
            <h3>Đơn hàng theo trạng thái</h3>
          </div>
          <div className="status-list">
            {ordersByStatus.length > 0 ? (
              ordersByStatus.map((item, index) => (
                <div key={index} className="status-item">
                  <div className="status-info">
                    <div
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></div>
                    <span className="status-name">{item.status}</span>
                  </div>
                  <div className="status-stats">
                    <span className="status-count">{item.count}</span>
                    <span className="status-percentage">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="status-bar">
                    <div
                      className="status-fill"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: getStatusColor(item.status),
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa có dữ liệu đơn hàng</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="stat-card category-revenue-card">
          <div className="card-header">
            <h3>Doanh thu theo danh mục</h3>
          </div>
          <div className="category-list">
            {revenueByCategory.length > 0 ? (
              revenueByCategory.slice(0, 5).map((item, index) => (
                <div key={index} className="category-item">
                  <div className="category-rank">{index + 1}</div>
                  <div className="category-info">
                    <h4>{item.category_name}</h4>
                    <p>{item.total_orders} đơn hàng</p>
                  </div>
                  <div className="category-revenue">
                    {formatCurrency(item.total_revenue)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa có dữ liệu danh mục</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Growth - Full Width Below */}
      <div className="customer-section">
        <div className="stat-card customer-growth-card">
          <div className="card-header">
            <h3>Khách hàng mới</h3>
          </div>
          <div className="customer-chart">
            {customerStats.length > 0 ? (
              <div className="line-chart">
                {customerStats.map((item, index) => (
                  <div key={index} className="line-item">
                    <div className="line-bar">
                      <div
                        className="line-fill"
                        style={{
                          height: `${(item.new_customers / Math.max(...customerStats.map(c => c.new_customers))) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="line-value">{item.new_customers}</div>
                    <div className="line-label">{item.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Chưa có dữ liệu khách hàng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
