import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerService, type Banner } from '../../services/banner.service';
import '../../styles/Banners.css';

const BannerList: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [positionFilter, setPositionFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const limit = 10;

  const positionLabels: { [key: number]: string } = {
    1: 'Header',
    2: 'Sidebar',
    3: 'Footer',
    4: 'Home Page',
  };

  useEffect(() => {
    loadBanners();
  }, [currentPage, positionFilter, statusFilter]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getAdminBanners(
        currentPage,
        limit,
        positionFilter,
        statusFilter
      );
      setBanners(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      alert('Lỗi khi tải danh sách banner: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await bannerService.toggleActive(id);
      loadBanners();
    } catch (error: any) {
      alert('Lỗi khi cập nhật trạng thái: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await bannerService.deleteBanner(deleteId);
      alert('Xóa banner thành công!');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadBanners();
    } catch (error: any) {
      alert('Lỗi khi xóa banner: ' + (error?.message || 'Unknown error'));
    }
  };

  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleCreate = () => {
    navigate('/banners/add');
  };

  const handleEdit = (id: number) => {
    navigate(`/banners/edit/${id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:3201${imageUrl}`;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="banner-list-container">
      <div className="banner-header">
        <h2>Quản lý Banner</h2>
        <button className="btn-primary" onClick={handleCreate}>
          Tạo Banner mới
        </button>
      </div>

      <div className="banner-filters">
        <select
          value={positionFilter ?? ''}
          onChange={(e) => {
            setPositionFilter(e.target.value ? Number(e.target.value) : undefined);
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">Tất cả vị trí</option>
          <option value="1">Header</option>
          <option value="2">Sidebar</option>
          <option value="3">Footer</option>
          <option value="4">Home Page</option>
        </select>

        <select
          value={statusFilter === undefined ? '' : statusFilter.toString()}
          onChange={(e) => {
            setStatusFilter(e.target.value === '' ? undefined : e.target.value === 'true');
            setCurrentPage(1);
          }}
          className="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Tạm dừng</option>
        </select>
      </div>

      <div className="banner-table-wrapper">
        <table className="banner-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hình ảnh</th>
              <th>Tên</th>
              <th>Vị trí</th>
              <th>Thứ tự</th>
              <th>Thời gian</th>
              <th title="Click để bật/tắt">Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  Không có banner nào
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id}>
                  <td>{banner.id}</td>
                  <td>
                    <img
                      src={getImageUrl(banner.image_url)}
                      alt={banner.name}
                      className="banner-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="banner-name">{banner.name}</div>
                    {banner.link_url && (
                      <div className="banner-link">
                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                          {banner.link_url}
                        </a>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="position-badge">
                      {positionLabels[banner.position] || `Vị trí ${banner.position}`}
                    </span>
                  </td>
                  <td className="text-center">{banner.sort_order}</td>
                  <td>
                    <div className="date-range">
                      <div>Từ: {formatDate(banner.start_date)}</div>
                      <div>Đến: {formatDate(banner.end_date)}</div>
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      className={`status-badge ${banner.is_active ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(banner.id)}
                      title={banner.is_active ? 'Click để tắt' : 'Click để bật'}
                    >
                      {banner.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(banner.id)}
                        title="Sửa"
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(banner.id)}
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
            <p>Bạn có chắc chắn muốn xóa banner này?</p>
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
    </div>
  );
};

export default BannerList;
