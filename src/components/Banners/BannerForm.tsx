import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bannerService } from '../../services/banner.service';
import '../../styles/Banners.css';

const BannerForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    link_url: '',
    link_target: '_self' as '_self' | '_blank' | '_parent' | '_top',
    position: 1,
    sort_order: 0,
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadBanner(parseInt(id));
    }
  }, [id]);

  const loadBanner = async (bannerId: number) => {
    try {
      setLoading(true);
      const banner = await bannerService.getBannerById(bannerId);
      
      setFormData({
        name: banner.name,
        link_url: banner.link_url || '',
        link_target: banner.link_target || '_self',
        position: banner.position,
        sort_order: banner.sort_order,
        start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
        end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
        is_active: banner.is_active,
      });

      setCurrentImageUrl(banner.image_url);
    } catch (error: any) {
      alert('Lỗi khi tải thông tin banner: ' + (error?.message || 'Unknown error'));
      navigate('/banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
        alert('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên banner');
      return;
    }

    if (!isEdit && !imageFile) {
      alert('Vui lòng chọn ảnh banner');
      return;
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        alert('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
    }

    try {
      setSubmitting(true);

      // Tạo FormData để gửi với file upload
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('position', formData.position.toString());
      submitFormData.append('sort_order', formData.sort_order.toString());
      submitFormData.append('link_target', formData.link_target);
      submitFormData.append('is_active', formData.is_active.toString());

      if (formData.link_url.trim()) {
        submitFormData.append('link_url', formData.link_url.trim());
      }

      if (formData.start_date) {
        submitFormData.append('start_date', formData.start_date);
      }

      if (formData.end_date) {
        submitFormData.append('end_date', formData.end_date);
      }

      // Thêm file ảnh nếu có
      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      if (isEdit && id) {
        await bannerService.updateBanner(parseInt(id), submitFormData);
        alert('Cập nhật banner thành công!');
      } else {
        await bannerService.createBanner(submitFormData);
        alert('Tạo banner thành công!');
      }

      navigate('/banners');
    } catch (error: any) {
      console.error('Submit error:', error);
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:3201${imageUrl}`;
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="banner-form-container">
      <div className="banner-form-header">
        <h2>{isEdit ? 'Cập nhật Banner' : 'Tạo Banner mới'}</h2>
        <button className="btn-back" onClick={() => navigate('/banners')}>
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        <div className="form-group">
          <label>
            Tên Banner <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Banner khuyến mãi tháng 11"
            required
          />
        </div>

        <div className="form-group">
          <label>
            Hình ảnh Banner {!isEdit && <span className="required">*</span>}
          </label>
          <input
            type="file"
            accept="image/jpg,image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageChange}
            required={!isEdit}
          />
          <small className="form-hint">
            Chấp nhận: JPG, JPEG, PNG, GIF, WebP. Tối đa 5MB.
          </small>
        </div>

        {(imagePreview || currentImageUrl) && (
          <div className="form-group">
            <label>Xem trước</label>
            <img
              src={imagePreview || getImageUrl(currentImageUrl)}
              alt="Preview"
              className="image-preview"
            />
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>
              Vị trí hiển thị <span className="required">*</span>
            </label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
              required
            >
              <option value={1}>Header</option>
              <option value={2}>Sidebar</option>
              <option value={3}>Footer</option>
              <option value={4}>Home Page</option>
            </select>
          </div>

          <div className="form-group">
            <label>Thứ tự sắp xếp</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              min="0"
              placeholder="0"
            />
            <small className="form-hint">Số nhỏ hơn sẽ hiển thị trước</small>
          </div>
        </div>

        <div className="form-group">
          <label>Liên kết (URL)</label>
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
            placeholder="https://example.com/promotion"
          />
        </div>

        <div className="form-group">
          <label>Mở liên kết trong</label>
          <select
            value={formData.link_target}
            onChange={(e) => setFormData({ ...formData, link_target: e.target.value as any })}
          >
            <option value="_self">Cùng tab (_self)</option>
            <option value="_blank">Tab mới (_blank)</option>
            <option value="_parent">Parent (_parent)</option>
            <option value="_top">Top (_top)</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Ngày kết thúc</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
            Kích hoạt banner
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/banners')}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;
