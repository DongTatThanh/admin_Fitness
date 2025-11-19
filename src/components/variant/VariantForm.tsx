import React, { useState, useEffect } from 'react';
import { variantService, type ProductVariant } from '../../services/variant.service';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getImageUrl } from '../../lib/api_client';

interface VariantFormProps {
  productId: number;
  variant?: ProductVariant;
  onSuccess: () => void;
  onCancel: () => void;
}

const VariantForm: React.FC<VariantFormProps> = ({ productId, variant, onSuccess, onCancel }) => {
  const { uploading, uploadImage } = useImageUpload();
  
  const [formData, setFormData] = useState({
    variantName: '',
    sku: '',
    price: '',
    comparePrice: '',
    quantity: '',
    status: 'active' as 'active' | 'inactive',
    flavor: '',
    size: '',
    color: '',
    weight: '',
    weight_unit: 'g',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (variant) {
      setFormData({
        variantName: variant.variant_name || '',
        sku: variant.sku || '',
        price: variant.price.toString(),
        comparePrice: variant.compare_price?.toString() || '',
        quantity: variant.inventory_quantity.toString(),
        status: variant.is_active ? 'active' : 'inactive',
        flavor: variant.flavor || '',
        size: variant.size || '',
        color: variant.color || '',
        weight: variant.weight || '',
        weight_unit: variant.weight_unit || 'g',
      });
      if (variant.image_url) {
        setImagePreview(getImageUrl(variant.image_url));
      }
    }
  }, [variant]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tạo blob URL để preview ngay lập tức
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
    setImageFile(file);
    setUploadStatus('idle');
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
    setImageFile(null);
    setUploadStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.variantName.trim()) {
      alert('Vui lòng nhập tên variant');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Vui lòng nhập giá bán hợp lệ');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      setSubmitting(true);

      let imageUrl = variant?.image_url || '';

      // Upload ảnh nếu có ảnh mới
      if (imageFile) {
        setUploadStatus('uploading');
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult;
        setUploadStatus('uploaded');
        
        // Cập nhật preview với URL từ server
        if (imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(getImageUrl(imageUrl));
      }

      // Gọi API thêm hoặc sửa
      if (variant) {
        // Chuẩn bị dữ liệu cho update - chuyển sang snake_case cho backend
        const updateDto = {
          variant_name: formData.variantName.trim(),
          sku: formData.sku.trim() || undefined,
          price: parseFloat(formData.price),
          compare_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
          quantity: parseInt(formData.quantity),
          image: imageUrl || undefined,
          status: formData.status,
          attribute_values: {
            flavor: formData.flavor.trim() || undefined,
            size: formData.size.trim() || undefined,
            color: formData.color.trim() || undefined,
            weight: formData.weight.trim() || undefined,
            weight_unit: formData.weight_unit || undefined,
          },
        };
        await variantService.updateVariant(variant.id, updateDto as any);
        alert('Cập nhật variant thành công!');
      } else {
        // Chuẩn bị dữ liệu cho create - chuyển sang snake_case cho backend
        const createDto = {
          variant_name: formData.variantName.trim(),
          sku: formData.sku.trim() || undefined,
          price: parseFloat(formData.price),
          compare_price: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
          quantity: parseInt(formData.quantity),
          image: imageUrl || undefined,
          status: formData.status,
          attribute_values: {
            flavor: formData.flavor.trim() || undefined,
            size: formData.size.trim() || undefined,
            color: formData.color.trim() || undefined,
            weight: formData.weight.trim() || undefined,
            weight_unit: formData.weight_unit || undefined,
          },
        };
        await variantService.addProductVariant(productId, createDto as any);
        alert('Thêm variant thành công!');
      }

      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
      setUploadStatus('idle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="variant-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h4>Thông tin cơ bản</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label>
              Tên variant <span className="required">*</span>
            </label>
            <input
              type="text"
              name="variantName"
              value={formData.variantName}
              onChange={handleInputChange}
              placeholder="VD: Vị Chocolate - Size L"
              required
            />
          </div>

          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="Mã SKU (tùy chọn)"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Giá bán (VNĐ) <span className="required">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="form-group">
            <label>Giá so sánh (VNĐ)</label>
            <input
              type="number"
              name="comparePrice"
              value={formData.comparePrice}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="1000"
            />
            <span className="hint">Giá gốc để hiển thị % giảm</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Số lượng tồn kho <span className="required">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng bán</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Thuộc tính</h4>
        
        <div className="form-row">
          <div className="form-group">
            <label>Hương vị</label>
            <input
              type="text"
              name="flavor"
              value={formData.flavor}
              onChange={handleInputChange}
              placeholder="VD: Chocolate, Vanilla"
            />
          </div>

          <div className="form-group">
            <label>Size</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="VD: S, M, L, XL"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Màu sắc</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="VD: Đỏ, Xanh"
            />
          </div>

          <div className="form-group">
            <label>Trọng lượng</label>
            <div className="input-group">
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="0"
                style={{ width: '60%' }}
              />
              <select
                name="weight_unit"
                value={formData.weight_unit}
                onChange={handleInputChange}
                style={{ width: '38%', marginLeft: '2%' }}
              >
                <option value="g">gram (g)</option>
                <option value="kg">kilogram (kg)</option>
                <option value="mg">milligram (mg)</option>
                <option value="lb">pound (lb)</option>
                <option value="oz">ounce (oz)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h4>Hình ảnh</h4>
        
        <div className="image-upload-area">
          {imagePreview ? (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              {uploadStatus === 'uploading' && (
                <div className="upload-overlay">
                  <div className="loading-spinner"></div>
                  <p>Đang upload...</p>
                </div>
              )}
              {uploadStatus === 'uploaded' && (
                <div className="upload-badge success">✓ Đã upload</div>
              )}
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
                disabled={uploading}
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
              <div className="upload-placeholder">
                <span className="upload-icon"></span>
                <p>Chọn ảnh variant</p>
                <span className="hint">Tùy chọn</span>
              </div>
            </label>
          )}
        </div>
      </div>

      <div className="form-footer">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={submitting}>
          Hủy
        </button>
        <button type="submit" className="btn-submit" disabled={submitting || uploading}>
          {submitting ? (
            <>
              <span className="loading-spinner-small"></span> Đang xử lý...
            </>
          ) : variant ? (
            'Cập nhật'
          ) : (
            'Thêm variant'
          )}
        </button>
      </div>
    </form>
  );
};

export default VariantForm;
