import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Vouchers.css';
import { voucherService, type Voucher, type CreateVoucherDto, type DiscountType, type ApplicableType } from '../../services/voucher.service';
import { productsService, type Product } from '../../services/products.service';
import { categoriesService, type Category } from '../../services/categories.service';
import { brandService, type Brand } from '../../services/brand.service';
import { useImageUpload } from '../../hooks/useImageUpload';
import { getImageUrl } from '../../lib/api_client';

export default function VoucherForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingVoucher = location.state?.voucher as Voucher | undefined;
  const { uploadImage, uploading } = useImageUpload();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage' as DiscountType,
    discount_value: '',
    max_discount_amount: '',
    min_order_value: '',
    usage_limit: '',
    usage_limit_per_customer: '',
    start_date: '',
    end_date: '',
    applicable_type: 'all' as ApplicableType,
    applicable_ids: [] as number[],
    image_url: '',
    is_active: true,
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle');

  useEffect(() => {
    loadData();
    if (editingVoucher) {
      setFormData({
        code: editingVoucher.code,
        name: editingVoucher.name,
        description: editingVoucher.description || '',
        discount_type: editingVoucher.type,
        discount_value: editingVoucher.value,
        max_discount_amount: editingVoucher.maximum_discount_amount || '',
        min_order_value: editingVoucher.minimum_order_amount?.toString() || '',
        usage_limit: editingVoucher.usage_limit?.toString() || '',
        usage_limit_per_customer: editingVoucher.usage_limit_per_customer?.toString() || '',
        start_date: editingVoucher.start_date.split('T')[0],
        end_date: editingVoucher.end_date.split('T')[0],
        applicable_type: editingVoucher.applicable_to as ApplicableType,
        applicable_ids: editingVoucher.applicable_items || [],
        image_url: editingVoucher.image || '',
        is_active: editingVoucher.is_active === 1,
      });
      if (editingVoucher.image) {
        setImagePreview(getImageUrl(editingVoucher.image));
      }
    }
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        productsService.getAdminProducts({ page: 1, limit: 100 }),
        categoriesService.getAllCategoriesAdmin({ page: 1, limit: 100 }),
        brandService.getAdminBrands({ page: 1, limit: 100 }),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    setFormData((prev) => ({ ...prev, image_url: '' }));
  };

  const handleApplicableIdsChange = (id: number) => {
    setFormData((prev) => {
      const ids = prev.applicable_ids.includes(id)
        ? prev.applicable_ids.filter((i) => i !== id)
        : [...prev.applicable_ids, id];
      return { ...prev, applicable_ids: ids };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim()) {
      alert('Vui lòng nhập mã voucher');
      return;
    }
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên voucher');
      return;
    }
    if (!formData.discount_value || parseFloat(formData.discount_value) <= 0) {
      alert('Vui lòng nhập giá trị giảm hợp lệ');
      return;
    }
    if (!formData.start_date || !formData.end_date) {
      alert('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    try {
      setLoading(true);

      let imageUrl = formData.image_url;

      // Upload ảnh nếu có
      if (imageFile) {
        setUploadStatus('uploading');
        const uploadResult = await uploadImage(imageFile);
        imageUrl = uploadResult;
        setUploadStatus('uploaded');
      }

      const voucherData: CreateVoucherDto = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        discount_type: formData.discount_type, // DTO field name
        discount_value: parseFloat(formData.discount_value), // DTO field name
        max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : undefined,
        min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : undefined, // DTO field name
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
        usage_limit_per_customer: formData.usage_limit_per_customer ? parseInt(formData.usage_limit_per_customer) : undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        applicable_type: formData.applicable_type, // DTO field name
        applicable_items: formData.applicable_ids.length > 0 ? formData.applicable_ids : undefined,
        image_url: imageUrl || undefined, // DTO field name
        is_active: formData.is_active,
      };

      if (editingVoucher) {
        await voucherService.updateVoucher(editingVoucher.id, voucherData);
        alert('Cập nhật voucher thành công!');
      } else {
        await voucherService.createVoucher(voucherData);
        alert('Tạo voucher thành công!');
      }

      navigate('/vouchers/list');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
      setUploadStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const getApplicableOptions = () => {
    if (formData.applicable_type === 'products') return products;
    if (formData.applicable_type === 'categories') return categories;
    if (formData.applicable_type === 'brands') return brands;
    return [];
  };

  return (
    <div className="voucher-form-page">
      <div className="page-header">
        <h2>{editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}</h2>
      </div>

      <form className="voucher-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Thông tin cơ bản</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Mã voucher <span className="required">*</span></label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={(e) => {
                  // Tự động loại bỏ khoảng trắng, chuyển thành chữ hoa, chỉ giữ chữ cái, số, gạch ngang, gạch dưới
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                  setFormData((prev) => ({ ...prev, code: value }));
                }}
                placeholder="VD: GIAMGIA50K"
                required
                style={{ textTransform: 'uppercase' }}
              />
              <span className="hint">Chỉ chữ HOA, số, gạch ngang (-), gạch dưới (_)</span>
            </div>

            <div className="form-group">
              <label>Tên voucher <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Giảm 50K cho đơn từ 500K"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết voucher"
              rows={3}
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Giá trị giảm giá</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Loại giảm <span className="required">*</span></label>
              <select name="discount_type" value={formData.discount_type} onChange={handleInputChange}>
                <option value="percentage">Phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
                <option value="free_shipping">Miễn phí vận chuyển</option>
              </select>
            </div>

            <div className="form-group">
              <label>Giá trị giảm <span className="required">*</span></label>
              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleInputChange}
                placeholder={formData.discount_type === 'percentage' ? '0-100' : '0'}
                min="0"
                max={formData.discount_type === 'percentage' ? '100' : undefined}
                step={formData.discount_type === 'percentage' ? '1' : '1000'}
                required
              />
              <span className="hint">
                {formData.discount_type === 'percentage' ? 'Phần trăm (0-100%)' : 'Số tiền (VNĐ)'}
              </span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giảm tối đa</label>
              <input
                type="number"
                name="max_discount_amount"
                value={formData.max_discount_amount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
              />
              <span className="hint">Áp dụng cho giảm theo %, để trống = không giới hạn</span>
            </div>

            <div className="form-group">
              <label>Giá trị đơn tối thiểu</label>
              <input
                type="number"
                name="min_order_value"
                value={formData.min_order_value}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
              />
              <span className="hint">Đơn hàng tối thiểu để áp dụng voucher</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Giới hạn sử dụng</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Số lần sử dụng tổng</label>
              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleInputChange}
                placeholder="Để trống = không giới hạn"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Số lần dùng/khách hàng</label>
              <input
                type="number"
                name="usage_limit_per_customer"
                value={formData.usage_limit_per_customer}
                onChange={handleInputChange}
                placeholder="Để trống = không giới hạn"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Thời gian áp dụng</h4>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu <span className="required">*</span></label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc <span className="required">*</span></label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Áp dụng cho</h4>

          <div className="form-group">
            <label>Loại áp dụng <span className="required">*</span></label>
            <select name="applicable_type" value={formData.applicable_type} onChange={handleInputChange}>
              <option value="all">Tất cả sản phẩm</option>
              <option value="products">Sản phẩm cụ thể</option>
              <option value="categories">Danh mục cụ thể</option>
              <option value="brands">Thương hiệu cụ thể</option>
            </select>
          </div>

          {formData.applicable_type !== 'all' && (
            <div className="form-group">
              <label>Chọn {formData.applicable_type === 'products' ? 'sản phẩm' : formData.applicable_type === 'categories' ? 'danh mục' : 'thương hiệu'}</label>
              <div className="checkbox-list">
                {getApplicableOptions().map((item) => (
                  <label key={item.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={formData.applicable_ids.includes(item.id)}
                      onChange={() => handleApplicableIdsChange(item.id)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                <div className="upload-placeholder">
                  <span className="upload-icon"></span>
                  <p>Chọn ảnh voucher</p>
                  <span className="hint">Tùy chọn</span>
                </div>
              </label>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
              />
              <span>Kích hoạt voucher ngay</span>
            </label>
          </div>
        </div>

        <div className="form-footer">
          <button type="button" className="btn-cancel" onClick={() => navigate('/vouchers/list')} disabled={loading}>
            Hủy
          </button>
          <button type="submit" className="btn-submit" disabled={loading || uploading}>
            {loading ? (
              <>
                <span className="loading-spinner-small"></span> Đang xử lý...
              </>
            ) : editingVoucher ? (
              'Cập nhật'
            ) : (
              'Tạo voucher'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
