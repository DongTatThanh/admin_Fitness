import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const adminName = admin?.full_name || admin?.email || 'Admin';
  const adminInitials = adminName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Hello {adminName.split(' ')[0]} 👋</h1>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
            <span className="search-icon"></span>
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="badge">5</span>
            </button>
            
            <div className="user-profile">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=6C63FF&color=fff&size=80`}
                alt="Admin avatar"
              />
              <span>{adminName}</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Đăng xuất"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
