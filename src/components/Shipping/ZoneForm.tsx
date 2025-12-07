import { useState, useEffect } from 'react';
import { shippingZonesService } from '../../services/shipping-zones.service';
import type {
  ShippingZone,
  CreateShippingZoneDto,
  UpdateShippingZoneDto,
} from '../../services/shipping-zones.service';

interface ZoneFormProps {
  zone: ShippingZone | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ZoneForm({ zone, onSuccess, onCancel }: ZoneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    provinces: [] as string[],
    districts: [] as string[],
    is_active: true,
  });
  const [newProvince, setNewProvince] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (zone) {
      setFormData({
        name: zone.name || '',
        code: zone.code || '',
        provinces: zone.provinces || [],
        districts: zone.districts || [],
        is_active: zone.is_active ?? true,
      });
    }
  }, [zone]);

  const addProvince = () => {
    if (newProvince.trim() && !formData.provinces.includes(newProvince.trim())) {
      setFormData({
        ...formData,
        provinces: [...formData.provinces, newProvince.trim()],
      });
      setNewProvince('');
    }
  };

  const removeProvince = (index: number) => {
    setFormData({
      ...formData,
      provinces: formData.provinces.filter((_, i) => i !== index),
    });
  };

  const addDistrict = () => {
    if (newDistrict.trim() && !formData.districts.includes(newDistrict.trim())) {
      setFormData({
        ...formData,
        districts: [...formData.districts, newDistrict.trim()],
      });
      setNewDistrict('');
    }
  };

  const removeDistrict = (index: number) => {
    setFormData({
      ...formData,
      districts: formData.districts.filter((_, i) => i !== index),
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khu vực là bắt buộc';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã khu vực là bắt buộc';
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Mã chỉ được chứa chữ thường, số và dấu gạch dưới';
    }

    if (formData.provinces.length === 0) {
      newErrors.provinces = 'Vui lòng thêm ít nhất một tỉnh/thành';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      if (zone) {
        // Update
        const updateDto: UpdateShippingZoneDto = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          provinces: formData.provinces,
          districts: formData.districts.length > 0 ? formData.districts : undefined,
          is_active: formData.is_active,
        };

        await shippingZonesService.updateZone(zone.id, updateDto);
        alert('Cập nhật khu vực thành công!');
      } else {
        // Create
        const createDto: CreateShippingZoneDto = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          provinces: formData.provinces,
          districts: formData.districts.length > 0 ? formData.districts : undefined,
        };

        await shippingZonesService.createZone(createDto);
        alert('Tạo khu vực thành công!');
      }

      onSuccess();
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="shipping-form-container">
      <div className="modal-header">
        <h3>{zone ? 'Cập nhật Khu vực Vận chuyển' : 'Thêm Khu vực Vận chuyển mới'}</h3>
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="shipping-form">
        <div className="form-group">
          <label>
            Tên khu vực <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'error' : ''}
            placeholder="VD: Nội thành Hà Nội"
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>
            Mã khu vực <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
            className={errors.code ? 'error' : ''}
            placeholder="VD: hanoi_inner"
            required
          />
          {errors.code && <span className="error-message">{errors.code}</span>}
          <small className="text-muted">Chỉ được chứa chữ thường, số và dấu gạch dưới</small>
        </div>

        <div className="form-group">
          <label>
            Tỉnh/Thành <span className="required">*</span>
          </label>
          <div className="tags-input-group">
            <div className="tags-list">
              {formData.provinces.map((province, index) => (
                <span key={index} className="tag">
                  {province}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeProvince(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input">
              <input
                type="text"
                value={newProvince}
                onChange={(e) => setNewProvince(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProvince();
                  }
                }}
                placeholder="Nhập tỉnh/thành và nhấn Enter"
              />
              <button type="button" className="btn btn-sm btn-primary" onClick={addProvince}>
                Thêm
              </button>
            </div>
          </div>
          {errors.provinces && <span className="error-message">{errors.provinces}</span>}
        </div>

        <div className="form-group">
          <label>Quận/Huyện (tùy chọn)</label>
          <div className="tags-input-group">
            <div className="tags-list">
              {formData.districts.map((district, index) => (
                <span key={index} className="tag">
                  {district}
                  <button
                    type="button"
                    className="tag-remove"
                    onClick={() => removeDistrict(index)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="tag-input">
              <input
                type="text"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addDistrict();
                  }
                }}
                placeholder="Nhập quận/huyện và nhấn Enter (để trống = tất cả)"
              />
              <button type="button" className="btn btn-sm btn-primary" onClick={addDistrict}>
                Thêm
              </button>
            </div>
          </div>
          <small className="text-muted">
            Để trống nếu áp dụng cho tất cả quận/huyện trong tỉnh/thành
          </small>
        </div>

        {zone && (
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Đang hoạt động</span>
            </label>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : zone ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}




