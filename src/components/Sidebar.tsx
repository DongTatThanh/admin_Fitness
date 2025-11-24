import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path?: string;
  subItems?: { id: string; label: string; icon: string; path: string }[];
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: '',
      path: '/dashboard'
    },
    { 
      id: 'users', 
      label: 'Quản lý người dùng', 
      icon: '',
      subItems: [
        { id: 'users-list', label: 'Danh sách người dùng', icon: '', path: '/users/list' },
        { id: 'users-create', label: 'Thêm người dùng', icon: '', path: '/users/create' },
      ]
    },
    { 
      id: 'categories', 
      label: 'Quản lý danh mục', 
      icon: '',
      subItems: [
        { id: 'categories-list', label: 'Danh sách danh mục', icon: '', path: '/categories/list' },
        { id: 'categories-add', label: 'Thêm danh mục', icon: '', path: '/categories/add' },
      ]
    },
    { 
      id: 'brands', 
      label: 'Quản lý nhãn hàng', 
      icon: '',
      subItems: [
        { id: 'brands-list', label: 'Danh sách nhãn hàng', icon: '', path: '/brands/list' },
        { id: 'brands-add', label: 'Thêm nhãn hàng', icon: '', path: '/brands/add' },
      ]
    },
    { 
      id: 'products', 
      label: 'Quản lý sản phẩm', 
      icon: '',
      subItems: [
        { id: 'products-list', label: 'Danh sách sản phẩm', icon: '', path: '/products/list' },
        { id: 'products-add', label: 'Thêm sản phẩm', icon: '', path: '/products/add' },
        { id: 'products-inventory', label: 'quản lý biến thê sản phẩm', icon: '', path: '/products/inventory' },
      ]
    },
    { 
      id: 'topics', 
      label: 'Quản lý chủ đề', 
      icon: '',
      subItems: [
        { id: 'topics-list', label: 'Danh sách chủ đề', icon: '', path: '/topics/list' },
        { id: 'topics-add', label: 'Thêm chủ đề', icon: '', path: '/topics/add' },
      ]
    },
    { 
      id: 'posts', 
      label: 'Quản lý bài đăng', 
      icon: '',
      subItems: [
        { id: 'posts-list', label: 'Danh sách bài đăng', icon: '', path: '/posts/list' },
        { id: 'posts-add', label: 'Thêm bài đăng', icon: '', path: '/posts/add' },
      ]
    },
    { 
      id: 'shipping', 
      label: 'Quản lý vận chuyển', 
      icon: '',
      subItems: [
        { id: 'shipping-carriers', label: 'Đơn vị vận chuyển', icon: '', path: '/shipping/carriers' },
        { id: 'shipping-methods', label: 'Phương thức ship', icon: '', path: '/shipping/methods' },
        { id: 'shipping-zones', label: 'Khu vực ship', icon: '', path: '/shipping/zones' },
        { id: 'shipping-rates', label: 'Bảng giá', icon: '', path: '/shipping/rates' },
        { id: 'shipping-shipments', label: 'Đơn vận chuyển', icon: '', path: '/shipping/shipments' },
      ]
    },
    { 
      id: 'vouchers', 
      label: 'Quản lý voucher', 
      icon: '',
      subItems: [
        { id: 'vouchers-list', label: 'Danh sách voucher', icon: '', path: '/vouchers/list' },
        { id: 'vouchers-add', label: 'Tạo voucher', icon: '', path: '/vouchers/add' },
      ]
    },
    { 
      id: 'flashsales', 
      label: 'Quản lý Flash Sale', 
      icon: '',
      subItems: [
        { id: 'flashsales-list', label: 'Danh sách Flash Sale', icon: '', path: '/flash-sales' },
      ]
    },
    { 
      id: 'banners', 
      label: 'Quản lý Banner', 
      icon: '',
      subItems: [
        { id: 'banners-list', label: 'Danh sách Banner', icon: '', path: '/banners' },
        { id: 'banners-add', label: 'Thêm Banner', icon: '', path: '/banners/add' },
      ]
    },
    { 
      id: 'suppliers', 
      label: 'Quản lý Nhà cung cấp', 
      icon: '',
      path: '/suppliers'
    },
    { 
      id: 'purchase-orders', 
      label: 'Quản lý Đơn nhập hàng', 
      icon: '',
      path: '/purchase-orders'
    },
    { 
      id: 'inventory', 
      label: 'Quản lý Kho', 
      icon: '',
      subItems: [
        { id: 'inventory-transactions', label: 'Lịch sử giao dịch', icon: '', path: '/inventory/transactions' },
        { id: 'inventory-report', label: 'Báo cáo tồn kho', icon: '', path: '/inventory/report' },
        { id: 'inventory-adjust', label: 'Điều chỉnh tồn kho', icon: '', path: '/inventory/adjust' },
        { id: 'inventory-import', label: 'Nhập hàng', icon: '', path: '/inventory/import' },
        { id: 'inventory-history', label: 'Lịch sử nhập', icon: '', path: '/inventory/history' },
      ]
    },
    { 
      id: 'orders', 
      label: 'Quản lý đơn hàng', 
      icon: '',
      subItems: [
        { id: 'orders-list', label: 'Danh sách đơn hàng', icon: '', path: '/orders/list' },
        { id: 'orders-pending', label: 'Đơn chờ xử lý', icon: '', path: '/orders/pending' },
        { id: 'orders-completed', label: 'Đơn hoàn thành', icon: '', path: '/orders/completed' },
      ]
    },
    { 
      id: 'messages', 
      label: 'Quản lý tin nhắn', 
      icon: '',
      subItems: [
        { id: 'messages-inbox', label: 'Hộp thư đến', icon: '', path: '/messages/inbox' },
        { id: 'messages-sent', label: 'Tin đã gửi', icon: '', path: '/messages/sent' },
      ]
    },
    { 
      id: 'statistics', 
      label: 'Thống kê', 
      icon: '',
      subItems: [
        { id: 'stats-overview', label: 'Tổng quan', icon: '', path: '/statistics' },
        { id: 'stats-revenue', label: 'Doanh thu', icon: '', path: '/statistics/revenue' },
        { id: 'stats-products', label: 'Sản phẩm', icon: '', path: '/statistics/products' },
        { id: 'stats-customers', label: 'Khách hàng', icon: '', path: '/statistics/customers' },
      ]
    },
  ];

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path) return isActive(item.path);
    if (item.subItems) {
      return item.subItems.some(sub => isActive(sub.path));
    }
    return false;
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{!isCollapsed && 'GYM NUTRITION'}</h2>
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-group">
            {item.path ? (
              <Link
                to={item.path}
                className={`nav-item ${isParentActive(item) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </Link>
            ) : (
              <button
                className={`nav-item ${isParentActive(item) ? 'active' : ''} ${item.subItems ? 'has-submenu' : ''}`}
                onClick={() => item.subItems && toggleMenu(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.subItems && (
                      <span className="expand-icon">
                        {expandedMenus.includes(item.id) ? '▼' : '▶'}
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
            
            {/* Submenu items */}
            {item.subItems && expandedMenus.includes(item.id) && !isCollapsed && (
              <div className="submenu">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.id}
                    to={subItem.path}
                    className={`submenu-item ${isActive(subItem.path) ? 'active' : ''}`}
                  >
                    <span className="submenu-icon">{subItem.icon}</span>
                    <span className="submenu-label">{subItem.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
