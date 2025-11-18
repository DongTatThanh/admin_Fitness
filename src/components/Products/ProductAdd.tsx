import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Products.css';
import { productsService } from '../../services/products.service';
import { categoriesService, type Category } from '../../services/categories.service';
import { brandService, type Brand } from '../../services/brand.service';
import useImageUpload, { useMultipleImageUpload } from '../../hooks/useImageUpload';
import { getImageUrl } from '../../lib/api_client';

export default function ProductAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    compare_price: '',
    quantity: '',
    category_id: '',
    brand_id: '',
    short_description: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    featured_image: '',
    gallery_images: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const { uploadImage, uploading, error: uploadError, resetError } = useImageUpload();
  const { 
    uploadMultipleImages, 
    uploading: uploadingGallery, 
    error: galleryError, 
    progress: uploadProgress 
  } = useMultipleImageUpload();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoriesService.getAllCategoriesAdmin({ page: 1, limit: 100 }),
          brandService.getAdminBrands({ page: 1, limit: 100 }),
        ]);
        setCategories(categoriesRes.data || []);
        setBrands(brandsRes.data || []);
      } catch (err) {
        console.error('Error loading categories/brands:', err);
      }
    };
    loadData();
  }, []);

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetError();
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, featured_image: uploadedUrl }));
      setImagePreview(uploadedUrl);
    } catch {
      setImagePreview(null);
    }
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const uploadedUrls = await uploadMultipleImages(fileArray);
      
      setFormData((prev) => ({ 
        ...prev, 
        gallery_images: [...prev.gallery_images, ...uploadedUrls] 
      }));
      setGalleryPreviews((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('Error uploading gallery images:', err);
      alert('Lỗi khi upload ảnh gallery');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Slug không hợp lệ');
      return;
    }
    if (!formData.sku.trim()) {
      alert('Vui lòng nhập SKU');
      return;
    }
    if (!formData.price) {
      alert('Vui lòng nhập giá');
      return;
    }
    if (!formData.quantity) {
      alert('Vui lòng nhập tồn kho');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        slug: formData.slug,
        sku: formData.sku,
        price: Number(formData.price),
        compare_price: formData.compare_price ? Number(formData.compare_price) : undefined,
        quantity: Number(formData.quantity),
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        brand_id: formData.brand_id ? Number(formData.brand_id) : undefined,
        short_description: formData.short_description || undefined,
        description: formData.description || undefined,
        status: formData.status,
        featured_image: formData.featured_image || undefined,
        gallery_images: formData.gallery_images.length > 0 ? formData.gallery_images : undefined,
      };

      const response = await productsService.createProduct(payload);
      alert(response.message || 'Thêm sản phẩm thành công!');
      navigate('/products/list');
    } catch (err: any) {
      console.error('Error creating product:', err);
      alert(`Lỗi: ${err.message || 'Không thể tạo sản phẩm'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-add">
      <div className="page-header">
        <h2>Thêm sản phẩm mới</h2>
        <button className="btn-secondary" onClick={() => navigate('/products/list')}>
          ← Quay lại
        </button>
      </div>
      
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="form-group">
              <label>Slug *</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-tao-tu-ten"
              />
              <small className="form-hint">Slug dùng cho URL, tự động tạo từ tên.</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>SKU *</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="VD: SKU-001"
                required
              />
            </div>
            <div className="form-group">
              <label>Giá (VNĐ) *</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá so sánh</label>
              <input 
                type="number" 
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Số lượng tồn kho *</label>
              <input 
                type="number" 
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

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
              <label>Nhãn hàng *</label>
              <select 
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                required
              >
                <option value="">Chọn nhãn hàng</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Trạng thái</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Ảnh đại diện</label>
            <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
            {uploading && <small className="form-hint">Đang tải ảnh...</small>}
            {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={imagePreview.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)}
                  alt="Preview"
                  className="product-image-preview"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Gallery ảnh (nhiều ảnh)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleGalleryImagesChange} 
              disabled={uploadingGallery} 
            />
            {uploadingGallery && (
              <small className="form-hint">
                Đang tải ảnh... {uploadProgress}%
              </small>
            )}
            {galleryError && <small style={{ color: '#e74c3c' }}>{galleryError}</small>}
            {galleryPreviews.length > 0 && (
              <div className="gallery-preview">
                {galleryPreviews.map((url, index) => (
                  <div key={index} className="gallery-item">
                    <img
                      src={url.startsWith('blob:') ? url : getImageUrl(url)}
                      alt={`Gallery ${index + 1}`}
                      className="gallery-thumb"
                    />
                    <button
                      type="button"
                      className="gallery-remove"
                      onClick={() => handleRemoveGalleryImage(index)}
                      title="Xóa ảnh này"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Mô tả ngắn</label>
            <textarea 
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Tóm tắt ngắn gọn về sản phẩm"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Mô tả chi tiết</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Nhập mô tả chi tiết sản phẩm"
              rows={6}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/products/list')} disabled={loading}>
              Hủy bỏ
            </button>
            <button type="submit" className="btn-primary" disabled={loading || uploading || uploadingGallery}>
              {loading ? 'Đang xử lý...' : (uploading || uploadingGallery) ? 'Đang tải ảnh...' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
