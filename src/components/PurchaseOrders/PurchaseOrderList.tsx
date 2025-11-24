import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PurchaseOrders.css';
import { purchaseOrdersService, suppliersService } from '../../services';
import type {
  PurchaseOrder,
  PurchaseOrderStatus,
} from '../../services/purchase-orders.service';
import type { Supplier } from '../../services/suppliers.service';

export default function PurchaseOrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
  const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load suppliers for filter
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await suppliersService.getActiveSuppliers();
        setSuppliers(response);
      } catch (err) {
        console.error('Error loading suppliers:', err);
      }
    };
    loadSuppliers();
  }, []);

  // Load purchase orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await purchaseOrdersService.getPurchaseOrders({
        page: currentPage,
        limit: limit,
        status: statusFilter || undefined,
        supplierId: supplierFilter || undefined,
      });

      setOrders(response.data);
      setTotalPages(response.totalPages);
      setTotalOrders(response.total);
    } catch (err: any) {
      console.error('Error loading purchase orders:', err);
      setError('Không thể tải danh sách đơn nhập hàng: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, limit, statusFilter, supplierFilter]);

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

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    const statusMap: Record<PurchaseOrderStatus, { label: string; className: string }> = {
      draft: { label: 'Nháp', className: 'status-draft' },
      pending: { label: 'Chờ duyệt', className: 'status-pending' },
      approved: { label: 'Đã duyệt', className: 'status-approved' },
      received: { label: 'Đã nhận hàng', className: 'status-received' },
      cancelled: { label: 'Đã hủy', className: 'status-cancelled' },
    };
    const { label, className } = statusMap[status];
    return <span className={`status-badge ${className}`}>{label}</span>;
  };

  const handleViewDetail = (orderId: number) => {
    navigate(`/purchase-orders/${orderId}`);
  };

  const handleApprove = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt đơn nhập hàng này?')) return;

    try {
      await purchaseOrdersService.approvePurchaseOrder(orderId);
      alert('Duyệt đơn hàng thành công!');
      loadOrders();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn nhập hàng này?')) return;

    try {
      await purchaseOrdersService.cancelPurchaseOrder(orderId);
      alert('Hủy đơn hàng thành công!');
      loadOrders();
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div className="purchase-orders-container">
      <div className="purchase-orders-header">
        <h2>Quản lý Đơn nhập hàng</h2>
        <button className="btn btn-primary" onClick={() => navigate('/purchase-orders/new')}>
          + Tạo đơn nhập hàng mới
        </button>
      </div>

      {/* Filters */}
      <div className="purchase-orders-filters">
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PurchaseOrderStatus | '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="received">Đã nhận hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            value={supplierFilter}
            onChange={(e) => {
              setSupplierFilter(e.target.value ? Number(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="purchase-orders-table-wrapper">
        <table className="purchase-orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nhà cung cấp</th>
              <th>Số lượng items</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  Không có đơn nhập hàng nào
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.supplier?.name || `ID: ${order.supplier_id}`}</td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="font-semibold text-primary">
                    {formatCurrency(order.total_amount || 0)}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="text-muted">{formatDate(order.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewDetail(order.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      {order.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleApprove(order.id)}
                          title="Duyệt"
                        >
                          ✓
                        </button>
                      )}
                      {['draft', 'pending', 'approved'].includes(order.status) && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancel(order.id)}
                          title="Hủy"
                        >
                          ✕
                        </button>
                      )}
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
            Trang {currentPage} / {totalPages} (Tổng: {totalOrders})
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

