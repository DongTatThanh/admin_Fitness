import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Posts.css';
import { postsService } from '../../services/posts.service';
import type { BlogPost, BlogCategory } from '../../services/posts.service';
import useImageUpload from '../../hooks/useImageUpload';
import { getImageUrl } from '../../lib/api_client';

type ModalMode = 'view' | 'edit' | 'delete';

export default function PostList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [featuredFilter, setFeaturedFilter] = useState<'' | '1' | '0'>('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [editForm, setEditForm] = useState({
    category_id: '' as number | '',
    title: '',
    slug: '',
    author: '',
    thumbnail: '',
    content: '',
    is_featured: '0',
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const { uploadImage, uploading: uploadingThumbnail, error: uploadError, resetError } = useImageUpload();

  const formatDate = (input?: string) => {
    if (!input) return '-';
    return new Date(input).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadCategories = async () => {
    try {
      const result = await postsService.getAdminCategories();
      setCategories(result);
    } catch (err) {
      console.error('Error loading post categories:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsService.getAdminPosts({
        page: currentPage,
        limit,
        search: search.trim() || undefined,
        categoryId: categoryFilter || undefined,
        isFeatured: featuredFilter ? Number(featuredFilter) : undefined,
      });
      setPosts(response.data);
      setTotalPages(response.lastPage);
      setTotalPosts(response.total);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [currentPage, limit, categoryFilter, featuredFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadPosts();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewPost = async (postId: number) => {
    try {
      const post = await postsService.getPostById(postId);
      setSelectedPost(post);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading post:', err);
      alert('Không thể tải chi tiết bài viết');
    }
  };

  const handleEditPost = async (postId: number) => {
    try {
      const post = await postsService.getPostById(postId);
      setSelectedPost(post);
      setEditForm({
        category_id: post.category_id || '',
        title: post.title || '',
        slug: post.slug || '',
        author: post.author || '',
        thumbnail: post.thumbnail || '',
        content: post.content || '',
        is_featured: post.is_featured?.toString() ?? '0',
      });
      setThumbnailPreview(post.thumbnail || null);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading post:', err);
      alert('Không thể tải thông tin bài viết');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    if (!editForm.title.trim()) {
      alert('Tiêu đề không được để trống');
      return;
    }
    if (!editForm.slug.trim()) {
      alert('Slug không được để trống');
      return;
    }
    try {
      const payload = {
        category_id: editForm.category_id ? Number(editForm.category_id) : undefined,
        title: editForm.title || undefined,
        slug: editForm.slug || undefined,
        author: editForm.author || undefined,
        content: editForm.content || undefined,
        thumbnail: editForm.thumbnail || undefined,
        is_featured: editForm.is_featured ? Number(editForm.is_featured) : 0,
      };
      const response = await postsService.updatePost(selectedPost.id, payload);
      alert(response.message || 'Cập nhật bài viết thành công');
      setShowModal(false);
      loadPosts();
    } catch (err: any) {
      console.error('Error updating post:', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật bài viết'}`);
    }
  };

  const handleDeletePost = (post: BlogPost) => {
    setSelectedPost(post);
    setModalMode('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      const response = await postsService.deletePost(selectedPost.id);
      alert(response.message || 'Đã xóa bài viết');
      setShowModal(false);
      loadPosts();
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa bài viết'}`);
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      await postsService.updatePost(post.id, { is_featured: post.is_featured === 1 ? 0 : 1 });
      loadPosts();
    } catch (err: any) {
      console.error('Error toggling featured:', err);
      alert(`Lỗi: ${err.message || 'Không thể thay đổi trạng thái nổi bật'}`);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetError();
    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);
    try {
      const uploadedUrl = await uploadImage(file);
      setEditForm((prev) => ({ ...prev, thumbnail: uploadedUrl }));
      setThumbnailPreview(uploadedUrl);
    } catch {
      setThumbnailPreview(selectedPost?.thumbnail || null);
    }
  };

  const featuredBadge = (value?: number) => (
    <span className={`status-badge ${value === 1 ? 'active' : 'inactive'}`}>
      {value === 1 ? 'Nổi bật' : 'Thường'}
    </span>
  );

  return (
    <div className="posts-page">
      <div className="page-header">
        <div>
          <h2>📝 Quản lý bài viết</h2>
          <p>Tổng số: {totalPosts} bài viết</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/posts/add')}>
          ➕ Thêm bài viết
        </button>
      </div>

      <div className="posts-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm tiêu đề, nội dung..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cate) => (
            <option key={cate.id} value={cate.id}>{cate.name}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value as any)}
        >
          <option value="">Tất cả</option>
          <option value="1">Nổi bật</option>
          <option value="0">Không nổi bật</option>
        </select>
        <select
          className="filter-select"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="10">10 / trang</option>
          <option value="20">20 / trang</option>
          <option value="50">50 / trang</option>
        </select>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadPosts}>Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="content-card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Danh mục</th>
                    <th>Tác giả</th>
                    <th>Nổi bật</th>
                    <th>Lượt xem</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length ? (
                    posts.map((post) => (
                      <tr key={post.id}>
                        <td>#{post.id}</td>
                        <td>
                          <div className="post-title-cell">
                            <strong>{post.title}</strong>
                            <span className="sub-info">Slug: {post.slug}</span>
                          </div>
                        </td>
                        <td>{post.category?.name || '-'}</td>
                        <td>{post.author}</td>
                        <td>{featuredBadge(post.is_featured)}</td>
                        <td>{post.views ?? 0}</td>
                        <td>{formatDate(post.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-view"
                              onClick={() => handleViewPost(post.id)}
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button
                              className="btn-action btn-edit"
                              onClick={() => handleEditPost(post.id)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-action btn-status"
                              onClick={() => handleToggleFeatured(post)}
                              title="Đổi trạng thái nổi bật"
                            >
                              {post.is_featured === 1 ? '⭐' : '☆'}
                            </button>
                            <button
                              className="btn-action btn-delete"
                              onClick={() => handleDeletePost(post)}
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
                      <td colSpan={8} className="empty-state">
                        Chưa có bài viết nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              ← Trước
            </button>
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Sau →
            </button>
          </div>
        </>
      )}

      {showModal && selectedPost && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalMode === 'view' && (
              <>
                <div className="modal-header">
                  <h2>📖 Chi tiết bài viết</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  {selectedPost.thumbnail && (
                    <div className="info-row">
                      <span className="info-label">Thumbnail:</span>
                      <img
                        src={getImageUrl(selectedPost.thumbnail)}
                        alt={selectedPost.title}
                        className="post-thumbnail-large"
                      />
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{selectedPost.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tiêu đề:</span>
                    <span className="info-value">{selectedPost.title}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Danh mục:</span>
                    <span className="info-value">{selectedPost.category?.name || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tác giả:</span>
                    <span className="info-value">{selectedPost.author}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Slug:</span>
                    <span className="info-value"><code>{selectedPost.slug}</code></span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nổi bật:</span>
                    <span className="info-value">{selectedPost.is_featured === 1 ? 'Có' : 'Không'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nội dung:</span>
                    <span className="info-value post-content">{selectedPost.content}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{formatDate(selectedPost.created_at)}</span>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>✏️ Chỉnh sửa bài viết</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select
                        value={editForm.category_id}
                        onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Chọn danh mục</option>
                        {categories.map((cate) => (
                          <option key={cate.id} value={cate.id}>{cate.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tiêu đề</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Slug</label>
                      <input
                        type="text"
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tác giả</label>
                      <input
                        type="text"
                        value={editForm.author}
                        onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nổi bật</label>
                      <select
                        value={editForm.is_featured}
                        onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.value })}
                      >
                        <option value="0">Không</option>
                        <option value="1">Có</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Thumbnail</label>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} disabled={uploadingThumbnail} />
                    {uploadingThumbnail && <small className="form-hint">Đang tải ảnh...</small>}
                    {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
                    {thumbnailPreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={thumbnailPreview.startsWith('blob:') ? thumbnailPreview : getImageUrl(thumbnailPreview)}
                          alt="Thumbnail preview"
                          className="post-thumbnail-large"
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Nội dung</label>
                    <textarea
                      rows={6}
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit} disabled={uploadingThumbnail}>
                    {uploadingThumbnail ? 'Đang tải ảnh...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}

            {modalMode === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>⚠️ Xóa bài viết</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="delete-warning">
                    Bạn có chắc chắn muốn xóa bài viết <strong>{selectedPost.title}</strong>?
                  </p>
                  <p className="delete-note">Hành động này không thể hoàn tác.</p>
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

