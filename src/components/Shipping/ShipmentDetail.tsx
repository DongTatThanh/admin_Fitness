import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/Shipping.css';
import { shipmentsService } from '../../services';
import type { Shipment, ShipmentStatus, UpdateShipmentStatusDto } from '../../services/shipments.service';

export default function ShipmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const shipmentId = id ? parseInt(id) : 0;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Update status form
  const [statusForm, setStatusForm] = useState({
    status: '' as ShipmentStatus | '',
    location: '',
    description: '',
  });
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    if (shipmentId) {
      loadShipment();
    }
  }, [shipmentId]);

  const loadShipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shipmentsService.getShipmentById(shipmentId);
      setShipment(data);
    } catch (err: any) {
      setError('Không thể tải chi tiết đơn vận chuyển: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status: ShipmentStatus) => {
    const statusMap: Record<ShipmentStatus, { label: string; className: string }> = {
      pending: { label: 'Chờ lấy hàng', className: 'status-pending' },
      picked_up: { label: 'Đã lấy hàng', className: 'status-picked' },
      in_transit: { label: 'Đang vận chuyển', className: 'status-transit' },
      out_for_delivery: { label: 'Đang giao hàng', className: 'status-delivery' },
      delivered: { label: 'Đã giao hàng', className: 'status-delivered' },
      failed: { label: 'Giao hàng thất bại', className: 'status-failed' },
      returned: { label: 'Trả hàng', className: 'status-returned' },
    };
    const { label, className } = statusMap[status];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const handleUpdateStatus = async () => {
    if (!statusForm.status) {
      alert('Vui lòng chọn trạng thái');
      return;
    }

    try {
      setUpdating(true);
      const dto: UpdateShipmentStatusDto = {
        status: statusForm.status,
        location: statusForm.location || undefined,
        description: statusForm.description || undefined,
      };

      await shipmentsService.updateShipmentStatus(shipmentId, dto);
      alert('Cập nhật trạng thái thành công!');
      setShowStatusModal(false);
      setStatusForm({ status: '', location: '', description: '' });
      loadShipment();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error || !shipment) {
    return (
      <div className="error-container">
        <p>{error || 'Không tìm thấy đơn vận chuyển'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/shipping/shipments')}>
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <div>
          <h2>Chi tiết Đơn vận chuyển</h2>
          <p className="text-muted">Mã vận đơn: {shipment.tracking_number}</p>
        </div>
        <div className="header-actions">
          {getStatusBadge(shipment.status)}
          <button className="btn btn-secondary" onClick={() => navigate('/shipping/shipments')}>
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="shipment-detail-content">
        <div className="detail-section">
          <h3>Thông tin đơn vận chuyển</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Mã vận đơn:</span>
              <span className="detail-value">
                <code className="code-badge">{shipment.tracking_number}</code>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trạng thái:</span>
              <span className="detail-value">{getStatusBadge(shipment.status)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Đơn vị vận chuyển:</span>
              <span className="detail-value">
                {shipment.carrier?.name || `ID: ${shipment.carrier_id}`}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Trọng lượng:</span>
              <span className="detail-value">{shipment.weight ? `${shipment.weight} kg` : '-'}</span>
            </div>
            {shipment.dimensions && (
              <div className="detail-item">
                <span className="detail-label">Kích thước:</span>
                <span className="detail-value">
                  {shipment.dimensions.length} × {shipment.dimensions.width} ×{' '}
                  {shipment.dimensions.height} cm
                </span>
              </div>
            )}
            {shipment.notes && (
              <div className="detail-item full-width">
                <span className="detail-label">Ghi chú:</span>
                <span className="detail-value">{shipment.notes}</span>
              </div>
            )}
          </div>
        </div>

        {shipment.order && (
          <div className="detail-section">
            <h3>Thông tin đơn hàng</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">#{shipment.order.order_number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Khách hàng:</span>
                <span className="detail-value">{shipment.order.customer_name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">SĐT:</span>
                <span className="detail-value">{shipment.order.customer_phone}</span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">Địa chỉ giao hàng:</span>
                <span className="detail-value">{shipment.order.shipping_address}</span>
              </div>
            </div>
          </div>
        )}

        {shipment.tracking_history && shipment.tracking_history.length > 0 && (
          <div className="detail-section">
            <h3>Lịch sử vận chuyển</h3>
            <div className="tracking-timeline">
              {shipment.tracking_history.map((history) => (
                <div key={history.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-status">{getStatusBadge(history.status)}</span>
                      <span className="timeline-date">{formatDate(history.timestamp)}</span>
                    </div>
                    {history.location && (
                      <div className="timeline-location">📍 {history.location}</div>
                    )}
                    {history.description && (
                      <div className="timeline-description">{history.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setStatusForm({
                status: shipment.status,
                location: '',
                description: '',
              });
              setShowStatusModal(true);
            }}
          >
            Cập nhật trạng thái
          </button>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật Trạng thái</h3>
              <button className="modal-close" onClick={() => setShowStatusModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Trạng thái <span className="required">*</span>
                </label>
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value as ShipmentStatus })
                  }
                  required
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="pending">Chờ lấy hàng</option>
                  <option value="picked_up">Đã lấy hàng</option>
                  <option value="in_transit">Đang vận chuyển</option>
                  <option value="out_for_delivery">Đang giao hàng</option>
                  <option value="delivered">Đã giao hàng</option>
                  <option value="failed">Giao hàng thất bại</option>
                  <option value="returned">Trả hàng</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vị trí</label>
                <input
                  type="text"
                  value={statusForm.location}
                  onChange={(e) => setStatusForm({ ...statusForm, location: e.target.value })}
                  placeholder="VD: Trung tâm phân phối Hà Nội"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={statusForm.description}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Mô tả chi tiết về trạng thái"
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStatusModal(false)}
                >
                  Hủy
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




