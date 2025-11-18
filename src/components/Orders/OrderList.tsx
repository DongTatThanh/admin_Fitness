import { useState, useEffect } from 'react';
import '../../styles/Orders.css';
import { ordersService, type Order, OrderStatus, PaymentStatus } from '../../services/orders.service';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [shippingInfo, setShippingInfo] = useState({
    tracking_number: '',
    shipping_carrier: '',
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getAllOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      // Don't show alert if API endpoint doesn't exist yet
      if (!error.message?.includes('404') && !error.message?.includes('Cannot GET')) {
        alert(error.message || 'Không thể tải danh sách đơn hàng');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (orderId: number) => {
    try {
      const order = await ordersService.getOrderById(orderId);
      setSelectedOrder(order);
      setShowDetailModal(true);
    } catch (error: any) {
      alert(error.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      await ordersService.updateOrderStatus(selectedOrder.id, newStatus);
      alert('Cập nhật trạng thái thành công!');
      setShowStatusModal(false);
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleUpdateShipping = async () => {
    if (!selectedOrder) return;

    try {
      await ordersService.updateShippingInfo(selectedOrder.id, shippingInfo);
      alert('Cập nhật thông tin vận chuyển thành công!');
      setShowShippingModal(false);
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật thông tin vận chuyển');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const reason = prompt('Lý do hủy đơn:');
    if (reason === null) return;

    try {
      await ordersService.cancelOrder(orderId, reason);
      alert('Đã hủy đơn hàng!');
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Không thể hủy đơn hàng');
    }
  };

  const formatCurrency = (amount: string | number | undefined) => {
    if (!amount && amount !== 0) return '₫0';
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '₫0';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { label: string; className: string }> = {
      [OrderStatus.PENDING]: { label: 'Chờ xác nhận', className: 'status-pending' },
      [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận', className: 'status-confirmed' },
      [OrderStatus.PROCESSING]: { label: 'Đang xử lý', className: 'status-processing' },
      [OrderStatus.SHIPPED]: { label: 'Đang giao', className: 'status-shipped' },
      [OrderStatus.DELIVERED]: { label: 'Đã giao', className: 'status-delivered' },
      [OrderStatus.CANCELLED]: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    const { label, className } = statusMap[status];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
      [PaymentStatus.PENDING]: { label: 'Chờ thanh toán', className: 'payment-pending' },
      [PaymentStatus.PAID]: { label: 'Đã thanh toán', className: 'payment-paid' },
      [PaymentStatus.FAILED]: { label: 'Thất bại', className: 'payment-failed' },
      [PaymentStatus.REFUNDED]: { label: 'Đã hoàn tiền', className: 'payment-refunded' },
    };
    const { label, className } = statusMap[status];
    return <span className={`payment-badge ${className}`}>{label}</span>;
  };

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.customer_phone.includes(term)
    );
  });

  return (
    <div className="order-list">
      <div className="page-header">
        <div>
          <h2>📦 Quản lý Đơn hàng</h2>
          <p>Tổng số: {filteredOrders.length} đơn hàng</p>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Tìm mã đơn, tên khách hàng, SĐT..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${statusFilter === OrderStatus.PENDING ? 'active' : ''}`}
            onClick={() => setStatusFilter(OrderStatus.PENDING)}
          >
            Chờ xác nhận
          </button>
          <button
            className={`filter-btn ${statusFilter === OrderStatus.CONFIRMED ? 'active' : ''}`}
            onClick={() => setStatusFilter(OrderStatus.CONFIRMED)}
          >
            Đã xác nhận
          </button>
          <button
            className={`filter-btn ${statusFilter === OrderStatus.PROCESSING ? 'active' : ''}`}
            onClick={() => setStatusFilter(OrderStatus.PROCESSING)}
          >
            Đang xử lý
          </button>
          <button
            className={`filter-btn ${statusFilter === OrderStatus.SHIPPED ? 'active' : ''}`}
            onClick={() => setStatusFilter(OrderStatus.SHIPPED)}
          >
            Đang giao
          </button>
          <button
            className={`filter-btn ${statusFilter === OrderStatus.DELIVERED ? 'active' : ''}`}
            onClick={() => setStatusFilter(OrderStatus.DELIVERED)}
          >
            Đã giao
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="content-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="order-number">{order.order_number}</strong>
                      </td>
                      <td>
                        <div className="customer-info">
                          <strong>{order.customer_name}</strong>
                          <div className="customer-contact">
                            <small>{order.customer_phone}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="item-count">
                          {order.items?.length || 0} sản phẩm
                        </span>
                      </td>
                      <td className="total-amount">
                        <strong>{formatCurrency(order.total)}</strong>
                      </td>
                      <td>{getPaymentStatusBadge(order.payment_status)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => handleViewDetail(order.id)}
                            title="Xem chi tiết"
                          >
                            👁️
                          </button>
                          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
                            <>
                              <button
                                className="btn-action btn-edit"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                  setShowStatusModal(true);
                                }}
                                title="Cập nhật trạng thái"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-action btn-shipping"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShippingInfo({
                                    tracking_number: order.tracking_number || '',
                                    shipping_carrier: order.shipping_carrier || '',
                                  });
                                  setShowShippingModal(true);
                                }}
                                title="Cập nhật vận chuyển"
                              >
                                🚚
                              </button>
                              <button
                                className="btn-action btn-cancel"
                                onClick={() => handleCancelOrder(order.id)}
                                title="Hủy đơn"
                              >
                                ❌
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng: {selectedOrder.order_number}</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin khách hàng</h4>
                <p><strong>Tên:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                <p><strong>SĐT:</strong> {selectedOrder.customer_phone}</p>
                <p><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}, {selectedOrder.shipping_ward}, {selectedOrder.shipping_district}, {selectedOrder.shipping_city}</p>
              </div>

              <div className="detail-section">
                <h4>Thông tin đơn hàng</h4>
                <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}</p>
                <p><strong>Thanh toán:</strong> {getPaymentStatusBadge(selectedOrder.payment_status)}</p>
                <p><strong>Phương thức:</strong> {selectedOrder.payment_method}</p>
                {selectedOrder.tracking_number && (
                  <p><strong>Mã vận đơn:</strong> {selectedOrder.tracking_number}</p>
                )}
                {selectedOrder.shipping_carrier && (
                  <p><strong>Đơn vị vận chuyển:</strong> {selectedOrder.shipping_carrier}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Sản phẩm</h4>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.product_name}
                          {item.variant_name && <small> ({item.variant_name})</small>}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.price)}</td>
                        <td>{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-section total-section">
                <p><strong>Tạm tính:</strong> <span>{formatCurrency(selectedOrder.subtotal)}</span></p>
                <p><strong>Phí vận chuyển:</strong> <span>{formatCurrency(selectedOrder.shipping_fee)}</span></p>
                {parseFloat(selectedOrder.discount_amount) > 0 && (
                  <p><strong>Giảm giá:</strong> <span className="discount">-{formatCurrency(selectedOrder.discount_amount)}</span></p>
                )}
                <p className="total"><strong>Tổng cộng:</strong> <span>{formatCurrency(selectedOrder.total)}</span></p>
              </div>

              {selectedOrder.notes && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content status-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật trạng thái: {selectedOrder.order_number}</h3>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Trạng thái hiện tại</label>
                <p>{getStatusBadge(selectedOrder.status)}</p>
              </div>

              <div className="form-group">
                <label>Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="form-control"
                >
                  <option value={OrderStatus.PENDING}>Chờ xác nhận</option>
                  <option value={OrderStatus.CONFIRMED}>Đã xác nhận</option>
                  <option value={OrderStatus.PROCESSING}>Đang xử lý</option>
                  <option value={OrderStatus.SHIPPED}>Đang giao</option>
                  <option value={OrderStatus.DELIVERED}>Đã giao</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowStatusModal(false)}>
                  Hủy
                </button>
                <button className="btn-primary" onClick={handleUpdateStatus}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Shipping Modal */}
      {showShippingModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowShippingModal(false)}>
          <div className="modal-content shipping-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật vận chuyển: {selectedOrder.order_number}</h3>
              <button className="close-btn" onClick={() => setShowShippingModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Mã vận đơn</label>
                <input
                  type="text"
                  value={shippingInfo.tracking_number}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, tracking_number: e.target.value })}
                  className="form-control"
                  placeholder="Nhập mã vận đơn"
                />
              </div>

              <div className="form-group">
                <label>Đơn vị vận chuyển</label>
                <input
                  type="text"
                  value={shippingInfo.shipping_carrier}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, shipping_carrier: e.target.value })}
                  className="form-control"
                  placeholder="VD: Giao hàng nhanh, Viettel Post..."
                />
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowShippingModal(false)}>
                  Hủy
                </button>
                <button className="btn-primary" onClick={handleUpdateShipping}>
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
