import { useState, useEffect } from 'react';
import '../../styles/Suppliers.css';
import { suppliersService } from '../../services/suppliers.service';
import type { Supplier } from '../../services/suppliers.service';
import SupplierForm from './SupplierForm';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete' | 'add'>('view');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Load suppliers
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await suppliersService.getSuppliers({
        page: currentPage,
        limit: limit,
        isActive: statusFilter,
      });

      // Filter by search if needed
      let filteredData = response.data;
      if (search.trim()) {
        filteredData = filteredData.filter(
          (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase()) ||
            s.phone?.includes(search)
        );
      }

      setSuppliers(filteredData);
      setTotalPages(response.totalPages);
      setTotalSuppliers(response.total);
    } catch (err: any) {
      console.error('Error loading suppliers:', err);
      setError('Không thể tải danh sách nhà cung cấp: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [currentPage, limit, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadSuppliers();
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
  const handleViewSupplier = async (supplierId: number) => {
    try {
      const supplier = await suppliersService.getSupplierById(supplierId);
      setSelectedSupplier(supplier);
      setModalMode('view');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Sửa
  const handleEditSupplier = async (supplierId: number) => {
    try {
      const supplier = await suppliersService.getSupplierById(supplierId);
      setSelectedSupplier(supplier);
      setModalMode('edit');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Xóa
  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      const supplier = await suppliersService.getSupplierById(supplierId);
      setSelectedSupplier(supplier);
      setModalMode('delete');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const confirmDelete = async () => {
    if (!selectedSupplier) return;

    try {
      await suppliersService.deleteSupplier(selectedSupplier.id);
      alert('Xóa nhà cung cấp thành công!');
      setShowModal(false);
      setSelectedSupplier(null);
      loadSuppliers();
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err?.message || 'Unknown error'));
    }
  };

  // Thêm mới
  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedSupplier(null);
    loadSuppliers();
  };

  return (
    <div className="suppliers-container">
      <div className="suppliers-header">
        <h2>Quản lý Nhà cung cấp</h2>
        <button className="btn btn-primary" onClick={handleAddSupplier}>
          + Thêm nhà cung cấp mới
        </button>
      </div>

      {/* Filters */}
      <div className="suppliers-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, người liên hệ, email, SĐT..."
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
            <option value="100">100 / trang</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="suppliers-table-wrapper">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà cung cấp</th>
              <th>Người liên hệ</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Địa chỉ</th>
              <th>Mã số thuế</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">
                  Không có nhà cung cấp nào
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>{supplier.id}</td>
                  <td className="font-semibold">{supplier.name}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td className="text-muted">{supplier.address || '-'}</td>
                  <td>{supplier.tax_code || '-'}</td>
                  <td>
                    <span
                      className={`status-badge ${supplier.is_active ? 'active' : 'inactive'}`}
                    >
                      {supplier.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="text-muted">{formatDate(supplier.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewSupplier(supplier.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditSupplier(supplier.id)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteSupplier(supplier.id)}
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
            Trang {currentPage} / {totalPages} (Tổng: {totalSuppliers})
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
            {modalMode === 'delete' && selectedSupplier && (
              <>
                <div className="modal-header">
                  <h3>Xác nhận xóa</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn xóa nhà cung cấp "{selectedSupplier.name}"?</p>
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

            {modalMode === 'view' && selectedSupplier && (
              <>
                <div className="modal-header">
                  <h3>Chi tiết Nhà cung cấp</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-view">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedSupplier.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">{selectedSupplier.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Người liên hệ:</span>
                      <span className="detail-value">{selectedSupplier.contact_person || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{selectedSupplier.email || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">SĐT:</span>
                      <span className="detail-value">{selectedSupplier.phone || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Địa chỉ:</span>
                      <span className="detail-value">{selectedSupplier.address || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Mã số thuế:</span>
                      <span className="detail-value">{selectedSupplier.tax_code || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ghi chú:</span>
                      <span className="detail-value">{selectedSupplier.notes || '-'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Trạng thái:</span>
                      <span
                        className={`status-badge ${selectedSupplier.is_active ? 'active' : 'inactive'}`}
                      >
                        {selectedSupplier.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày tạo:</span>
                      <span className="detail-value">{formatDate(selectedSupplier.created_at)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Ngày cập nhật:</span>
                      <span className="detail-value">{formatDate(selectedSupplier.updated_at)}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Đóng
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditSupplier(selectedSupplier.id)}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              </>
            )}

            {(modalMode === 'add' || modalMode === 'edit') && (
              <SupplierForm
                supplier={modalMode === 'edit' ? selectedSupplier : null}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowModal(false);
                  setSelectedSupplier(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}




