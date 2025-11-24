import { useState } from 'react';
import '../../styles/Inventory.css';
import { inventoryService } from '../../services';
import type { AdjustInventoryDto } from '../../services/inventory.service';

export default function InventoryAdjust() {
  const [formData, setFormData] = useState({
    productId: '',
    variantId: '',
    quantity: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = 'Vui lòng nhập Product ID';
    }

    if (!formData.quantity || parseFloat(formData.quantity) === 0) {
      newErrors.quantity = 'Số lượng không được bằng 0';
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

      const dto: AdjustInventoryDto = {
        quantity: parseInt(formData.quantity),
        notes: formData.notes || undefined,
        variantId: formData.variantId ? parseInt(formData.variantId) : null,
      };

      await inventoryService.adjustInventory(parseInt(formData.productId), dto);
      alert('Điều chỉnh tồn kho thành công!');
      
      // Reset form
      setFormData({
        productId: '',
        variantId: '',
        quantity: '',
        notes: '',
      });
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="inventory-adjust-container">
      <div className="inventory-header">
        <h2>Điều chỉnh Tồn kho</h2>
      </div>

      <div className="adjust-form-wrapper">
        <form onSubmit={handleSubmit} className="adjust-form">
          <div className="form-group">
            <label>
              Product ID <span className="required">*</span>
            </label>
            <input
              type="number"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className={errors.productId ? 'error' : ''}
              placeholder="Nhập Product ID"
              required
            />
            {errors.productId && (
              <span className="error-message">{errors.productId}</span>
            )}
          </div>

          <div className="form-group">
            <label>Variant ID (tùy chọn)</label>
            <input
              type="number"
              value={formData.variantId}
              onChange={(e) => setFormData({ ...formData, variantId: e.target.value })}
              placeholder="Nhập Variant ID nếu có"
            />
            <small className="text-muted">
              Để trống nếu điều chỉnh tồn kho của sản phẩm chính
            </small>
          </div>

          <div className="form-group">
            <label>
              Số lượng điều chỉnh <span className="required">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className={errors.quantity ? 'error' : ''}
              placeholder="Dương = tăng, Âm = giảm"
              required
            />
            {errors.quantity && (
              <span className="error-message">{errors.quantity}</span>
            )}
            <small className="text-muted">
              Ví dụ: +10 để tăng 10, -5 để giảm 5
            </small>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Ghi chú về lý do điều chỉnh"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : 'Điều chỉnh'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

