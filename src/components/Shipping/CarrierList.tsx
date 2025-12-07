import { useState, useEffect } from 'react';
import '../../styles/Shipping.css';
import { shippingCarriersService } from '../../services/shipping-carriers.service';
import type { ShippingCarrier } from '../../services/shipping-carriers.service';
import CarrierForm from './CarrierForm';

export default function CarrierList() {
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCarriers, setTotalCarriers] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete' | 'add'>('view');
  const [selectedCarrier, setSelectedCarrier] = useState<ShippingCarrier | null>(null);

  // Load carriers
  const loadCarriers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shippingCarriersService.getCarriers({
        page: currentPage,
        limit: limit,
        isActive: statusFilter,
      });

      // Filter by search if needed
      let filteredData = response.data;
      if (search.trim()) {
        filteredData = filteredData.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.contact_phone?.includes(search) ||
            c.contact_email?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setCarriers(filteredData);
      setTotalPages(response.totalPages);
      setTotalCarriers(response.total);
    } catch (err: any) {
      console.error('Error loading carriers:', err);
      setError('Không thể tải danh sách đơn vị vận chuyển: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarriers();
  }, [currentPage, limit, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadCarriers();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Xem chi tiết
  const handleViewCarrier = async (carrierId: number) => {
    try {
      const carrier = await shippingCarriersService.getCarrierById(carrierId);
      setSelectedCarrier(carrier);
      setModalMode('view');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Sửa
  const handleEditCarrier = async (carrierId: number) => {
    try {
      const carrier = await shippingCarriersService.getCarrierById(carrierId);
      setSelectedCarrier(carrier);
      setModalMode('edit');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Xóa
  const handleDeleteCarrier = async (carrierId: number) => {
    try {
      const carrier = await shippingCarriersService.getCarrierById(carrierId);
      setSelectedCarrier(carrier);
      setModalMode('delete');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const confirmDelete = async () => {
    if (!selectedCarrier) return;

    try {
      await shippingCarriersService.deleteCarrier(selectedCarrier.id);
      alert('Xóa đơn vị vận chuyển thành công!');
      setShowModal(false);
      setSelectedCarrier(null);
      loadCarriers();
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err?.message || 'Unknown error'));
    }
  };

  // Thêm mới
  const handleAddCarrier = () => {
    setSelectedCarrier(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedCarrier(null);
    loadCarriers();
  };

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h2>Quản lý Đơn vị Vận chuyển</h2>
        <button className="btn btn-primary" onClick={handleAddCarrier}>
          + Thêm đơn vị vận chuyển mới
        </button>
      </div>

      {/* Filters */}
      <div className="shipping-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã, SĐT, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter === undefined ? '' : statusFilter.toString()}
            onChange={(e) =>
              setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true')
            }
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Ngừng hoạt động</option>
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
      <div className="shipping-table-wrapper">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đơn vị</th>
              <th>Mã</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>API Endpoint</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : carriers.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">
                  Không có đơn vị vận chuyển nào
                </td>
              </tr>
            ) : (
              carriers.map((carrier) => (
                <tr key={carrier.id}>
                  <td>{carrier.id}</td>
                  <td className="font-semibold">{carrier.name}</td>
                  <td>
                    <code className="code-badge">{carrier.code}</code>
                  </td>
                  <td>{carrier.contact_phone || '-'}</td>
                  <td>{carrier.contact_email || '-'}</td>
                  <td className="text-muted">{carrier.api_endpoint || '-'}</td>
                  <td>
                    <span
                      className={`status-badge ${carrier.is_active ? 'active' : 'inactive'}`}
                    >
                      {carrier.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(carrier.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewCarrier(carrier.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditCarrier(carrier.id)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteCarrier(carrier.id)}
                        title="Xóa"
                      >
                        🗑️
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
            Trang {currentPage} / {totalPages} (Tổng: {totalCarriers})
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalMode === 'delete' && selectedCarrier && (
              <>
                <div className="modal-header">
                  <h3>Xác nhận xóa</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    Bạn có chắc chắn muốn xóa đơn vị vận chuyển "{selectedCarrier.name}"?
                  </p>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn-danger" onClick={confirmDelete}>
                      Xóa
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'view' && selectedCarrier && (
              <>
                <div className="modal-header">
                  <h3>Chi tiết Đơn vị Vận chuyển</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-view">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedCarrier.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">{selectedCarrier.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Mã:</span>
                      <span className="detail-value">
                        <code className="code-badge">{selectedCarrier.code}</code>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">SĐT:</span>
                      <span className="detail-value">{selectedCarrier.contact_phone || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedCarrier.contact_email || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">API Endpoint:</span>
                      <span className="detail-value">{selectedCarrier.api_endpoint || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ghi chú:</span>
                      <span className="detail-value">{selectedCarrier.notes || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Trạng thái:</span>
                      <span
                        className={`status-badge ${selectedCarrier.is_active ? 'active' : 'inactive'}`}
                      >
                        {selectedCarrier.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">{formatDate(selectedCarrier.created_at)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày cập nhật:</span>
                      <span className="detail-value">{formatDate(selectedCarrier.updated_at)}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Đóng
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditCarrier(selectedCarrier.id)}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              </>
            )}

            {(modalMode === 'add' || modalMode === 'edit') && (
              <CarrierForm
                carrier={modalMode === 'edit' ? selectedCarrier : null}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowModal(false);
                  setSelectedCarrier(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}




