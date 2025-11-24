import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Shipping.css';
import { shipmentsService, shippingCarriersService } from '../../services';
import type { Shipment, ShipmentStatus } from '../../services/shipments.service';
import type { ShippingCarrier } from '../../services/shipping-carriers.service';

export default function ShipmentList() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShipments, setTotalShipments] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | ''>('');
  const [carrierFilter, setCarrierFilter] = useState<number | ''>('');
  const [trackingSearch, setTrackingSearch] = useState('');

  // Load carriers for filter
  useEffect(() => {
    const loadCarriers = async () => {
      try {
        const response = await shippingCarriersService.getActiveCarriers();
        setCarriers(response);
      } catch (err) {
        console.error('Error loading carriers:', err);
      }
    };
    loadCarriers();
  }, []);

  // Load shipments
  const loadShipments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shipmentsService.getShipments({
        page: currentPage,
        limit: limit,
        status: statusFilter || undefined,
        carrierId: carrierFilter || undefined,
      });

      // Filter by tracking number if needed
      let filteredData = response.data;
      if (trackingSearch.trim()) {
        filteredData = filteredData.filter((s) =>
          s.tracking_number.toLowerCase().includes(trackingSearch.toLowerCase())
        );
      }

      setShipments(filteredData);
      setTotalPages(response.totalPages);
      setTotalShipments(response.total);
    } catch (err: any) {
      console.error('Error loading shipments:', err);
      setError('Không thể tải danh sách đơn vận chuyển: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, [currentPage, limit, statusFilter, carrierFilter]);

  // Handle tracking search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadShipments();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [trackingSearch]);

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

  const handleViewDetail = (shipmentId: number) => {
    navigate(`/shipping/shipments/${shipmentId}`);
  };

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h2>Quản lý Đơn vận chuyển</h2>
      </div>

      {/* Filters */}
      <div className="shipping-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã vận đơn..."
            value={trackingSearch}
            onChange={(e) => setTrackingSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ShipmentStatus | '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ lấy hàng</option>
            <option value="picked_up">Đã lấy hàng</option>
            <option value="in_transit">Đang vận chuyển</option>
            <option value="out_for_delivery">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="failed">Giao hàng thất bại</option>
            <option value="returned">Trả hàng</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Đơn vị vận chuyển</label>
          <select
            value={carrierFilter}
            onChange={(e) => {
              setCarrierFilter(e.target.value ? Number(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Số lượng / trang</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="shipping-table-wrapper">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mã vận đơn</th>
              <th>Đơn hàng</th>
              <th>Đơn vị vận chuyển</th>
              <th>Trạng thái</th>
              <th>Trọng lượng</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Không có đơn vận chuyển nào
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>#{shipment.id}</td>
                  <td>
                    <code className="code-badge">{shipment.tracking_number}</code>
                  </td>
                  <td>
                    {shipment.order ? (
                      <div>
                        <strong>#{shipment.order.order_number}</strong>
                        <br />
                        <small className="text-muted">{shipment.order.customer_name}</small>
                      </div>
                    ) : (
                      `Order ID: ${shipment.order_id}`
                    )}
                  </td>
                  <td>{shipment.carrier?.name || `ID: ${shipment.carrier_id}`}</td>
                  <td>{getStatusBadge(shipment.status)}</td>
                  <td>{shipment.weight ? `${shipment.weight} kg` : '-'}</td>
                  <td className="text-muted">{formatDate(shipment.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewDetail(shipment.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages} (Tổng: {totalShipments})
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}

