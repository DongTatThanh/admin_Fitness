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
            <span className="search-icon"></span>
          </div>
          
          <div className="header-actions">
            <button className="notification-btn">
              🔔
              <span className="badge">5</span>
            </button>
            
            <div className="user-profile">
              <img
                src="https://ui-avatars.com/api/?name=Admin&background=6C63FF&color=fff&size=80"
                alt="Admin avatar"
              />
              <span>Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
