import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Products.css';
import { productsService, type Product } from '../../services/products.service';
import { categoriesService, type Category } from '../../services/categories.service';
import { brandService, type Brand } from '../../services/brand.service';
import { getImageUrl } from '../../lib/api_client';
import useImageUpload, { useMultipleImageUpload } from '../../hooks/useImageUpload';

type ModalMode = 'view' | 'edit' | 'delete';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [brandFilter, setBrandFilter] = useState<number | ''>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    slug: '',
    sku: '',
    price: '',
    compare_price: '',
    quantity: '',
    status: 'active' as 'active' | 'inactive',
    category_id: '' as number | '',
    brand_id: '' as number | '',
    featured_image: '',
    gallery_images: [] as string[],
    short_description: '',
    description: '',
  });
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const { uploadImage, uploading: uploadingImage, error: uploadError, resetError } = useImageUpload();
  const { 
    uploadMultipleImages, 
    uploading: uploadingGallery, 
    error: galleryError, 
    progress: uploadProgress 
  } = useMultipleImageUpload();

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '0 ₫';
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsService.getAdminProducts({
        page: currentPage,
        limit,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        brand_id: brandFilter || undefined,
      });
      setProducts(response.data);
      setTotalPages(response.pages);
      setTotalProducts(response.total);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadFiltersData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        categoriesService.getAllCategoriesAdmin({ page: 1, limit: 100 }),
        brandService.getAdminBrands({ page: 1, limit: 100 }),
      ]);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (err) {
      console.error('Error loading categories/brands:', err);
    }
  };

  useEffect(() => {
    loadFiltersData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, limit, statusFilter, categoryFilter, brandFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadProducts();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleViewProduct = async (productId: number) => {
    try {
      const product = await productsService.getProductById(productId);
      setSelectedProduct(product);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading product:', err);
      alert('Không thể tải chi tiết sản phẩm');
    }
  };

  const handleEditProduct = async (productId: number) => {
    try {
      const product = await productsService.getProductById(productId);
      setSelectedProduct(product);
      setEditForm({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price?.toString() ?? '',
        compare_price: product.compare_price?.toString() ?? '',
        quantity: (product.inventory_quantity ?? product.quantity)?.toString() ?? '',
        status: product.status || 'active',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        featured_image: product.featured_image || '',
        gallery_images: product.gallery_images || [],
        short_description: product.short_description || '',
        description: product.description || '',
      });
      setEditImagePreview(product.featured_image || null);
      setGalleryPreviews(product.gallery_images || []);
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading product:', err);
      alert('Không thể tải thông tin sản phẩm');
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct) return;

    const updateData = {
      name: editForm.name || undefined,
      slug: editForm.slug || undefined,
      sku: editForm.sku || undefined,
      price: editForm.price ? Number(editForm.price) : undefined,
      compare_price: editForm.compare_price ? Number(editForm.compare_price) : undefined,
      quantity: editForm.quantity ? Number(editForm.quantity) : undefined,
      status: editForm.status,
      category_id: editForm.category_id || undefined,
      brand_id: editForm.brand_id || undefined,
      featured_image: editForm.featured_image || undefined,
      gallery_images: editForm.gallery_images.length > 0 ? editForm.gallery_images : undefined,
      short_description: editForm.short_description || undefined,
      description: editForm.description || undefined,
    };

    try {
      const response = await productsService.updateProduct(selectedProduct.id, updateData);
      alert(response.message || 'Cập nhật sản phẩm thành công');
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      console.error('Error updating product:', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật sản phẩm'}`);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    try {
      const response = await productsService.deleteProduct(selectedProduct.id);
      alert(response?.message || 'Xóa sản phẩm thành công');
      setShowModal(false);
      loadProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      alert(`Lỗi: ${err.message || 'Không thể xóa sản phẩm'}`);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await productsService.updateProduct(product.id, {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: product.price ?? 0,
        compare_price: product.compare_price ?? undefined,
        quantity: product.inventory_quantity ?? product.quantity ?? 0,
        status: product.status === 'active' ? 'inactive' : 'active',
        category_id: product.category_id,
        brand_id: product.brand_id,
        featured_image: product.featured_image,
        short_description: product.short_description,
        description: product.description,
        is_featured: product.is_featured,
      });
      loadProducts();
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert(`Lỗi: ${err.message || 'Không thể cập nhật trạng thái'}`);
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    resetError();
    const preview = URL.createObjectURL(file);
    setEditImagePreview(preview);
    try {
      const uploadedUrl = await uploadImage(file);
      setEditForm((prev) => ({ ...prev, featured_image: uploadedUrl }));
      setEditImagePreview(uploadedUrl);
    } catch {
      setEditImagePreview(selectedProduct?.featured_image || null);
    }
  };

  const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const uploadedUrls = await uploadMultipleImages(fileArray);
      
      setEditForm((prev) => ({ 
        ...prev, 
        gallery_images: [...prev.gallery_images, ...uploadedUrls] 
      }));
      setGalleryPreviews((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('Error uploading gallery images:', err);
      alert('Lỗi khi upload ảnh gallery');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="product-list">
      <div className="page-header">
        <div>
          <h2>📦 Quản lý sản phẩm</h2>
          <p>Tổng số: {totalProducts} sản phẩm</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/products/add')}>
          ➕ Thêm sản phẩm mới
        </button>
      </div>
      
      <div className="filters">
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm..." 
          className="search-input" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cate) => (
            <option key={cate.id} value={cate.id}>{cate.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value ? Number(e.target.value) : '')}
        >
          <option value="">Tất cả nhãn hàng</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
        <select 
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Tạm ngưng</option>
        </select>
        <select 
          className="filter-select"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="10">10 / trang</option>
          <option value="20">20 / trang</option>
          <option value="50">50 / trang</option>
          <option value="100">100 / trang</option>
        </select>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadProducts}>Thử lại</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="content-card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Nhãn hàng</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                <tbody>
                  {products.length ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>#{product.id}</td>
                        <td>
                          {product.featured_image ? (
                            <img 
                              src={getImageUrl(product.featured_image)} 
                              alt={product.name} 
                              className="product-thumb"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <span className={`no-logo ${product.featured_image ? 'hidden' : ''}`}></span>
                        </td>
                        <td>
                          <strong>{product.name}</strong>
                          <div className="sub-info">SKU: {product.sku}</div>
                        </td>
                        <td>{product.category?.name || '-'}</td>
                        <td>{product.brand?.name || '-'}</td>
                        <td>
                          {formatCurrency(product.price)}
                          {product.compare_price && (
                            <div className="sub-info old-price">{formatCurrency(product.compare_price)}</div>
                          )}
                        </td>
                        <td>{product.inventory_quantity ?? product.quantity ?? 0}</td>
                        <td>
                          <span className={`status-badge ${product.status === 'active' ? 'active' : 'inactive'}`}>
                            {product.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-action btn-view" 
                              onClick={() => handleViewProduct(product.id)}
                              title="Xem chi tiết"
                            >
                              👁️
                            </button>
                            <button 
                              className="btn-action btn-edit"
                              onClick={() => handleEditProduct(product.id)}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>
                            <button 
                              className="btn-action btn-status"
                              onClick={() => handleToggleStatus(product)}
                              title={product.status === 'active' ? 'Tạm ngưng' : 'Kích hoạt'}
                            >
                              {product.status === 'active' ? '⏸️' : '▶️'}
                            </button>
                            <button 
                              className="btn-action btn-delete"
                              onClick={() => handleDeleteProduct(product)}
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="empty-state">
                        Chưa có sản phẩm nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Trước
            </button>

            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>

            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Sau →
            </button>
          </div>
        </>
      )}

      {showModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            {modalMode === 'view' && (
              <>
                <div className="modal-header">
                  <h2>Chi tiết sản phẩm</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  {selectedProduct.featured_image && (
                    <div className="info-row">
                      <span className="info-label">Ảnh đại diện:</span>
                      <img src={getImageUrl(selectedProduct.featured_image)} alt={selectedProduct.name} className="product-image-large" />
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{selectedProduct.id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tên:</span>
                    <span className="info-value">{selectedProduct.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Slug:</span>
                    <span className="info-value"><code>{selectedProduct.slug}</code></span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">SKU:</span>
                    <span className="info-value">{selectedProduct.sku}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Danh mục:</span>
                    <span className="info-value">{selectedProduct.category?.name || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nhãn hàng:</span>
                    <span className="info-value">{selectedProduct.brand?.name || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Giá:</span>
                    <span className="info-value">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                  {selectedProduct.compare_price && (
                    <div className="info-row">
                      <span className="info-label">Giá so sánh:</span>
                      <span className="info-value">{formatCurrency(selectedProduct.compare_price)}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Tồn kho:</span>
                    <span className="info-value">{selectedProduct.inventory_quantity ?? selectedProduct.quantity ?? 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Trạng thái:</span>
                    <span className={`status-badge ${selectedProduct.status === 'active' ? 'active' : 'inactive'}`}>
                      {selectedProduct.status === 'active' ? 'Hoạt động' : 'Tạm ngưng'}
                    </span>
                  </div>
                  {selectedProduct.short_description && (
                    <div className="info-row">
                      <span className="info-label">Mô tả ngắn:</span>
                      <span className="info-value">{selectedProduct.short_description}</span>
                    </div>
                  )}
                  {selectedProduct.description && (
                    <div className="info-row">
                      <span className="info-label">Mô tả chi tiết:</span>
                      <span className="info-value">{selectedProduct.description}</span>
                    </div>
                  )}
                  {selectedProduct.gallery_images && selectedProduct.gallery_images.length > 0 && (
                    <div className="info-row">
                      <span className="info-label">Gallery ảnh:</span>
                      <div className="gallery-preview">
                        {selectedProduct.gallery_images.map((url, index) => (
                          <div key={index} className="gallery-item">
                            <img
                              src={getImageUrl(url)}
                              alt={`Gallery ${index + 1}`}
                              className="gallery-thumb"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{formatDate(selectedProduct.created_at)}</span>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Chỉnh sửa sản phẩm</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tên sản phẩm</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Slug</label>
                      <input
                        type="text"
                        value={editForm.slug}
                        onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>SKU</label>
                      <input
                        type="text"
                        value={editForm.sku}
                        onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Giá bán</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Giá so sánh</label>
                      <input
                        type="number"
                        value={editForm.compare_price}
                        onChange={(e) => setEditForm({ ...editForm, compare_price: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tồn kho</label>
                      <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Danh mục</label>
                      <select
                        value={editForm.category_id}
                        onChange={(e) => setEditForm({ ...editForm, category_id: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Chưa chọn</option>
                        {categories.map((cate) => (
                          <option key={cate.id} value={cate.id}>{cate.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nhãn hàng</label>
                      <select
                        value={editForm.brand_id}
                        onChange={(e) => setEditForm({ ...editForm, brand_id: e.target.value ? Number(e.target.value) : '' })}
                      >
                        <option value="">Chưa chọn</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Trạng thái</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'active' | 'inactive' })}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm ngưng</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Mô tả ngắn</label>
                    <textarea
                      rows={2}
                      value={editForm.short_description}
                      onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả chi tiết</label>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ảnh đại diện</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <small className="form-hint">Đang tải ảnh...</small>}
                    {uploadError && <small style={{ color: '#e74c3c' }}>{uploadError}</small>}
                    {editImagePreview && (
                      <div style={{ marginTop: '10px' }}>
                        <img
                          src={editImagePreview.startsWith('blob:') ? editImagePreview : getImageUrl(editImagePreview)}
                          alt="Preview"
                          className="product-image-preview"
                        />
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Gallery ảnh (nhiều ảnh)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesChange}
                      disabled={uploadingGallery}
                    />
                    {uploadingGallery && (
                      <small className="form-hint">
                        Đang tải ảnh... {uploadProgress}%
                      </small>
                    )}
                    {galleryError && <small style={{ color: '#e74c3c' }}>{galleryError}</small>}
                    {galleryPreviews.length > 0 && (
                      <div className="gallery-preview">
                        {galleryPreviews.map((url, index) => (
                          <div key={index} className="gallery-item">
                            <img
                              src={url.startsWith('blob:') ? url : getImageUrl(url)}
                              alt={`Gallery ${index + 1}`}
                              className="gallery-thumb"
                            />
                            <button
                              type="button"
                              className="gallery-remove"
                              onClick={() => handleRemoveGalleryImage(index)}
                              title="Xóa ảnh này"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit} disabled={uploadingImage || uploadingGallery}>
                    {uploadingImage || uploadingGallery ? 'Đang tải ảnh...' : '💾 Lưu thay đổi'}
                  </button>
                </div>
              </>
            )}

            {modalMode === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>Xác nhận xóa</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="delete-warning">
                    Bạn có chắc chắn muốn xóa sản phẩm <strong>{selectedProduct.name}</strong>?
                  </p>
                  <p className="delete-note">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                  <button className="btn-delete-confirm" onClick={confirmDelete}>Xóa</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
