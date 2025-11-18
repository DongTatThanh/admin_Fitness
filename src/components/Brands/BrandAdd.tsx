import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Brands.css';
import { brandService } from '../../services/brand.service';
import { getImageUrl } from '../../lib/api_client';
import useImageUpload from '../../hooks/useImageUpload';

export default function BrandAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    country: '',
    description: '',
    logo_url: '',
    is_active: true,
    is_featured: false,
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { uploadImage, uploading, error: uploadError, resetError } = useImageUpload();

  useEffect(() => {
    if (formData.logo_url) {
      setLogoPreview(formData.logo_url);
    }
  }, [formData.logo_url]);

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

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    resetError();
    const localPreview = URL.createObjectURL(file);
    setLogoPreview(localPreview);

    try {
      const uploadedUrl = await uploadImage(file);
      setFormData((prev) => ({ ...prev, logo_url: uploadedUrl }));
      setLogoPreview(uploadedUrl);
    } catch {
      setLogoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên nhãn hàng');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Vui lòng nhập slug hợp lệ');
      return;
    }

    try {
      setLoading(true);
      const response = await brandService.createBrand({
        name: formData.name,
        slug: formData.slug,
        country: formData.country || undefined,
        description: formData.description || undefined,
        logo_url: formData.logo_url || undefined,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
      });

      alert(response.message || 'Thêm nhãn hàng thành công!');
      navigate('/brands/list');
    } catch (err: any) {
      console.error('Error creating brand:', err);
      alert(`Lỗi: ${err.message || 'Không thể thêm nhãn hàng'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-add">
      <div className="page-header">
        <h2>Thêm nhãn hàng mới</h2>
        <button className="btn-secondary" onClick={() => navigate('/brands/list')}>
          ← Quay lại
        </button>
      </div>
      
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên nhãn hàng *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên nhãn hàng"
              required
            />
          </div>

          <div className="form-group">
            <label>Slug *</label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="auto-tao-tu-ten"
            />
            <small className="form-hint">Slug dùng cho URL, tự động tạo từ tên và có thể chỉnh.</small>
          </div>

          <div className="form-group">
            <label>Quốc gia</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              placeholder="Nhập quốc gia"
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả nhãn hàng"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoFileChange}
              disabled={uploading || loading}
            />
            {uploading && <small className="form-hint">Đang tải ảnh...</small>}
            {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
            {logoPreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={logoPreview.startsWith('blob:') ? logoPreview : getImageUrl(logoPreview)} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select 
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
            >
              <option value="true">Kích hoạt</option>
              <option value="false">Tạm ngưng</option>
            </select>
          </div>

          <div className="form-group">
            <label>Nổi bật</label>
            <select 
              value={formData.is_featured ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, is_featured: e.target.value === 'true'})}
            >
              <option value="false">Không</option>
              <option value="true">Có</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading || uploading}>
              {loading ? 'Đang xử lý...' : uploading ? 'Đang tải logo...' : 'Thêm nhãn hàng'}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/brands/list')}
              disabled={loading}
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
