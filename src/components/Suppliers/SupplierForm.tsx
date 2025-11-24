import { useState, useEffect } from 'react';
import { suppliersService } from '../../services/suppliers.service';
import type { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../../services/suppliers.service';

interface SupplierFormProps {
  supplier: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_code: '',
    notes: '',
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        tax_code: supplier.tax_code || '',
        notes: supplier.notes || '',
        is_active: supplier.is_active ?? true,
      });
    }
  }, [supplier]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên nhà cung cấp là bắt buộc';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
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

      if (supplier) {
        // Update
        const updateDto: UpdateSupplierDto = {
          name: formData.name.trim(),
          contact_person: formData.contact_person.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          tax_code: formData.tax_code.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          is_active: formData.is_active,
        };

        await suppliersService.updateSupplier(supplier.id, updateDto);
        alert('Cập nhật nhà cung cấp thành công!');
      } else {
        // Create
        const createDto: CreateSupplierDto = {
          name: formData.name.trim(),
          contact_person: formData.contact_person.trim() || undefined,
          email: formData.email.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          tax_code: formData.tax_code.trim() || undefined,
          notes: formData.notes.trim() || undefined,
        };

        await suppliersService.createSupplier(createDto);
        alert('Tạo nhà cung cấp thành công!');
      }

      onSuccess();
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="supplier-form-container">
      <div className="modal-header">
        <h3>{supplier ? 'Cập nhật Nhà cung cấp' : 'Thêm Nhà cung cấp mới'}</h3>
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="supplier-form">
        <div className="form-group">
          <label>
            Tên nhà cung cấp <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'error' : ''}
            placeholder="Nhập tên nhà cung cấp"
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Người liên hệ</label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
            placeholder="Tên người liên hệ"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'error' : ''}
              placeholder="email@example.com"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0123456789"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Địa chỉ</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Địa chỉ nhà cung cấp"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Mã số thuế</label>
          <input
            type="text"
            value={formData.tax_code}
            onChange={(e) => setFormData({ ...formData, tax_code: e.target.value })}
            placeholder="Mã số thuế"
          />
        </div>

        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Ghi chú về nhà cung cấp"
            rows={3}
          />
        </div>

        {supplier && (
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
            {submitting ? 'Đang xử lý...' : supplier ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}

