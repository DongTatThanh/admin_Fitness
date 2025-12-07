import { useState, useEffect } from 'react';
import '../styles/UserManagement.css';
import { userService } from '../services/User.service';
import type { User } from '../services/User.service';

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete'>('view');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    role_id: 3,
  });
  
  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers({
        page: currentPage,
        limit: limit,
        search: search.trim() || undefined,
        sort: sortBy,
      });
      
      setUsers(response.data);
      setTotalPages(response.pages);
      setTotalUsers(response.total);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, [currentPage, limit, sortBy]);
  
  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadUsers();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getRoleName = (roleId?: number) => {
    switch (roleId) {
      case 1: return 'Admin';
      case 2: return 'Nhân viên';
      case 3: return 'Khách hàng';
      default: return 'Khách hàng';
    }
  };
  
  const getTierName = (tierId?: number) => {
    switch (tierId) {
      case 1: return 'Đồng';
      case 2: return 'Bạc';
      case 3: return 'Vàng';
      case 4: return 'Kim cương';
      default: return 'Đồng';
    }
  };
  
  // Xem chi tiết người dùng
  const handleViewUser = async (userId: number) => {
    try {
      const user = await userService.getUserById(userId);
      console.log('Loaded user for view:', user);
      setSelectedUser(user);
      setModalMode('view');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading user:', err);
      alert('Không thể tải thông tin người dùng');
    }
  };
  
  //cập nhật user
  const handleEditUser = async (userId: number) => {
    try {
      const user = await userService.getUserById(userId);
      console.log('Loaded user for edit:', user);
      setSelectedUser(user);
      setEditForm({
        username: user.username,
        full_name: user.full_name || '',
        email: user.email,
        phone: user.phone || '',
        address: (user as any).address || '',
        role_id: user.role_id || 3,
      });
      setModalMode('edit');
      setShowModal(true);
    } catch (err) {
      console.error('Error loading user:', err);
      alert('Không thể tải thông tin người dùng');
    }
  };
  
  // lưu cập nhật user
  const handleSaveEdit = async () => {
    if (!selectedUser) {
      alert('Không có người dùng được chọn');
      return;
    }
    
    // Validate và parse ID
    const userId = Number(selectedUser.user_id || (selectedUser as any).id);
    
    if (!userId || userId <= 0 || isNaN(userId)) {
      console.error('Invalid user ID:', {
        user_id: selectedUser.user_id,
        id: (selectedUser as any).id,
        selectedUser
      });
      alert('ID người dùng không hợp lệ');
      return;
    }
    
    try {
      const updateData = {
        username: editForm.username || undefined,
        fullName: editForm.full_name || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        address: editForm.address || undefined,
        role_id: editForm.role_id,
      };
      
      console.log('Updating user ID:', userId, 'Data:', updateData);
      console.log('Selected user:', selectedUser);
      
      const response = await userService.updateUser(userId, updateData);
      alert(response.message || 'Cập nhật thành công!');
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      console.error('lỗi cập nhật:', err);
      const errorMessage = err.message || 'Không thể cập nhật người dùng';
      alert(`Lỗi: ${errorMessage}`);
    }
  };
  
  // Delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('delete');
    setShowModal(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await userService.deleteUser(selectedUser.user_id);
      alert(response.message || 'Xóa người dùng thành công!');
      setShowModal(false);
      loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Không thể xóa người dùng');
    }
  };
  
  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-left">
          <h1>👥 Quản lý người dùng</h1>
          <p>Tổng số: {totalUsers} người dùng</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon"></span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Mới nhất</option>
            <option value="username">Tên A-Z</option>
            <option value="email">Email A-Z</option>
          </select>
          
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value="10">10 / trang</option>
            <option value="20">20 / trang</option>
            <option value="50">50 / trang</option>
            <option value="100">100 / trang</option>
          </select>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="error-state">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={loadUsers}>Thử lại</button>
        </div>
      )}
      
      {/* Users table */}
      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th>Hạng</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td>#{user.user_id}</td>
                    <td>
                      <div className="username-cell">
                        <span className="username">{user.username}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.full_name || '-'}</td>
                    <td>
                      <span className={`role-badge role-${user.role_id || 3}`}>
                        {getRoleName(user.role_id)}
                      </span>
                    </td>
                    <td>
                      <span className={`tier-badge tier-${user.customer_tier_id || 1}`}>
                        {getTierName(user.customer_tier_id)}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(user.created_at)}</td>
                    <td>
                      <span className={`status-badge ${user.is_active ==1 ? 'active' : 'inactive'}`}>
                        {user.is_active == 0 ? 'Ngừng' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-view" 
                          title="Xem chi tiết"
                          onClick={() => handleViewUser(user.user_id)}
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-action btn-edit" 
                          title="Chỉnh sửa"
                          onClick={() => handleEditUser(user.user_id)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          title="Xóa"
                          onClick={() => handleDeleteUser(user)}
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
          
          {/* Pagination */}
          <div className="pagination">
            <button
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Trước
            </button>
            
            <div className="pagination-info">
              Trang {currentPage} / {totalPages}
            </div>
            
            <button
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau →
            </button>
          </div>
        </>
      )}
      
      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* View Mode */}
            {modalMode === 'view' && (
              <>
                <div className="modal-header">
                  <h2>Chi tiết người dùng</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="info-row">
                    <span className="info-label">ID:</span>
                    <span className="info-value">#{selectedUser.user_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Tên đăng nhập:</span>
                    <span className="info-value">{selectedUser.username}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{selectedUser.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Số điện thoại:</span>
                    <span className="info-value">{selectedUser.phone || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Họ tên:</span>
                    <span className="info-value">{selectedUser.full_name || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Địa chỉ:</span>
                    <span className="info-value">{(selectedUser as any).address || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Vai trò:</span>
                    <span className={`role-badge role-${selectedUser.role_id || 3}`}>
                      {getRoleName(selectedUser.role_id)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Hạng thành viên:</span>
                    <span className={`tier-badge tier-${selectedUser.customer_tier_id || 1}`}>
                      {getTierName(selectedUser.customer_tier_id)}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Ngày tạo:</span>
                    <span className="info-value">{formatDate(selectedUser.created_at)}</span>
                  </div>
                </div>
              </>
            )}
            
            {/* Edit Mode */}
            {modalMode === 'edit' && (
              <>
                <div className="modal-header">
                  <h2>Chỉnh sửa người dùng</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Họ tên</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Vai trò</label>
                    <select
                      value={editForm.role_id}
                      onChange={(e) => setEditForm({...editForm, role_id: Number(e.target.value)})}
                    >
                      <option value="1">Admin</option>
                      <option value="2">Nhân viên</option>
                      <option value="3">Khách hàng</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-save" onClick={handleSaveEdit}>
                    💾 Lưu thay đổi
                  </button>
                </div>
              </>
            )}
            
            {/* Delete Mode */}
            {modalMode === 'delete' && (
              <>
                <div className="modal-header">
                  <h2>Xác nhận xóa</h2>
                  <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <div className="modal-body">
                  <p className="delete-warning">
                    Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.username}</strong>?
                  </p>
                  <p className="delete-note">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-cancel" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button className="btn-delete-confirm" onClick={confirmDelete}>
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
