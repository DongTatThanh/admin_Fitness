import React, { useState, useEffect } from 'react';
import { variantService, type ProductVariant } from '../../services/variant.service';
import { getImageUrl } from '../../lib/api_client';

interface VariantListProps {
  productId: number;
  onEdit: (variant: ProductVariant) => void;
}

const VariantList: React.FC<VariantListProps> = ({ productId, onEdit }) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const result = await variantService.getProductVariants(productId);
      setVariants(result.data);
    } catch (error: any) {
      alert(error.message || 'Không thể tải danh sách variants');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId: number) => {
    try {
      await variantService.deleteVariant(variantId);
      alert('Xóa variant thành công!');
      loadVariants();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa variant');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải variants...</p>
      </div>
    );
  }

  return (
    <div className="variants-container">
      <div className="variants-header">
        <h3>Danh sách Variants</h3>
        <span className="variant-count">{variants.length} variants</span>
      </div>

      {variants.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có variant nào cho sản phẩm này</p>
        </div>
      ) : (
        <div className="variants-table-wrapper">
          <table className="variants-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên variant</th>
                <th>SKU</th>
                <th>Thuộc tính</th>
                <th>Giá bán</th>
                <th>Giá so sánh</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>
                    {variant.image_url ? (
                      <img
                        src={getImageUrl(variant.image_url)}
                        alt={variant.variant_name}
                        className="variant-image"
                      />
                    ) : (
                      <div className="no-image">Chưa có ảnh</div>
                    )}
                  </td>
                  <td className="variant-name">{variant.variant_name}</td>
                  <td className="variant-sku">{variant.sku || '-'}</td>
                  <td>
                    <div className="attribute-tags">
                      {variant.flavor && <span className="tag">Vị: {variant.flavor}</span>}
                      {variant.size && <span className="tag">Size: {variant.size}</span>}
                      {variant.color && <span className="tag">Màu: {variant.color}</span>}
                      {variant.weight && (
                        <span className="tag">
                          Trọng lượng: {variant.weight} {variant.weight_unit}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="price">{formatPrice(variant.price)}</td>
                  <td className="compare-price">
                    {variant.compare_price ? formatPrice(variant.compare_price) : '-'}
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${
                        variant.inventory_quantity > 10
                          ? 'in-stock'
                          : variant.inventory_quantity > 0
                          ? 'low-stock'
                          : 'out-of-stock'
                      }`}
                    >
                      {variant.inventory_quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${variant.is_active ? 'active' : 'inactive'}`}>
                      {variant.is_active ? 'Hoạt động' : 'Ngừng bán'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => onEdit(variant)} title="Chỉnh sửa">
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(variant.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="close-btn" onClick={() => setDeleteConfirm(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa variant này?</p>
              <p className="warning">Hành động này không thể hoàn tác!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm)}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantList;
