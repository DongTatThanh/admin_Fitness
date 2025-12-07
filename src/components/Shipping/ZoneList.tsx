import { useState, useEffect } from 'react';
import '../../styles/Shipping.css';
import { shippingZonesService } from '../../services/shipping-zones.service';
import type { ShippingZone } from '../../services/shipping-zones.service';
import ZoneForm from './ZoneForm';

export default function ZoneList() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalZones, setTotalZones] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete' | 'add'>('view');
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);

  // Load zones
  const loadZones = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shippingZonesService.getZones({
        page: currentPage,
        limit: limit,
        isActive: statusFilter,
      });

      // Filter by search if needed
      let filteredData = response.data;
      if (search.trim()) {
        filteredData = filteredData.filter(
          (z) =>
            z.name.toLowerCase().includes(search.toLowerCase()) ||
            z.code.toLowerCase().includes(search.toLowerCase()) ||
            z.provinces.some((p) => p.toLowerCase().includes(search.toLowerCase())) ||
            z.districts.some((d) => d.toLowerCase().includes(search.toLowerCase()))
        );
      }

      setZones(filteredData);
      setTotalPages(response.totalPages);
      setTotalZones(response.total);
    } catch (err: any) {
      console.error('Error loading zones:', err);
      setError('Không thể tải danh sách khu vực: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, [currentPage, limit, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadZones();
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
  const handleViewZone = async (zoneId: number) => {
    try {
      const zone = await shippingZonesService.getZoneById(zoneId);
      setSelectedZone(zone);
      setModalMode('view');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Sửa
  const handleEditZone = async (zoneId: number) => {
    try {
      const zone = await shippingZonesService.getZoneById(zoneId);
      setSelectedZone(zone);
      setModalMode('edit');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Xóa
  const handleDeleteZone = async (zoneId: number) => {
    try {
      const zone = await shippingZonesService.getZoneById(zoneId);
      setSelectedZone(zone);
      setModalMode('delete');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const confirmDelete = async () => {
    if (!selectedZone) return;

    try {
      await shippingZonesService.deleteZone(selectedZone.id);
      alert('Xóa khu vực thành công!');
      setShowModal(false);
      setSelectedZone(null);
      loadZones();
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err?.message || 'Unknown error'));
    }
  };

  // Thêm mới
  const handleAddZone = () => {
    setSelectedZone(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedZone(null);
    loadZones();
  };

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h2>Quản lý Khu vực Vận chuyển</h2>
        <button className="btn btn-primary" onClick={handleAddZone}>
          + Thêm khu vực mới
        </button>
      </div>

      {/* Filters */}
      <div className="shipping-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã, tỉnh/thành, quận/huyện..."
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
              <th>Tên khu vực</th>
              <th>Mã</th>
              <th>Tỉnh/Thành</th>
              <th>Quận/Huyện</th>
              <th>Trạng thái</th>
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
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Không có khu vực nào
                </td>
              </tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.id}>
                  <td>{zone.id}</td>
                  <td className="font-semibold">{zone.name}</td>
                  <td>
                    <code className="code-badge">{zone.code}</code>
                  </td>
                  <td>
                    {zone.provinces.length > 0 ? (
                      <div className="tags-list">
                        {zone.provinces.slice(0, 2).map((p, idx) => (
                          <span key={idx} className="tag">
                            {p}
                          </span>
                        ))}
                        {zone.provinces.length > 2 && (
                          <span className="tag">+{zone.provinces.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {zone.districts && zone.districts.length > 0 ? (
                      <div className="tags-list">
                        {zone.districts.slice(0, 2).map((d, idx) => (
                          <span key={idx} className="tag">
                            {d}
                          </span>
                        ))}
                        {zone.districts.length > 2 && (
                          <span className="tag">+{zone.districts.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted">Tất cả</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${zone.is_active ? 'active' : 'inactive'}`}
                    >
                      {zone.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(zone.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewZone(zone.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditZone(zone.id)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteZone(zone.id)}
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
            Trang {currentPage} / {totalPages} (Tổng: {totalZones})
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
            {modalMode === 'delete' && selectedZone && (
              <>
                <div className="modal-header">
                  <h3>Xác nhận xóa</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn xóa khu vực "{selectedZone.name}"?</p>
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

            {modalMode === 'view' && selectedZone && (
              <>
                <div className="modal-header">
                  <h3>Chi tiết Khu vực Vận chuyển</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-view">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedZone.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">{selectedZone.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Mã:</span>
                      <span className="detail-value">
                        <code className="code-badge">{selectedZone.code}</code>
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tỉnh/Thành:</span>
                      <span className="detail-value">
                        {selectedZone.provinces.length > 0 ? (
                          <div className="tags-list">
                            {selectedZone.provinces.map((p, idx) => (
                              <span key={idx} className="tag">
                                {p}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Quận/Huyện:</span>
                      <span className="detail-value">
                        {selectedZone.districts && selectedZone.districts.length > 0 ? (
                          <div className="tags-list">
                            {selectedZone.districts.map((d, idx) => (
                              <span key={idx} className="tag">
                                {d}
                              </span>
                            ))}
                          </div>
                        ) : (
                          'Tất cả'
                        )}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Trạng thái:</span>
                      <span
                        className={`status-badge ${selectedZone.is_active ? 'active' : 'inactive'}`}
                      >
                        {selectedZone.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">{formatDate(selectedZone.created_at)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày cập nhật:</span>
                      <span className="detail-value">{formatDate(selectedZone.updated_at)}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Đóng
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditZone(selectedZone.id)}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              </>
            )}

            {(modalMode === 'add' || modalMode === 'edit') && (
              <ZoneForm
                zone={modalMode === 'edit' ? selectedZone : null}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowModal(false);
                  setSelectedZone(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}




