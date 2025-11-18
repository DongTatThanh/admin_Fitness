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
    
    // Hiển thị preview NGAY LẬP TỨC khi chọn file
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    
    // Upload ảnh lên server trong background
    try {
      const uploadedUrl = await uploadImage(file);
      // Cập nhật với URL đã upload
      setFormData((prev) => ({ ...prev, featured_image: uploadedUrl }));
      // Cập nhật preview với URL thật từ server
      setImagePreview(uploadedUrl);
      // Clean up blob URL
      URL.revokeObjectURL(preview);
    } catch (error) {
      console.error('Upload failed:', error);
      // Nếu upload thất bại, xóa preview
      setImagePreview(null);
      URL.revokeObjectURL(preview);
      alert('Lỗi khi upload ảnh đại diện');
    }
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Tạo preview NGAY LẬP TỨC cho tất cả files được chọn
    const localPreviews = fileArray.map(file => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...localPreviews]);

    // Upload ảnh lên server trong background
    try {
      const uploadedUrls = await uploadMultipleImages(fileArray);
      
      // Cập nhật với URLs đã upload
      setFormData((prev) => ({ 
        ...prev, 
        gallery_images: [...prev.gallery_images, ...uploadedUrls] 
      }));
      
      // Thay thế local previews bằng URLs thật từ server
      setGalleryPreviews((prev) => {
        // Loại bỏ local previews cũ
        const filtered = prev.filter(url => !url.startsWith('blob:'));
        return [...filtered, ...uploadedUrls];
      });
      
      // Clean up blob URLs
      localPreviews.forEach(url => URL.revokeObjectURL(url));
      
    } catch (err) {
      console.error('Error uploading gallery images:', err);
      
      // Nếu upload thất bại, xóa local previews
      setGalleryPreviews((prev) => 
        prev.filter(url => !localPreviews.includes(url))
      );
      
      // Clean up blob URLs
      localPreviews.forEach(url => URL.revokeObjectURL(url));
      
      alert('Lỗi khi upload ảnh gallery. Vui lòng thử lại.');
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
              <label>Giá bán (VNĐ) *</label>
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
              <label>Giá so sánh (VNĐ)</label>
              <input 
                type="number" 
                value={formData.compare_price}
                onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                placeholder="0"
              />
              <small className="form-hint">Giá gốc trước khi giảm (nếu có)</small>
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
            {uploading && <small className="form-hint">Đang tải ảnh lên server...</small>}
            {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
            {imagePreview && (
              <div style={{ marginTop: '16px', position: 'relative' }}>
                <div style={{ 
                  display: 'inline-block', 
                  position: 'relative',
                  border: '3px solid #667eea',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  <img 
                    src={imagePreview.startsWith('blob:') ? imagePreview : getImageUrl(imagePreview)}
                    alt="Preview"
                    className="product-thumb"
                    style={{ display: 'block' }}
                  />
                  {uploading && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(102, 126, 234, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      ⏳ Đang upload...
                    </div>
                  )}
                  {!uploading && !imagePreview.startsWith('blob:') && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                    }}>
                      ✓ Đã upload
                    </div>
                  )}
                </div>
                {!uploading && imagePreview && (
                  <small className="form-hint" style={{ display: 'block', marginTop: '8px', color: '#10b981' }}>
                    ✓ Ảnh đã sẵn sàng để lưu
                  </small>
                )}
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
              <small className="form-hint" style={{ color: '#667eea', fontWeight: 'bold' }}>
                Đang tải ảnh lên server... {uploadProgress}%
              </small>
            )}
            {galleryError && <small style={{ color: '#e74c3c' }}>{galleryError}</small>}
            {galleryPreviews.length > 0 && (
              <div>
                <small className="form-hint" style={{ display: 'block', marginTop: '12px', marginBottom: '8px' }}>
                  📸 Đã chọn {galleryPreviews.length} ảnh
                </small>
                <div className="gallery-preview">
                  {galleryPreviews.map((url, index) => (
                    <div key={index} className="gallery-item">
                      <img
                        src={url.startsWith('blob:') ? url : getImageUrl(url)}
                        alt={`Gallery ${index + 1}`}
                        className="gallery-thumb"
                      />
                      {url.startsWith('blob:') && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(102, 126, 234, 0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          borderRadius: '12px'
                        }}>
                          ⏳ Đang upload...
                        </div>
                      )}
                      {!url.startsWith('blob:') && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          left: '6px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          padding: '3px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
                        }}>
                          ✓ OK
                        </div>
                      )}
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
