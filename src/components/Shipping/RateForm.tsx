import { useState, useEffect } from 'react';
import {
  shippingRatesService,
  shippingCarriersService,
  shippingZonesService,
} from '../../services';
import type {
  ShippingRate,
  CreateShippingRateDto,
  UpdateShippingRateDto,
} from '../../services/shipping-rates.service';
import type { ShippingCarrier } from '../../services/shipping-carriers.service';
import type { ShippingZone } from '../../services/shipping-zones.service';

interface RateFormProps {
  rate: ShippingRate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RateForm({ rate, onSuccess, onCancel }: RateFormProps) {
  const [formData, setFormData] = useState({
    carrier_id: '',
    zone_id: '',
    name: '',
    min_weight: '0',
    max_weight: '',
    base_fee: '0',
    fee_per_kg: '0',
    estimated_days: '1',
    priority: '1',
    is_active: true,
  });
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Load carriers and zones
  useEffect(() => {
    const loadData = async () => {
      try {
        const [carriersRes, zonesRes] = await Promise.all([
          shippingCarriersService.getActiveCarriers(),
          shippingZonesService.getZones({ limit: 1000 }),
        ]);
        setCarriers(carriersRes);
        setZones(zonesRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (rate) {
      setFormData({
        carrier_id: rate.carrier_id.toString(),
        zone_id: rate.zone_id.toString(),
        name: rate.name || '',
        min_weight: rate.min_weight.toString(),
        max_weight: rate.max_weight?.toString() || '',
        base_fee: rate.base_fee.toString(),
        fee_per_kg: rate.fee_per_kg.toString(),
        estimated_days: rate.estimated_days.toString(),
        priority: rate.priority.toString(),
        is_active: rate.is_active ?? true,
      });
    }
  }, [rate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.carrier_id) {
      newErrors.carrier_id = 'Vui lòng chọn đơn vị vận chuyển';
    }

    if (!formData.zone_id) {
      newErrors.zone_id = 'Vui lòng chọn khu vực';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên bảng giá là bắt buộc';
    }

    const minWeight = parseFloat(formData.min_weight);
    const maxWeight = formData.max_weight ? parseFloat(formData.max_weight) : null;

    if (isNaN(minWeight) || minWeight < 0) {
      newErrors.min_weight = 'Trọng lượng tối thiểu phải >= 0';
    }

    if (maxWeight !== null && (isNaN(maxWeight) || maxWeight <= minWeight)) {
      newErrors.max_weight = 'Trọng lượng tối đa phải > trọng lượng tối thiểu';
    }

    const baseFee = parseFloat(formData.base_fee);
    const feePerKg = parseFloat(formData.fee_per_kg);

    if (isNaN(baseFee) || baseFee < 0) {
      newErrors.base_fee = 'Phí cơ bản phải >= 0';
    }

    if (isNaN(feePerKg) || feePerKg < 0) {
      newErrors.fee_per_kg = 'Phí mỗi kg phải >= 0';
    }

    const estimatedDays = parseInt(formData.estimated_days);
    if (isNaN(estimatedDays) || estimatedDays < 1) {
      newErrors.estimated_days = 'Thời gian ước tính phải >= 1 ngày';
    }

    const priority = parseInt(formData.priority);
    if (isNaN(priority) || priority < 1) {
      newErrors.priority = 'Độ ưu tiên phải >= 1';
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

      if (rate) {
        // Update
        const updateDto: UpdateShippingRateDto = {
          carrier_id: parseInt(formData.carrier_id),
          zone_id: parseInt(formData.zone_id),
          name: formData.name.trim(),
          min_weight: parseFloat(formData.min_weight),
          max_weight: formData.max_weight ? parseFloat(formData.max_weight) : null,
          base_fee: parseFloat(formData.base_fee),
          fee_per_kg: parseFloat(formData.fee_per_kg),
          estimated_days: parseInt(formData.estimated_days),
          priority: parseInt(formData.priority),
          is_active: formData.is_active,
        };

        await shippingRatesService.updateRate(rate.id, updateDto);
        alert('Cập nhật bảng giá thành công!');
      } else {
        // Create
        const createDto: CreateShippingRateDto = {
          carrier_id: parseInt(formData.carrier_id),
          zone_id: parseInt(formData.zone_id),
          name: formData.name.trim(),
          min_weight: parseFloat(formData.min_weight),
          max_weight: formData.max_weight ? parseFloat(formData.max_weight) : null,
          base_fee: parseFloat(formData.base_fee),
          fee_per_kg: parseFloat(formData.fee_per_kg),
          estimated_days: parseInt(formData.estimated_days),
          priority: parseInt(formData.priority),
        };

        await shippingRatesService.createRate(createDto);
        alert('Tạo bảng giá thành công!');
      }

      onSuccess();
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  return (
    <div className="shipping-form-container">
      <div className="modal-header">
        <h3>{rate ? 'Cập nhật Bảng giá' : 'Thêm Bảng giá mới'}</h3>
        <button className="modal-close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="shipping-form">
        <div className="form-row">
          <div className="form-group">
            <label>
              Đơn vị vận chuyển <span className="required">*</span>
            </label>
            <select
              value={formData.carrier_id}
              onChange={(e) => setFormData({ ...formData, carrier_id: e.target.value })}
              className={errors.carrier_id ? 'error' : ''}
              required
            >
              <option value="">Chọn đơn vị vận chuyển</option>
              {carriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.carrier_id && (
              <span className="error-message">{errors.carrier_id}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Khu vực <span className="required">*</span>
            </label>
            <select
              value={formData.zone_id}
              onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
              className={errors.zone_id ? 'error' : ''}
              required
            >
              <option value="">Chọn khu vực</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
            {errors.zone_id && <span className="error-message">{errors.zone_id}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>
            Tên bảng giá <span className="required">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={errors.name ? 'error' : ''}
            placeholder="VD: Giao hàng tiêu chuẩn"
            required
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Trọng lượng tối thiểu (kg) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.min_weight}
              onChange={(e) => setFormData({ ...formData, min_weight: e.target.value })}
              className={errors.min_weight ? 'error' : ''}
              required
            />
            {errors.min_weight && (
              <span className="error-message">{errors.min_weight}</span>
            )}
          </div>

          <div className="form-group">
            <label>Trọng lượng tối đa (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.max_weight}
              onChange={(e) => setFormData({ ...formData, max_weight: e.target.value })}
              className={errors.max_weight ? 'error' : ''}
              placeholder="Để trống = không giới hạn"
            />
            {errors.max_weight && (
              <span className="error-message">{errors.max_weight}</span>
            )}
            <small className="text-muted">Để trống nếu không giới hạn</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Phí cơ bản (₫) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.base_fee}
              onChange={(e) => setFormData({ ...formData, base_fee: e.target.value })}
              className={errors.base_fee ? 'error' : ''}
              required
            />
            {errors.base_fee && <span className="error-message">{errors.base_fee}</span>}
          </div>

          <div className="form-group">
            <label>
              Phí mỗi kg (₫) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.fee_per_kg}
              onChange={(e) => setFormData({ ...formData, fee_per_kg: e.target.value })}
              className={errors.fee_per_kg ? 'error' : ''}
              required
            />
            {errors.fee_per_kg && <span className="error-message">{errors.fee_per_kg}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Thời gian ước tính (ngày) <span className="required">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.estimated_days}
              onChange={(e) => setFormData({ ...formData, estimated_days: e.target.value })}
              className={errors.estimated_days ? 'error' : ''}
              required
            />
            {errors.estimated_days && (
              <span className="error-message">{errors.estimated_days}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Độ ưu tiên <span className="required">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className={errors.priority ? 'error' : ''}
              required
            />
            {errors.priority && <span className="error-message">{errors.priority}</span>}
            <small className="text-muted">Số nhỏ hơn = ưu tiên cao hơn</small>
          </div>
        </div>

        {rate && (
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
            {submitting ? 'Đang xử lý...' : rate ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}




