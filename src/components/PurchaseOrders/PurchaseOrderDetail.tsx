import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/PurchaseOrders.css';
import { purchaseOrdersService } from '../../services';
import type { PurchaseOrder, PurchaseOrderItem } from '../../services/purchase-orders.service';

export default function PurchaseOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id) : 0;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [receivingItem, setReceivingItem] = useState<number | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await purchaseOrdersService.getPurchaseOrderById(orderId);
      setOrder(orderData);
    } catch (err: any) {
      setError('Không thể tải chi tiết đơn hàng: ' + (err?.message || 'Unknown error'));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: 'Nháp', className: 'status-draft' },
      pending: { label: 'Chờ duyệt', className: 'status-pending' },
      approved: { label: 'Đã duyệt', className: 'status-approved' },
      received: { label: 'Đã nhận hàng', className: 'status-received' },
      cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    const { label, className } = statusMap[status] || { label: status, className: '' };
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const handleApprove = async () => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn nhập hàng này?')) return;

    try {
      await purchaseOrdersService.approvePurchaseOrder(orderId);
      alert('Duyệt đơn hàng thành công!');
      loadOrder();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn nhập hàng này?')) return;

    try {
      await purchaseOrdersService.cancelPurchaseOrder(orderId);
      alert('Hủy đơn hàng thành công!');
      loadOrder();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleReceiveItem = async (itemId: number) => {
    const quantity = parseInt(receiveQuantity);
    if (!quantity || quantity <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    const item = order?.items.find((i) => i.id === itemId);
    if (!item) return;

    const remaining = item.quantity_ordered - item.quantity_received;
    if (quantity > remaining) {
      alert(`Số lượng nhận không được vượt quá số lượng còn lại (${remaining})`);
      return;
    }

    try {
      await purchaseOrdersService.receiveItem(orderId, itemId, {
        quantity_received: quantity,
      });
      alert('Nhận hàng thành công!');
      setReceivingItem(null);
      setReceiveQuantity('');
      loadOrder();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleReceiveAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn nhận toàn bộ hàng còn lại?')) return;

    try {
      await purchaseOrdersService.receiveAllItems(orderId);
      alert('Nhận hàng thành công!');
      loadOrder();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error || !order) {
    return (
      <div className="error-container">
        <p>{error || 'Không tìm thấy đơn hàng'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/purchase-orders')}>
          Quay lại
        </button>
      </div>
    );
  }

  const canEdit = ['draft', 'pending'].includes(order.status);
  const canApprove = order.status === 'pending';
  const canReceive = order.status === 'approved';
  const hasRemainingItems = order.items.some(
    (item) => item.quantity_ordered > item.quantity_received
  );

  return (
    <div className="purchase-order-detail-container">
      <div className="detail-header">
        <div>
          <h2>Chi tiết Đơn nhập hàng #{order.id}</h2>
          <p className="text-muted">Ngày tạo: {formatDate(order.created_at)}</p>
        </div>
        <div className="header-actions">
          {getStatusBadge(order.status)}
          <button className="btn btn-secondary" onClick={() => navigate('/purchase-orders')}>
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Thông tin đơn hàng</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Nhà cung cấp:</span>
              <span className="detail-value">{order.supplier?.name || `ID: ${order.supplier_id}`}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trạng thái:</span>
              <span className="detail-value">{getStatusBadge(order.status)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tổng tiền:</span>
              <span className="detail-value font-bold text-primary">
                {formatCurrency(order.total_amount || 0)}
              </span>
            </div>
            {order.expected_delivery_date && (
              <div className="detail-item">
                <span className="detail-label">Ngày dự kiến giao:</span>
                <span className="detail-value">
                  {formatDate(order.expected_delivery_date)}
                </span>
              </div>
            )}
            {order.notes && (
              <div className="detail-item full-width">
                <span className="detail-label">Ghi chú:</span>
                <span className="detail-value">{order.notes}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <div className="section-header">
            <h3>Danh sách sản phẩm ({order.items?.length || 0})</h3>
            {canReceive && hasRemainingItems && (
              <button className="btn btn-success" onClick={handleReceiveAll}>
                Nhận toàn bộ hàng
              </button>
            )}
          </div>

          <div className="items-table-wrapper">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Variant</th>
                  <th>Số lượng đặt</th>
                  <th>Số lượng đã nhận</th>
                  <th>Số lượng còn lại</th>
                  <th>Đơn giá</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => {
                  const remaining = item.quantity_ordered - item.quantity_received;
                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <strong>{item.product?.name || `Product ID: ${item.product_id}`}</strong>
                          <br />
                          <small className="text-muted">{item.product?.sku}</small>
                        </div>
                      </td>
                      <td>
                        {item.variant ? (
                          <div>
                            <strong>{item.variant.variant_name}</strong>
                            <br />
                            <small className="text-muted">{item.variant.sku}</small>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>{item.quantity_ordered}</td>
                      <td>
                        <span className={item.quantity_received > 0 ? 'text-success' : ''}>
                          {item.quantity_received}
                        </span>
                      </td>
                      <td>
                        <span className={remaining > 0 ? 'text-warning' : 'text-success'}>
                          {remaining}
                        </span>
                      </td>
                      <td>{formatCurrency(item.unit_cost)}</td>
                      <td className="font-semibold">{formatCurrency(item.total_cost)}</td>
                      <td>
                        {canReceive && remaining > 0 && (
                          <div className="receive-item-form">
                            {receivingItem === item.id ? (
                              <div className="receive-inputs">
                                <input
                                  type="number"
                                  min="1"
                                  max={remaining}
                                  value={receiveQuantity}
                                  onChange={(e) => setReceiveQuantity(e.target.value)}
                                  placeholder="Số lượng"
                                  className="receive-input"
                                />
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleReceiveItem(item.id)}
                                >
                                  ✓
                                </button>
                                <button
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => {
                                    setReceivingItem(null);
                                    setReceiveQuantity('');
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => {
                                  setReceivingItem(item.id);
                                  setReceiveQuantity(remaining.toString());
                                }}
                              >
                                Nhận hàng
                              </button>
                            )}
                          </div>
                        )}
                        {remaining === 0 && (
                          <span className="text-success">✓ Đã nhận đủ</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="detail-actions">
          {canApprove && (
            <button className="btn btn-success" onClick={handleApprove}>
              Duyệt đơn hàng
            </button>
          )}
          {['draft', 'pending', 'approved'].includes(order.status) && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Hủy đơn hàng
            </button>
          )}
          {canEdit && (
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/purchase-orders/${order.id}/edit`)}
            >
              Sửa đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

