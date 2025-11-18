import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Vouchers.css';
import { voucherService, type Voucher } from '../../services/voucher.service';
import { getImageUrl } from '../../lib/api_client';

export default function VoucherList() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, [filter]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = filter === 'active' 
        ? await voucherService.getActiveVouchers()
        : await voucherService.getAllVouchers();
      setVouchers(response.data || []);
    } catch (error: any) {
      console.error('Error loading vouchers:', error);
      alert(error.message || 'Không thể tải danh sách voucher');
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await voucherService.deleteVoucher(id);
      alert('Xóa voucher thành công!');
      loadVouchers();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa voucher');
    } finally {
      setShowDeleteModal(false);
      setSelectedVoucher(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getDiscountText = (voucher: Voucher) => {
    if (voucher.type === 'percentage') {
      return `${parseFloat(voucher.value)}%`;
    } else if (voucher.type === 'fixed') {
      return formatCurrency(parseFloat(voucher.value));
    } else {
      return 'Miễn phí ship';
    }
  };

  const getApplicableText = (type: string) => {
    const map: Record<string, string> = {
      all: 'Tất cả',
      products: 'Sản phẩm cụ thể',
      categories: 'Danh mục',
      brands: 'Thương hiệu'
    };
    return map[type] || type;
  };

  return (
    <div className="voucher-list">
      <div className="page-header">
        <div>
          <h2>🎟️ Quản lý Voucher</h2>
          <p>Tổng số: {vouchers?.length || 0} voucher</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/vouchers/add')}>
          ➕ Tạo voucher mới
        </button>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Còn hiệu lực
        </button>
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
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Loại giảm</th>
                  <th>Giá trị</th>
                  <th>Áp dụng</th>
                  <th>Sử dụng</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {vouchers && vouchers.length > 0 ? (
                  vouchers.map((voucher) => (
                    <tr key={voucher.id}>
                      <td>
                        <strong className="voucher-code">{voucher.code}</strong>
                      </td>
                      <td>
                        <div className="voucher-info">
                          {voucher.image && (
                            <img 
                              src={getImageUrl(voucher.image)} 
                              alt={voucher.name}
                              className="voucher-thumb"
                            />
                          )}
                          <span>{voucher.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`discount-type-badge ${voucher.type}`}>
                          {voucher.type === 'percentage' ? 'Phần trăm' : 
                           voucher.type === 'fixed' ? 'Cố định' : 'Free Ship'}
                        </span>
                      </td>
                      <td className="discount-value">{getDiscountText(voucher)}</td>
                      <td>{getApplicableText(voucher.applicable_to)}</td>
                      <td>
                        <span className="usage-info">
                          {voucher.used_count} / {voucher.usage_limit || '∞'}
                        </span>
                      </td>
                      <td>
                        <div className="date-range">
                          <div>{formatDate(voucher.start_date)}</div>
                          <div className="date-separator">→</div>
                          <div>{formatDate(voucher.end_date)}</div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${voucher.is_active === 1 ? 'active' : 'inactive'}`}>
                          {voucher.is_active === 1 ? 'Hoạt động' : 'Tạm ngưng'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => navigate('/vouchers/add', { state: { voucher } })}
                            title="Chỉnh sửa"
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setShowDeleteModal(true);
                            }}
                            title="Xóa"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      Chưa có voucher nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showDeleteModal && selectedVoucher && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa voucher <strong>{selectedVoucher.code}</strong>?</p>
              <p className="warning">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(selectedVoucher.id)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
