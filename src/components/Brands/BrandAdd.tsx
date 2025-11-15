import { useState } from 'react';
import '../../styles/Brands.css';

export default function BrandAdd() {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add brand:', formData);
  };

  return (
    <div className="brand-add">
      <div className="page-header">
        <h2>Thêm nhãn hàng mới</h2>
      </div>
      
      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên nhãn hàng *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Nhập tên nhãn hàng"
              required
            />
          </div>

          <div className="form-group">
            <label>Quốc gia</label>
            <input 
              type="text" 
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              placeholder="Nhập quốc gia"
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả nhãn hàng"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Logo</label>
            <input type="file" accept="image/*" />
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

          <div className="form-actions">
            <button type="submit" className="btn-primary">Thêm nhãn hàng</button>
            <button type="button" className="btn-secondary">Hủy bỏ</button>
          </div>
        </form>
      </div>
    </div>
  );
}
