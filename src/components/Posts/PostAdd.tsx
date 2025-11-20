import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Posts.css';
import { postsService } from '../../services/posts.service';
import type { BlogCategory } from '../../services/posts.service';
import useImageUpload from '../../hooks/useImageUpload';
import { getImageUrl } from '../../lib/api_client';

export default function PostAdd() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    slug: '',
    thumbnail: '',
    author: '',
    content: '',
    is_featured: '0',
  });
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const { uploadImage, uploading, error: uploadError, resetError } = useImageUpload();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await postsService.getAdminCategories();
        setCategories(result);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim(),
    }));
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetError();
    const preview = URL.createObjectURL(file);
    setThumbnailPreview(preview);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, thumbnail: uploadedUrl }));
      setThumbnailPreview(uploadedUrl);
    } catch {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Slug không hợp lệ');
      return;
    }
    if (!formData.author.trim()) {
      alert('Vui lòng nhập tác giả');
      return;
    }
    if (!formData.content.trim()) {
      alert('Vui lòng nhập nội dung');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        category_id: Number(formData.category_id),
        title: formData.title,
        slug: formData.slug,
        thumbnail: formData.thumbnail || undefined,
        author: formData.author,
        content: formData.content,
        is_featured: Number(formData.is_featured),
      };
      const response = await postsService.createPost(payload);
      alert(response.message || 'Thêm bài viết thành công!');
      navigate('/posts/list');
    } catch (err: any) {
      console.error('Error creating post:', err);
      alert(`Lỗi: ${err.message || 'Không thể tạo bài viết'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="posts-page">
      <div className="page-header">
        <h2>Thêm bài viết mới</h2>
        <button className="btn-secondary" onClick={() => navigate('/posts/list')}>
          ← Quay lại
        </button>
      </div>

      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Danh mục *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cate) => (
                  <option key={cate.id} value={cate.id}>{cate.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tiêu đề *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-tao-tu-ten"
                required
              />
            </div>
            <div className="form-group">
              <label>Tác giả *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Tên tác giả"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nổi bật</label>
              <select
                value={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.value })}
              >
                <option value="0">Không</option>
                <option value="1">Có</option>
              </select>
            </div>
            <div className="form-group">
              <label>Thumbnail</label>
              <input type="file" accept="image/*" onChange={handleThumbnailChange} disabled={uploading} />
              {uploading && <small className="form-hint">Đang tải ảnh...</small>}
              {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
              {thumbnailPreview && (
                <div style={{ marginTop: '10px' }}>
                  <img
                    src={thumbnailPreview.startsWith('blob:') ? thumbnailPreview : getImageUrl(thumbnailPreview)}
                    alt="Preview"
                    className="post-thumbnail-large"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Nội dung *</label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Nhập nội dung bài viết"
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/posts/list')}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || uploading}
            >
              {loading ? 'Đang xử lý...' : uploading ? 'Đang tải ảnh...' : 'Thêm bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

