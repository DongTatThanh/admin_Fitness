import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import UserManagement from './page/UserManagement'
import UserCreate from './components/Users/UserCreate'

// Categories
import CategoryList from './components/Categories/CategoryList'
import CategoryAdd from './components/Categories/CategoryAdd'

// Brands
import BrandList from './components/Brands/BrandList'
import BrandAdd from './components/Brands/BrandAdd'

// Products
import ProductList from './components/Products/ProductList'
import ProductAdd from './components/Products/ProductAdd'
import ProductInventory from './components/Products/ProductInventory'

// Orders
import OrderList from './components/Orders/OrderList'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="content">
            <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Users */}
              <Route path="/users/list" element={<UserManagement />} />
              <Route path="/users/create" element={<UserCreate />} />

              {/* Categories */}
              <Route path="/categories/list" element={<CategoryList />} />
              <Route path="/categories/add" element={<CategoryAdd />} />

              {/* Brands */}
              <Route path="/brands/list" element={<BrandList />} />
              <Route path="/brands/add" element={<BrandAdd />} />

              {/* Products */}
              <Route path="/products/list" element={<ProductList />} />
              <Route path="/products/add" element={<ProductAdd />} />
              <Route path="/products/inventory" element={<ProductInventory />} />

              {/* Topics */}
              <Route path="/topics/list" element={<div style={{ padding: '20px' }}><h2>Danh sách chủ đề</h2><p>Đang phát triển...</p></div>} />
              <Route path="/topics/add" element={<div style={{ padding: '20px' }}><h2>Thêm chủ đề</h2><p>Đang phát triển...</p></div>} />

              {/* Posts */}
              <Route path="/posts/list" element={<div style={{ padding: '20px' }}><h2>Danh sách bài đăng</h2><p>Đang phát triển...</p></div>} />
              <Route path="/posts/add" element={<div style={{ padding: '20px' }}><h2>Thêm bài đăng</h2><p>Đang phát triển...</p></div>} />

              {/* Shipping */}
              <Route path="/shipping/methods" element={<div style={{ padding: '20px' }}><h2>Phương thức vận chuyển</h2><p>Đang phát triển...</p></div>} />
              <Route path="/shipping/zones" element={<div style={{ padding: '20px' }}><h2>Khu vực vận chuyển</h2><p>Đang phát triển...</p></div>} />

              {/* Vouchers */}
              <Route path="/vouchers/list" element={<div style={{ padding: '20px' }}><h2>Danh sách voucher</h2><p>Đang phát triển...</p></div>} />
              <Route path="/vouchers/add" element={<div style={{ padding: '20px' }}><h2>Tạo voucher</h2><p>Đang phát triển...</p></div>} />

              {/* Inventory */}
              <Route path="/inventory/import" element={<div style={{ padding: '20px' }}><h2>Nhập hàng</h2><p>Đang phát triển...</p></div>} />
              <Route path="/inventory/history" element={<div style={{ padding: '20px' }}><h2>Lịch sử nhập hàng</h2><p>Đang phát triển...</p></div>} />

              {/* Orders */}
              <Route path="/orders/list" element={<OrderList />} />
              <Route path="/orders/pending" element={<div style={{ padding: '20px' }}><h2>Đơn hàng chờ xử lý</h2><p>Đang phát triển...</p></div>} />
              <Route path="/orders/completed" element={<div style={{ padding: '20px' }}><h2>Đơn hàng hoàn thành</h2><p>Đang phát triển...</p></div>} />

              {/* Messages */}
              <Route path="/messages/inbox" element={<div style={{ padding: '20px' }}><h2>Hộp thư đến</h2><p>Đang phát triển...</p></div>} />
              <Route path="/messages/sent" element={<div style={{ padding: '20px' }}><h2>Tin đã gửi</h2><p>Đang phát triển...</p></div>} />

              {/* Statistics */}
              <Route path="/statistics/revenue" element={<div style={{ padding: '20px' }}><h2>Thống kê doanh thu</h2><p>Đang phát triển...</p></div>} />
              <Route path="/statistics/products" element={<div style={{ padding: '20px' }}><h2>Thống kê sản phẩm</h2><p>Đang phát triển...</p></div>} />
              <Route path="/statistics/customers" element={<div style={{ padding: '20px' }}><h2>Thống kê khách hàng</h2><p>Đang phát triển...</p></div>} />

              {/* 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
