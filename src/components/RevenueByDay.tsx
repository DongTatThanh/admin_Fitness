import { useState, useEffect } from 'react';
import { dashboardApi } from '../services/dashboard.service';
import type { RevenueByDay as RevenueByDayType } from '../services/dashboard.service';
import '../styles/RevenueByDay.css';

export default function RevenueByDay() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueByDayType[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getRevenueByDay(startDate, endDate);
      setRevenueData(data);
    } catch (error) {
      // Error loading revenue by day
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount || isNaN(amount)) return '₫0';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  };

  const getTotalOrders = () => {
    return revenueData.reduce((sum, item) => sum + (item.orders || 0), 0);
  };

  const getAverageRevenue = () => {
    if (revenueData.length === 0) return 0;
    const total = getTotalRevenue();
    return total / revenueData.length;
  };

  const getTotalCustomers = () => {
    return revenueData.reduce((sum, item) => sum + (item.unique_customers || 0), 0);
  };

  if (loading) {
    return (
      <div className="revenue-by-day">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="revenue-by-day">
      <div className="page-header">
        <div className="header-content">
          <h2>Doanh thu theo ngày</h2>
          <p className="subtitle">Chi tiết doanh thu từng ngày</p>
        </div>
        <div className="date-filters">
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon" style={{ backgroundColor: '#667eea20' }}></div>
          <div className="card-info">
            <h3>{formatCurrency(getTotalRevenue())}</h3>
            <p>Tổng doanh thu</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon" style={{ backgroundColor: '#10b98120' }}></div>
          <div className="card-info">
            <h3>{getTotalOrders()}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon" style={{ backgroundColor: '#f59e0b20' }}></div>
          <div className="card-info">
            <h3>{formatCurrency(getAverageRevenue())}</h3>
            <p>Doanh thu TB/ngày</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon" style={{ backgroundColor: '#8b5cf620' }}></div>
          <div className="card-info">
            <h3>{getTotalCustomers()}</h3>
            <p>Khách hàng unique</p>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="revenue-table-card">
        <div className="table-header">
          <h3>Chi tiết từng ngày</h3>
        </div>
        <div className="table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh thu</th>
                <th>Số đơn</th>
                <th>Giá trị TB</th>
                <th>Khách hàng</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.length > 0 ? (
                revenueData.map((item, index) => (
                  <tr key={index}>
                    <td className="date-cell">{formatDate(item.date)}</td>
                    <td className="revenue-cell">{formatCurrency(item.revenue)}</td>
                    <td className="orders-cell">{item.orders || 0}</td>
                    <td className="avg-cell">{formatCurrency(item.average_order_value)}</td>
                    <td className="customers-cell">{item.unique_customers || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    Không có dữ liệu trong khoảng thời gian này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
