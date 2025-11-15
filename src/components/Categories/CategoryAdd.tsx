import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Categories.css';
import { categoriesService } from '../../services/categories.service';

export default function CategoryAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: 0,
    icon: '',
    sort_order: 0,
    status: 'active' as 'active' | 'inactive'
  });

  // Tự động tạo slug từ name
  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    if (!formData.slug.trim()) {
      alert('Vui lòng nhập slug');
      return;
    }

    try {
      setLoading(true);

      const categoryData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        parent_id: formData.parent_id > 0 ? formData.parent_id : undefined,
        icon: formData.icon || undefined,
        sort_order: formData.sort_order,
        status: formData.status
      };

      const response = await categoriesService.createCategory(categoryData);
      alert(response.message || 'Thêm danh mục thành công!');
      navigate('/categories/list');
    } catch (err: any) {
      console.error('Error creating category:', err);
      const errorMessage = err.message || 'Không thể thêm danh mục';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-add">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/categories/list')}>
            ← Quay lại
          </button>
          <h2>Thêm danh mục mới</h2>
        </div>
      </div>
      
      <div className="content-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Tên danh mục <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div className="form-group">
            <label>Slug <span className="required">*</span></label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
              placeholder="slug-danh-muc (tự động tạo)"
            />
            <small className="form-hint">URL thân thiện, tự động tạo từ tên</small>
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả danh mục"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Icon</label>
              <input 
                type="text" 
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="🏋️ hoặc URL icon"
              />
              <small className="form-hint">Emoji hoặc URL hình ảnh</small>
            </div>

            <div className="form-group">
              <label>Thứ tự sắp xếp</label>
              <input 
                type="number" 
                value={formData.sort_order}
                onChange={(e) => setFormData({...formData, sort_order: Number(e.target.value)})}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
            >
              <option value="active">Kích hoạt</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate('/categories/list')}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
