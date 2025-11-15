import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Categories.css';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../services/categories.service';

export default function CategoryList() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort_order: 0,
    status: 'active' as 'active' | 'inactive'
  });

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesService.getAllCategoriesAdmin({
        page: currentPage,
        limit: limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });

      setCategories(response.data);
      setTotalPages(response.pages);
      setTotalCategories(response.total);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [currentPage, limit, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadCategories();
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
  const handleViewCategory = async (categoryId: number) => {
    try {
      const category = await categoriesService.getCategoryByIdAdmin(categoryId);
      setSelectedCategory(category);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading category:', err);
      alert('Không thể tải thông tin danh mục');
    }
  };

  // Chỉnh sửa
  const handleEditCategory = async (categoryId: number) => {
    try {
      const category = await categoriesService.getCategoryByIdAdmin(categoryId);
      setSelectedCategory(category);
      setEditForm({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        icon: category.icon_class || '',
        sort_order: category.sort_order || 0,
        status: category.is_active ? 'active' : 'inactive',
      });
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading category:', err);
      alert('Không thể tải thông tin danh mục');
    }
  };

  // Lưu cập nhật
  const handleSaveEdit = async () => {
    if (!selectedCategory) return;

    try {
      const updateData: any = {
        name: editForm.name || undefined,
        slug: editForm.slug || undefined,
        description: editForm.description || undefined,
        icon: editForm.icon || undefined,
        sort_order: editForm.sort_order,
        status: editForm.status,
      };

      const response = await categoriesService.updateCategory(selectedCategory.id, updateData);
      alert(response.message || 'Cập nhật thành công!');
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      console.error('Error updating category:', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật danh mục'}`);
    }
  };

  // Xóa
  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalMode('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;

    try {
      const response = await categoriesService.deleteCategory(selectedCategory.id);
      alert(response.message || 'Xóa danh mục thành công!');
      setShowModal(false);
      loadCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa danh mục'}`);
    }
  };

  return (
    <div className="category-list">
      <div className="page-header">
        <div className="header-left">
          <h2>📂 Quản lý danh mục</h2>
          <p>Tổng số: {totalCategories} danh mục</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/categories/add')}>
          ➕ Thêm danh mục mới
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Kích hoạt</option>
            <option value="inactive">Tạm ngưng</option>
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
          <button onClick={loadCategories}>Thử lại</button>
        </div>
      )}

      {/* Categories table */}
      {!loading && !error && (
        <>
          <div className="content-card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                  
                    <th>Tên danh mục</th>
                    <th>Slug</th>
                    <th>Mô tả</th>
                    <th>Số sản phẩm</th>
                    <th>Thứ tự</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <tr key={category.id}>
                        <td>#{category.id}</td>
                       
                        <td><code>{category.slug}</code></td>
                        <td className="description-cell">{category.description || '-'}</td>
                        <td>{category.products?.length || 0}</td>
                        <td>{category.sort_order}</td>
                        <td>
                          <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                            {category.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td className="date-cell">{formatDate(category.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => handleViewCategory(category.id)}
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-action btn-edit"
                              onClick={() => handleEditCategory(category.id)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteCategory(category)}
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
                      <td colSpan={10} className="empty-state">
                        Chưa có danh mục nào
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
      {showModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* View Mode */}
            {modalMode === 'view' && (
              <>
                <div className="modal-header">
                  <h2>📂 Chi tiết danh mục</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{selectedCategory.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Icon:</span>
                    <span className="info-value">{selectedCategory.icon_class || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{selectedCategory.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Slug:</span>
                    <span className="info-value"><code>{selectedCategory.slug}</code></span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Mô tả:</span>
                    <span className="info-value">{selectedCategory.description || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Thứ tự:</span>
                    <span className="info-value">{selectedCategory.sort_order}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Trạng thái:</span>
                    <span className={`status-badge ${selectedCategory.is_active ? 'active' : 'inactive'}`}>
                      {selectedCategory.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{formatDate(selectedCategory.created_at)}</span>
                  </div>
                </div>
              </>
            )}

            {/* Edit Mode */}
            {modalMode === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>✏️ Chỉnh sửa danh mục</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tên danh mục</label>
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
                    <label>Mô tả</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon</label>
                    <input
                      type="text"
                      value={editForm.icon}
                      onChange={(e) => setEditForm({...editForm, icon: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Thứ tự</label>
                    <input
                      type="number"
                      value={editForm.sort_order}
                      onChange={(e) => setEditForm({...editForm, sort_order: Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as 'active' | 'inactive'})}
                    >
                      <option value="active">Kích hoạt</option>
                      <option value="inactive">Tạm ngưng</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit}>
                    💾 Lưu thay đổi
                  </button>
                </div>
              </>
            )}

            {/* Delete Mode */}
            {modalMode === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>⚠️ Xác nhận xóa</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="delete-warning">
                    Bạn có chắc chắn muốn xóa danh mục <strong>{selectedCategory.name}</strong>?
                  </p>
                  <p className="delete-note">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-delete-confirm" onClick={confirmDelete}>
                    🗑️ Xóa
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
