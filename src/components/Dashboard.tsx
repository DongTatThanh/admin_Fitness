import { useState, useEffect } from 'react';
import { dashboardApi, ordersApi } from '../services';
import type { DashboardStats, TopProduct } from '../services/dashboard.service';
import type { Order } from '../services/orders.service';
import '../styles/Dashboard.css';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  growth?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, productsData, ordersData] = await Promise.all([
        dashboardApi.getDashboardStats(),
        dashboardApi.getTopProducts(5),
        ordersApi.getRecentOrders(5),
      ]);

      setStats(statsData);
      setTopProducts(productsData);
      setRecentOrders(ordersData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu từ backend API');
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

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'completed': 'completed',
      'delivered': 'completed',
      'processing': 'processing',
      'pending': 'processing',
      'cancelled': 'processing',
    };
    return statusMap[status] || 'processing';
  };

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      'completed': 'Hoàn thành',
      'delivered': 'Đã giao',
      'processing': 'Đang xử lý',
      'pending': 'Chờ xử lý',
      'cancelled': 'Đã hủy',
    };
    return statusText[status] || status;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <p className="error-message">❌ {error}</p>
          <button onClick={loadDashboardData} className="retry-btn">
            Thử lại
          </button>
         
  
        </div>
      </div>
    );
  }

  const statsCards: StatCard[] = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(stats?.total_revenue || 0),
      icon: '💰',
      color: '#10b981',
      growth: stats?.revenue_growth,
    },
    {
      label: 'Đơn hàng',
      value: stats?.total_orders?.toString() || '0',
      icon: '📦',
      color: '#3b82f6',
      growth: stats?.orders_growth,
    },
    {
      label: 'Khách hàng',
      value: stats?.total_customers?.toString() || '0',
      icon: '👥',
      color: '#f59e0b',
      growth: stats?.customers_growth,
    },
    {
      label: 'Sản phẩm',
      value: stats?.total_products?.toString() || '0',
      icon: '🏋️',
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="dashboard">
  
      
      <div className="dashboard-header">
        <h2>Dashboard Tổng Quan</h2>
        <div className="date-filter">
          <select>
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tháng này</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card" style={{ '--card-color': stat.color } as React.CSSProperties}>
            <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
              {stat.growth !== undefined && (
                <span className={`growth ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                  {formatGrowth(stat.growth)} so với tháng trước
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card recent-orders">
          <div className="card-header">
            <h3>Đơn hàng gần đây</h3>
            <button className="view-all-btn">Xem tất cả →</button>
          </div>
          <div className="table-container">
            {recentOrders.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Số lượng SP</th>
                    <th>Giá trị</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>#{String(order.id).slice(0, 8)}</strong></td>
                      <td>{order.customer_name}</td>
                      <td>{order.items?.length || 0} sản phẩm</td>
                      <td className="amount">{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span className={`status ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card top-products">
          <div className="card-header">
            <h3>Sản phẩm bán chạy</h3>
          </div>
          <div className="products-list">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.product_id} className="product-item">
                  <div className="product-rank">{index + 1}</div>
                  <div className="product-info">
                    <h4>{product.product_name}</h4>
                    <p>Đã bán: {product.total_sold} sản phẩm</p>
                  </div>
                  <div className="product-revenue">{formatCurrency(product.total_revenue)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
