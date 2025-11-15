import { useState } from 'react';
import '../../styles/Products.css';

export default function ProductAdd() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    stock: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add product:', formData);
  };

  return (
    <div className="product-add">
      <div className="page-header">
        <h2>Thêm sản phẩm mới</h2>
      </div>
      
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="form-group">
              <label>Danh mục *</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Chọn danh mục</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nhãn hàng *</label>
              <select 
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                required
              >
                <option value="">Chọn nhãn hàng</option>
              </select>
            </div>

            <div className="form-group">
              <label>Giá (VNĐ) *</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả sản phẩm"
              rows={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số lượng tồn kho *</label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="active">Kích hoạt</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <input type="file" accept="image/*" multiple />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">Thêm sản phẩm</button>
            <button type="button" className="btn-secondary">Hủy bỏ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
