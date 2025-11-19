import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flashSaleService, type FlashSaleProduct, type AddProductToFlashSaleDto } from '../../services/flashsale.service';
import { productsService } from '../../services/products.service';
import '../../styles/FlashSales.css';

interface FlashSaleProductsProps {
  flashSaleId: number;
}

const FlashSaleProducts: React.FC<FlashSaleProductsProps> = ({ flashSaleId }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [flashSaleName, setFlashSaleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FlashSaleProduct | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const limit = 10;

  useEffect(() => {
    loadFlashSaleInfo();
    loadProducts();
  }, [currentPage]);

  const loadFlashSaleInfo = async () => {
    try {
      const response = await flashSaleService.getFlashSaleById(flashSaleId);
      setFlashSaleName(response.name);
    } catch (error: any) {
      alert('Lỗi khi tải thông tin Flash Sale: ' + (error?.message || 'Unknown error'));
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await flashSaleService.getFlashSaleProducts(
        flashSaleId,
        currentPage,
        limit
      );
      setProducts(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      alert('Lỗi khi tải danh sách sản phẩm: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;
    try {
      await flashSaleService.removeProductFromFlashSale(flashSaleId, deleteItemId);
      alert('Xóa sản phẩm khỏi Flash Sale thành công!');
      setShowDeleteModal(false);
      setDeleteItemId(null);
      loadProducts();
    } catch (error: any) {
      alert('Lỗi khi xóa sản phẩm: ' + (error?.message || 'Unknown error'));
    }
  };

  const openDeleteModal = (itemId: number) => {
    setDeleteItemId(itemId);
    setShowDeleteModal(true);
  };

  const handleEdit = (product: FlashSaleProduct) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const goBack = () => {
    navigate('/flash-sales');
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <div className="flashsale-products-container">
      <div className="flashsale-products-header">
        <div>
          <button className="btn-back" onClick={goBack}>
            ← Quay lại
          </button>
          <h2>Sản phẩm trong Flash Sale: {flashSaleName}</h2>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          Thêm sản phẩm
        </button>
      </div>

      <div className="flashsale-table-wrapper">
        <table className="flashsale-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Sản phẩm</th>
              <th>Variant</th>
              <th>Giá gốc</th>
              <th>Giá sale</th>
              <th>Giảm giá</th>
              <th>Số lượng giới hạn</th>
              <th>Đã bán</th>
              <th>Còn lại</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">
                  Chưa có sản phẩm nào trong Flash Sale này
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img
                      src={item.product.image || '/placeholder.png'}
                      alt={item.product.name}
                      className="product-thumbnail"
                    />
                  </td>
                  <td>
                    <div className="product-info">
                      <div className="product-name">{item.product.name}</div>
                      {item.product.brand && (
                        <div className="product-meta">Thương hiệu: {item.product.brand.name}</div>
                      )}
                      {item.product.category && (
                        <div className="product-meta">Danh mục: {item.product.category.name}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    {item.variant ? (
                      <div>
                        <div>{item.variant.variant_name}</div>
                        <div className="product-meta">SKU: {item.variant.sku}</div>
                      </div>
                    ) : (
                      <span className="text-muted">Mặc định</span>
                    )}
                  </td>
                  <td className="price">{formatPrice(item.original_price)}</td>
                  <td className="price sale-price">{formatPrice(item.sale_price)}</td>
                  <td className="text-center">
                    <span className="discount-badge">-{item.discount_percent}%</span>
                  </td>
                  <td className="text-center">
                    {item.max_quantity ? item.max_quantity : <span className="text-muted">Không giới hạn</span>}
                  </td>
                  <td className="text-center">{item.sold_quantity}</td>
                  <td className="text-center">
                    {item.remaining !== null ? (
                      <span className={item.remaining === 0 ? 'text-danger' : ''}>
                        {item.remaining}
                      </span>
                    ) : (
                      <span className="text-muted">∞</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                        title="Sửa"
                      >
                        Sửa
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => openDeleteModal(item.id)}
                        title="Xóa"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Sau
          </button>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa sản phẩm này khỏi Flash Sale?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm sản phẩm vào Flash Sale</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <AddProductForm
              flashSaleId={flashSaleId}
              onSuccess={() => {
                setShowAddModal(false);
                loadProducts();
              }}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cập nhật sản phẩm Flash Sale</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <EditProductForm
              flashSaleId={flashSaleId}
              product={selectedProduct}
              onSuccess={() => {
                setShowEditModal(false);
                loadProducts();
              }}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Add Product Form Component
interface AddProductFormProps {
  flashSaleId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ flashSaleId, onSuccess, onCancel }) => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    variant_id: undefined as number | undefined,
    original_price: '',
    sale_price: '',
    max_quantity: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      loadVariants(selectedProductId);
      loadProductPrice(selectedProductId);
    }
  }, [selectedProductId]);

  const loadAllProducts = async () => {
    try {
      const response = await productsService.getAllProducts(1, 1000);
      console.log('Products loaded:', response);
      setAllProducts(response.data || []);
      if (!response.data || response.data.length === 0) {
        alert('Không có sản phẩm nào. Vui lòng thêm sản phẩm trước khi tạo Flash Sale.');
      }
    } catch (error: any) {
      console.error('Load products error:', error);
      alert('Lỗi khi tải danh sách sản phẩm: ' + (error?.message || 'Unknown error'));
    }
  };

  const loadVariants = async (productId: number) => {
    try {
      const response = await productsService.getProductVariants(productId);
      setVariants(response.data || []);
    } catch (error) {
      // Không có variants hoặc API chưa có - không hiển thị lỗi
      console.log('No variants available for product', productId);
      setVariants([]);
    }
  };

  const loadProductPrice = async (productId: number) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        original_price: product.compare_price || product.price || '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert('Vui lòng chọn sản phẩm');
      return;
    }

    if (!formData.sale_price) {
      alert('Vui lòng nhập giá sale');
      return;
    }

    const salePrice = parseFloat(formData.sale_price);
    const originalPrice = formData.original_price ? parseFloat(formData.original_price) : undefined;

    if (salePrice <= 0) {
      alert('Giá sale phải lớn hơn 0');
      return;
    }

    if (originalPrice && salePrice >= originalPrice) {
      alert('Giá sale phải nhỏ hơn giá gốc');
      return;
    }

    try {
      setSubmitting(true);
      
      // Tạo DTO theo đúng format backend yêu cầu
      const dto: AddProductToFlashSaleDto = {
        product_id: selectedProductId,
        sale_price: salePrice,
      };

      // Chỉ thêm các field optional nếu có giá trị
      if (formData.variant_id) {
        dto.variant_id = formData.variant_id;
      }
      if (originalPrice) {
        dto.original_price = originalPrice;
      }
      if (formData.max_quantity && formData.max_quantity.trim() !== '') {
        dto.max_quantity = parseInt(formData.max_quantity);
      }

      console.log('Sending DTO:', dto);
      const response = await flashSaleService.addProductToFlashSale(flashSaleId, dto);
      console.log('Response:', response);
      
      if (response?.success || response?.data) {
        alert('Thêm sản phẩm vào Flash Sale thành công!');
        onSuccess();
      } else {
        throw new Error(response?.message || 'Không thể thêm sản phẩm');
      }
    } catch (error: any) {
      console.error('Add product error:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
      alert('Lỗi: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flashsale-form">
      <div className="form-group">
        <label>
          Chọn sản phẩm <span className="required">*</span>
        </label>
        <select
          value={selectedProductId || ''}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
          required
        >
          <option value="">-- Chọn sản phẩm --</option>
          {allProducts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {variants.length > 0 && (
        <div className="form-group">
          <label>Chọn variant (tùy chọn)</label>
          <select
            value={formData.variant_id || ''}
            onChange={(e) =>
              setFormData({ ...formData, variant_id: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">-- Mặc định (không chọn variant) --</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.variant_name} - {v.sku}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Giá gốc</label>
          <input
            type="number"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            placeholder="Tự động lấy từ sản phẩm"
            min="0"
            step="1000"
          />
        </div>

        <div className="form-group">
          <label>
            Giá sale <span className="required">*</span>
          </label>
          <input
            type="number"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            placeholder="Giá bán trong Flash Sale"
            min="0"
            step="1000"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Số lượng giới hạn (tùy chọn)</label>
        <input
          type="number"
          value={formData.max_quantity}
          onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
          placeholder="Để trống nếu không giới hạn"
          min="0"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
};

// Edit Product Form Component
interface EditProductFormProps {
  flashSaleId: number;
  product: FlashSaleProduct;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({
  flashSaleId,
  product,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    original_price: product.original_price.toString(),
    sale_price: product.sale_price.toString(),
    max_quantity: product.max_quantity?.toString() || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sale_price) {
      alert('Vui lòng nhập giá sale');
      return;
    }

    const salePrice = parseFloat(formData.sale_price);
    const originalPrice = parseFloat(formData.original_price);

    if (salePrice >= originalPrice) {
      alert('Giá sale phải nhỏ hơn giá gốc');
      return;
    }

    try {
      setSubmitting(true);
      await flashSaleService.updateFlashSaleProduct(flashSaleId, product.id, {
        original_price: originalPrice,
        sale_price: salePrice,
        max_quantity: formData.max_quantity ? parseInt(formData.max_quantity) : undefined,
      });
      alert('Cập nhật sản phẩm thành công!');
      onSuccess();
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flashsale-form">
      <div className="form-group">
        <label>Sản phẩm</label>
        <input type="text" value={product.product.name} disabled />
      </div>

      {product.variant && (
        <div className="form-group">
          <label>Variant</label>
          <input type="text" value={product.variant.variant_name} disabled />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>
            Giá gốc <span className="required">*</span>
          </label>
          <input
            type="number"
            value={formData.original_price}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
            min="0"
            step="1000"
            required
          />
        </div>

        <div className="form-group">
          <label>
            Giá sale <span className="required">*</span>
          </label>
          <input
            type="number"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            min="0"
            step="1000"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Số lượng giới hạn</label>
        <input
          type="number"
          value={formData.max_quantity}
          onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
          placeholder="Để trống nếu không giới hạn"
          min="0"
        />
        <small className="form-hint">Đã bán: {product.sold_quantity}</small>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Hủy
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : 'Cập nhật'}
        </button>
      </div>
    </form>
  );
};

export default FlashSaleProducts;
