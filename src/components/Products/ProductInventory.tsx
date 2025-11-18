import { useState, useEffect } from 'react';
import '../../styles/Products.css';
import { productsService, type Product } from '../../services/products.service';
import { getImageUrl } from '../../lib/api_client';
import VariantManagement from '../variant/VariantManagement';

export default function ProductInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.getAdminProducts({ page: 1, limit: 100 });
      setProducts(response.data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageVariants = (productId: number) => {
    setSelectedProductId(productId);
    setShowVariantModal(true);
  };

  return (
    <div className="product-inventory">
      <div className="page-header">
        <div>
          <h2>Quản lý biến thể của sản phẩm</h2>
         
        </div>
      </div>
    
    
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="content-card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => {
                    const stock = product.inventory_quantity ?? product.quantity ?? 0;
                    return (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td>
                          {product.featured_image ? (
                            <img
                              src={getImageUrl(product.featured_image)}
                              alt={product.name}
                              className="product-thumb"
                            />
                          ) : (
                            <span className="no-logo"></span>
                          )}
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                        </td>
                        <td>{product.sku || '-'}</td>
                        <td>
                          <span
                            className={`stock-badge ${
                              stock > 10 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock'
                            }`}
                          >
                            {stock}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${product.status === 'active' ? 'active' : 'inactive'}`}>
                            {product.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => handleManageVariants(product.id)}
                            title="Quản lý variants"
                          >
                            🔧 Variants
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      Chưa có sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showVariantModal && selectedProductId && (
        <div className="modal-overlay" onClick={() => setShowVariantModal(false)}>
          <div className="modal variant-management-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quản lý Variants - Sản phẩm #{selectedProductId}</h3>
              <button className="close-btn" onClick={() => setShowVariantModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <VariantManagement productId={selectedProductId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
