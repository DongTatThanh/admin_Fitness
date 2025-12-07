import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Brands.css';
import { brandService } from '../../services/brand.service';
import type { Brand } from '../../services/brand.service';
import { getImageUrl } from '../../lib/api_client';
import useImageUpload from '../../hooks/useImageUpload';

export default function BrandList() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'true' | 'false' | ''>('');
  const [featuredFilter, setFeaturedFilter] = useState<'true' | 'false' | ''>('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    country: '',
    description: '',
    logo_url: '',
    is_active: true,
    is_featured: false,
  });
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const { uploadImage, uploading: uploadingLogo, error: uploadError, resetError } = useImageUpload();

  // Load brands
  const loadBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await brandService.getAdminBrands({
        page: currentPage,
        limit: limit,
        search: search.trim() || undefined,
        is_active: statusFilter || undefined,
        is_featured: featuredFilter || undefined,
      });

      setBrands(response.data);
      setTotalPages(response.pages);
      setTotalBrands(response.total);
    } catch (err) {
      console.error('Error loading brands:', err);
      setError('Không thể tải danh sách nhãn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [currentPage, limit, statusFilter, featuredFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadBrands();
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
  const handleViewBrand = async (brandId: number) => {
    try {
      const brand = await brandService.getBrandDetails(brandId);
      console.log('Loaded brand for view:', brand);
      setSelectedBrand(brand);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('lỗi ', err);
      alert('Không thể tải thông tin nhãn hàng');
    }
  };

  // Chỉnh sửa
  const handleEditBrand = async (brandId: number) => {
    try {
      const brand = await brandService.getBrandDetails(brandId);
      console.log('Loaded brand for edit:', brand);
      setSelectedBrand(brand);
      setEditForm({
        name: brand.name,
        slug: brand.slug || '',
        country: brand.country || '',
        description: brand.description || '',
        logo_url: brand.logo_url || '',
        is_active: brand.is_active,
        is_featured: brand.is_featured,
      });
      setEditLogoPreview(brand.logo_url || null);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('lỗi', err);
      alert('Không thể tải thông tin nhãn hàng');
    }
  };

  // Lưu cập nhật
  const handleSaveEdit = async () => {
    if (!selectedBrand) {
      alert('Không có nhãn hàng được chọn');
      return;
    }

    // Validate và parse ID
    const brandId = Number(selectedBrand.id || (selectedBrand as any).brand_id);
    
    if (!brandId || brandId <= 0 || isNaN(brandId)) {
      console.error('Invalid brand ID:', {
        id: selectedBrand.id,
        brand_id: (selectedBrand as any).brand_id,
        selectedBrand
      });
      alert('ID nhãn hàng không hợp lệ');
      return;
    }

    try {
      const updateData: any = {
        name: editForm.name || undefined,
        slug: editForm.slug || undefined,
        country: editForm.country || undefined,
        description: editForm.description || undefined,
        logo_url: editForm.logo_url || undefined,
        is_active: editForm.is_active,
        is_featured: editForm.is_featured,
      };

      console.log('Updating brand ID:', brandId, 'Data:', updateData);
      console.log('Selected brand:', selectedBrand);

      const response = await brandService.updateBrand(brandId, updateData);
      alert(response.message || 'Cập nhật thành công!');
      setShowModal(false);
      loadBrands();
    } catch (err: any) {
      console.error('lỗi', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật nhãn hàng'}`);
    }
  };

  const handleEditLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetError();
    const localPreview = URL.createObjectURL(file);
    setEditLogoPreview(localPreview);

    try {
      const uploadedUrl = await uploadImage(file);
      setEditForm((prev) => ({ ...prev, logo_url: uploadedUrl }));
      setEditLogoPreview(uploadedUrl);
    } catch {
      setEditLogoPreview(selectedBrand?.logo_url || null);
    }
  };

  // Xóa
  const handleDeleteBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setModalMode('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedBrand) {
      alert('Không có nhãn hàng được chọn');
      return;
    }

    // Validate và parse ID
    const brandId = Number(selectedBrand.id || (selectedBrand as any).brand_id);
    
    if (!brandId || brandId <= 0 || isNaN(brandId)) {
      console.error('Invalid brand ID:', {
        id: selectedBrand.id,
        brand_id: (selectedBrand as any).brand_id,
        selectedBrand
      });
      alert('ID nhãn hàng không hợp lệ');
      return;
    }

    try {
      console.log('Deleting brand ID:', brandId);
      const response = await brandService.deleteBrand(brandId);
      alert(response.message || 'Xóa nhãn hàng thành công!');
      setShowModal(false);
      loadBrands();
    } catch (err: any) {
      console.error('Error deleting brand:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa nhãn hàng'}`);
    }
  };

  // Cập nhật trạng thái
  const handleToggleStatus = async (brand: Brand) => {
    try {
      await brandService.updateBrandStatus(brand.id, !brand.is_active);
      loadBrands();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    }
  };

  return (
    <div className="brand-list">
      <div className="page-header">
        <div className="header-left">
          <h2> Quản lý nhãn hàng</h2>
          <p>Tổng số: {totalBrands} nhãn hàng</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/brands/add')}>
           Thêm nhãn hàng mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Tìm kiếm nhãn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Kích hoạt</option>
            <option value="false">Tạm ngưng</option>
          </select>

          <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value as any)}>
            <option value="">Tất cả</option>
            <option value="true">Nổi bật</option>
            <option value="false">Không nổi bật</option>
          </select>

          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
            <option value="100">100 / trang</option>
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadBrands}>Thử lại</button>
        </div>
      )}

      {/* Brands table */}
      {!loading && !error && (
        <>
          <div className="content-card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Logo</th>
                    <th>Tên nhãn hàng</th>
                    <th>Quốc gia</th>
                    <th>Số sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Nổi bật</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.length > 0 ? (
                    brands.map((brand) => (
                      <tr key={brand.id}>
                        <td>#{brand.id}</td>
                        <td>
                          {brand.logo_url ? (
                            <img 
                              src={getImageUrl(brand.logo_url)} 
                              alt={brand.name}
                              className="brand-logo"
                            />
                          ) : (
                            <span className="no-logo"></span>
                          )}
                        </td>
                        <td><strong>{brand.name}</strong></td>
                        <td>{brand.country || '-'}</td>
                        <td>{brand.products_count || brand.products?.length || 0}</td>
                        <td>
                          <span className={`status-badge ${brand.is_active ? 'active' : 'inactive'}`}>
                            {brand.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${brand.is_featured ? 'active' : 'inactive'}`}>
                            {brand.is_featured ? 'Nổi bật' : '-'}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(brand.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => handleViewBrand(brand.id)}
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-action btn-edit"
                              onClick={() => handleEditBrand(brand.id)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-action btn-status"
                              onClick={() => handleToggleStatus(brand)}
                              title={brand.is_active ? 'Tạm ngưng' : 'Kích hoạt'}
                            >
                              {brand.is_active ? '⏸️' : '▶️'}
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteBrand(brand)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="empty-state">
                        Chưa có nhãn hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Trước
            </button>

            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>

            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau →
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && selectedBrand && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* View Mode */}
            {modalMode === 'view' && (
              <>
                <div className="modal-header">
                  <h2>Chi tiết nhãn hàng</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  {selectedBrand.logo_url && (
                    <div className="info-row">
                      <span className="info-label">Logo:</span>
                      <img 
                        src={getImageUrl(selectedBrand.logo_url)} 
                        alt={selectedBrand.name}
                        className="brand-logo-large"
                      />
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{selectedBrand.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{selectedBrand.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Quốc gia:</span>
                    <span className="info-value">{selectedBrand.country || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mô tả:</span>
                    <span className="info-value">{selectedBrand.description || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Trạng thái:</span>
                    <span className={`status-badge ${selectedBrand.is_active ? 'active' : 'inactive'}`}>
                      {selectedBrand.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nổi bật:</span>
                    <span className={`status-badge ${selectedBrand.is_featured ? 'active' : 'inactive'}`}>
                      {selectedBrand.is_featured ? 'Có' : 'Không'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Số sản phẩm:</span>
                    <span className="info-value">{selectedBrand.products_count || selectedBrand.products?.length || 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{formatDate(selectedBrand.created_at)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Edit Mode */}
            {modalMode === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Chỉnh sửa nhãn hàng</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tên nhãn hàng</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug</label>
                    <input
                      type="text"
                      value={editForm.slug}
                      onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quốc gia</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditLogoFileChange}
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && <small className="form-hint">Đang tải ảnh...</small>}
                    {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
                    {editLogoPreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={editLogoPreview.startsWith('blob:') ? editLogoPreview : getImageUrl(editLogoPreview)}
                          alt="Logo preview"
                          style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      value={editForm.is_active ? 'true' : 'false'}
                      onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                    >
                      <option value="true">Kích hoạt</option>
                      <option value="false">Tạm ngưng</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Nổi bật</label>
                    <select
                      value={editForm.is_featured ? 'true' : 'false'}
                      onChange={(e) => setEditForm({...editForm, is_featured: e.target.value === 'true'})}
                    >
                      <option value="true">Có</option>
                      <option value="false">Không</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit} disabled={uploadingLogo}>
                    {uploadingLogo ? 'Đang tải logo...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}

            {/* Delete Mode */}
            {modalMode === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>Xác nhận xóa</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="delete-warning">
                    Bạn có chắc chắn muốn xóa nhãn hàng <strong>{selectedBrand.name}</strong>?
                  </p>
                  <p className="delete-note">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-delete-confirm" onClick={confirmDelete}>
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
