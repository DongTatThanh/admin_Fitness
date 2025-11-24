import { useState, useEffect } from 'react';
import { shippingCarriersService } from '../../services/shipping-carriers.service';
import type {
  ShippingCarrier,
  CreateShippingCarrierDto,
  UpdateShippingCarrierDto,
} from '../../services/shipping-carriers.service';

interface CarrierFormProps {
  carrier: ShippingCarrier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CarrierForm({ carrier, onSuccess, onCancel }: CarrierFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_phone: '',
    contact_email: '',
    api_endpoint: '',
    api_key: '',
    notes: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (carrier) {
      setFormData({
        name: carrier.name || '',
        code: carrier.code || '',
        contact_phone: carrier.contact_phone || '',
        contact_email: carrier.contact_email || '',
        api_endpoint: carrier.api_endpoint || '',
        api_key: carrier.api_key || '',
        notes: carrier.notes || '',
        is_active: carrier.is_active ?? true,
      });
    }
  }, [carrier]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên đơn vị vận chuyển là bắt buộc';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Mã đơn vị vận chuyển là bắt buộc';
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Mã chỉ được chứa chữ thường, số và dấu gạch dưới';
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email không hợp lệ';
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

      if (carrier) {
        // Update
        const updateDto: UpdateShippingCarrierDto = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          contact_phone: formData.contact_phone.trim() || undefined,
          contact_email: formData.contact_email.trim() || undefined,
          api_endpoint: formData.api_endpoint.trim() || undefined,
          api_key: formData.api_key.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          is_active: formData.is_active,
        };

        await shippingCarriersService.updateCarrier(carrier.id, updateDto);
        alert('Cập nhật đơn vị vận chuyển thành công!');
      } else {
        // Create
        const createDto: CreateShippingCarrierDto = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          contact_phone: formData.contact_phone.trim() || undefined,
          contact_email: formData.contact_email.trim() || undefined,
          api_endpoint: formData.api_endpoint.trim() || undefined,
          api_key: formData.api_key.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };

        await shippingCarriersService.createCarrier(createDto);
        alert('Tạo đơn vị vận chuyển thành công!');
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
        <h3>{carrier ? 'Cập nhật Đơn vị Vận chuyển' : 'Thêm Đơn vị Vận chuyển mới'}</h3>
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="shipping-form">
        <div className="form-group">
          <label>
            Tên đơn vị vận chuyển <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'error' : ''}
            placeholder="VD: Vietnam Post"
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>
            Mã đơn vị <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
            className={errors.code ? 'error' : ''}
            placeholder="VD: vietnam_post (chữ thường, số, dấu _)"
            required
          />
          {errors.code && <span className="error-message">{errors.code}</span>}
          <small className="text-muted">Chỉ được chứa chữ thường, số và dấu gạch dưới</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="19006017"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className={errors.contact_email ? 'error' : ''}
              placeholder="support@example.com"
            />
            {errors.contact_email && (
              <span className="error-message">{errors.contact_email}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>API Endpoint</label>
          <input
            type="url"
            value={formData.api_endpoint}
            onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
            placeholder="https://api.example.com"
          />
        </div>

        <div className="form-group">
          <label>API Key</label>
          <input
            type="password"
            value={formData.api_key}
            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
            placeholder="Nhập API key nếu có"
          />
        </div>

        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ghi chú về đơn vị vận chuyển"
            rows={3}
          />
        </div>

        {carrier && (
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
            {submitting ? 'Đang xử lý...' : carrier ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}

