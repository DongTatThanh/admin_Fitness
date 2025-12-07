import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/UserCreate.css';
import { apiClient } from '../../lib/api_client';

export default function UserCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    role_id: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.username.trim()) {
      alert('Vui lòng nhập tên đăng nhập');
      return;
    }
    
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }
    
    if (!formData.password.trim()) {
      alert('Vui lòng nhập mật khẩu');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Email không đúng định dạng');
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      const newUserData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name || formData.username,
      };
      
      if (formData.phone) newUserData.phone = formData.phone;
      if (formData.address) newUserData.address = formData.address;
      if (formData.role_id) newUserData.role_id = formData.role_id;
      
      console.log('Creating new user:', newUserData);
      
      const response: any = await apiClient.post('/users/admin/createUser', newUserData);
      alert(response.message || 'Thêm người dùng thành công!');
      navigate('/users/list');
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMessage = err.message || 'Không thể thêm người dùng';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-create">
      <div className="page-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/users/list')}>
            ← Quay lại
          </button>
          <h1> Thêm người dùng mới</h1>
        </div>
      </div>

      <div className="content-card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <h3>Thông tin đăng nhập</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  Tên đăng nhập <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>

              <div className="form-group">
                <label>
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email"
                />
              </div>
              
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
              </div>

             
            </div>
          </div>

          <div className="form-section">
            <h3>Thông tin cá nhân</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Nhập họ tên đầy đủ"
                />
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => navigate('/users/list')}
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : ' Thêm người dùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
