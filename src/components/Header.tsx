import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Hello Admin 👋</h1>
        </div>
        
        <div className="header-right">
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm..." />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="badge">5</span>
            </button>
            
            <div className="user-profile">
              <img src="https://via.placeholder.com/40" alt="Admin" />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
