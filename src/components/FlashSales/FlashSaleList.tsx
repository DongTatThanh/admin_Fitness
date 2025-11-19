import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashSaleService, type FlashSale } from '../../services/flashsale.service';
import '../../styles/FlashSales.css';

const FlashSaleList: React.FC = () => {
  const navigate = useNavigate();
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const limit = 10;

  useEffect(() => {
    loadFlashSales();
  }, [currentPage, statusFilter]);

  const loadFlashSales = async () => {
    try {
      setLoading(true);
      const response = await flashSaleService.getAllFlashSales(
        currentPage,
        limit,
        statusFilter
      );
      setFlashSales(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      alert('Lỗi khi tải danh sách Flash Sale: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await flashSaleService.deleteFlashSale(deleteId);
      alert('Xóa Flash Sale thành công!');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadFlashSales();
    } catch (error: any) {
      alert('Lỗi khi xóa Flash Sale: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await flashSaleService.updateFlashSale(id, {
        is_active: !currentStatus,
      });
      alert(`${!currentStatus ? 'Bật' : 'Tắt'} Flash Sale thành công!`);
      loadFlashSales();
    } catch (error: any) {
      alert('Lỗi khi cập nhật trạng thái: ' + (error?.message || 'Unknown error'));
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleEdit = (flashSale: FlashSale) => {
    setSelectedFlashSale(flashSale);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedFlashSale(null);
    setShowModal(true);
  };

  const handleViewProducts = (flashSaleId: number) => {
    navigate(`/flash-sales/${flashSaleId}/products`);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Đang diễn ra', class: 'badge-active' },
      upcoming: { text: 'Sắp diễn ra', class: 'badge-upcoming' },
      expired: { text: 'Đã kết thúc', class: 'badge-expired' },
    };
    const badge = badges[status as keyof typeof badges] || { text: status, class: '' };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="flashsale-list-container">
      <div className="flashsale-header">
        <h2>Quản lý Flash Sale</h2>
        <button className="btn-primary" onClick={handleCreate}>
          Tạo Flash Sale mới
        </button>
      </div>

      <div className="flashsale-filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang diễn ra</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="expired">Đã kết thúc</option>
        </select>
      </div>

      <div className="flashsale-table-wrapper">
        <table className="flashsale-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên chương trình</th>
              <th>Thời gian bắt đầu</th>
              <th>Thời gian kết thúc</th>
              <th>Trạng thái</th>
              <th>Số sản phẩm</th>
              <th title="Click để bật/tắt">Hoạt động</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {flashSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Không có Flash Sale nào
                </td>
              </tr>
            ) : (
              flashSales.map((fs) => (
                <tr key={fs.id}>
                  <td>{fs.id}</td>
                  <td>
                    <div className="flashsale-name">{fs.name}</div>
                    {fs.description && (
                      <div className="flashsale-desc">{fs.description}</div>
                    )}
                  </td>
                  <td>{formatDateTime(fs.start_time)}</td>
                  <td>{formatDateTime(fs.end_time)}</td>
                  <td>{getStatusBadge(fs.status)}</td>
                  <td className="text-center">{fs.product_count}</td>
                  <td className="text-center">
                    <button
                      className={`active-badge ${fs.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(fs.id, fs.is_active)}
                      title={fs.is_active ? 'Click để tắt' : 'Click để bật'}
                    >
                      {fs.is_active ? 'Bật' : 'Tắt'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-info"
                        onClick={() => handleViewProducts(fs.id)}
                        title="Xem sản phẩm"
                      >
                        Sản phẩm
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(fs)}
                        title="Sửa"
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(fs.id)}
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Sau
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa Flash Sale này?</p>
            <p className="warning-text">
              Lưu ý: Tất cả sản phẩm trong Flash Sale cũng sẽ bị xóa!
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{selectedFlashSale ? 'Cập nhật Flash Sale' : 'Tạo Flash Sale mới'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <FlashSaleForm
              flashSale={selectedFlashSale}
              onSuccess={() => {
                setShowModal(false);
                loadFlashSales();
              }}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Flash Sale Form Component (inline for simplicity)
interface FlashSaleFormProps {
  flashSale: FlashSale | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FlashSaleForm: React.FC<FlashSaleFormProps> = ({
  flashSale,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: flashSale?.name || '',
    description: flashSale?.description || '',
    start_time: flashSale?.start_time
      ? new Date(flashSale.start_time).toISOString().slice(0, 16)
      : '',
    end_time: flashSale?.end_time
      ? new Date(flashSale.end_time).toISOString().slice(0, 16)
      : '',
    is_active: flashSale?.is_active ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên Flash Sale');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      alert('Vui lòng nhập thời gian bắt đầu và kết thúc');
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      alert('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }

    try {
      setSubmitting(true);
      if (flashSale) {
        await flashSaleService.updateFlashSale(flashSale.id, formData);
        alert('Cập nhật Flash Sale thành công!');
      } else {
        await flashSaleService.createFlashSale(formData);
        alert('Tạo Flash Sale thành công!');
      }
      onSuccess();
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flashsale-form">
      <div className="form-group">
        <label>
          Tên Flash Sale <span className="required">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="VD: Flash Sale cuối tuần"
          required
        />
      </div>

      <div className="form-group">
        <label>Mô tả</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả về chương trình Flash Sale"
          rows={3}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>
            Thời gian bắt đầu <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>
            Thời gian kết thúc <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          Kích hoạt Flash Sale
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : flashSale ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
};

export default FlashSaleList;
