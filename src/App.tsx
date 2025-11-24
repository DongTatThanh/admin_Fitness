import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Login from './components/Auth/Login'
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

// Vouchers
import VoucherList from './components/Vouchers/VoucherList'
import VoucherForm from './components/Vouchers/VoucherForm'

// Flash Sales
import FlashSaleList from './components/FlashSales/FlashSaleList'
import FlashSaleProducts from './components/FlashSales/FlashSaleProducts'
import { useParams } from 'react-router-dom'

// Posts
import PostList from './components/Posts/PostList'
import PostAdd from './components/Posts/PostAdd'

// Flash Sale Products Wrapper
function FlashSaleProductsPage() {
  const { id } = useParams<{ id: string }>();
  return <FlashSaleProducts flashSaleId={parseInt(id || '0')} />;
}

// Banners
import BannerList from './components/Banners/BannerList'
import BannerForm from './components/Banners/BannerForm'

// Statistics
import Statistics from './components/Statistics/Statistics'
import RevenueByDay from './components/RevenueByDay'

// Suppliers
import SupplierList from './components/Suppliers/SupplierList'

// Purchase Orders
import PurchaseOrderList from './components/PurchaseOrders/PurchaseOrderList'
import PurchaseOrderForm from './components/PurchaseOrders/PurchaseOrderForm'
import PurchaseOrderDetail from './components/PurchaseOrders/PurchaseOrderDetail'

// Inventory
import InventoryTransactionList from './components/Inventory/InventoryTransactionList'
import InventoryReport from './components/Inventory/InventoryReport'
import InventoryAdjust from './components/Inventory/InventoryAdjust'

// Shipping
import CarrierList from './components/Shipping/CarrierList'
import ZoneList from './components/Shipping/ZoneList'
import RateList from './components/Shipping/RateList'
import ShipmentList from './components/Shipping/ShipmentList'
import ShipmentDetail from './components/Shipping/ShipmentDetail'

// Login Route - redirect to dashboard if already authenticated
function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Login />;
}

// Main App Layout (only shown when authenticated)
function AppLayout() {
  return (
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
              <Route path="/posts/list" element={<PostList />} />
              <Route path="/posts/add" element={<PostAdd />} />

              {/* Shipping */}
              <Route path="/shipping/carriers" element={<CarrierList />} />
              <Route path="/shipping/methods" element={<CarrierList />} />
              <Route path="/shipping/zones" element={<ZoneList />} />
              <Route path="/shipping/rates" element={<RateList />} />
              <Route path="/shipping/shipments" element={<ShipmentList />} />
              <Route path="/shipping/shipments/:id" element={<ShipmentDetail />} />

              {/* Vouchers */}
              <Route path="/vouchers/list" element={<VoucherList />} />
              <Route path="/vouchers/add" element={<VoucherForm />} />
              <Route path="/vouchers/edit/:id" element={<VoucherForm />} />

              {/* Flash Sales */}
              <Route path="/flash-sales" element={<FlashSaleList />} />
              <Route path="/flash-sales/:id/products" element={<FlashSaleProductsPage />} />

              {/* Banners */}
              <Route path="/banners" element={<BannerList />} />
              <Route path="/banners/add" element={<BannerForm />} />
              <Route path="/banners/edit/:id" element={<BannerForm />} />

              {/* Suppliers */}
              <Route path="/suppliers" element={<SupplierList />} />

              {/* Purchase Orders */}
              <Route path="/purchase-orders" element={<PurchaseOrderList />} />
              <Route path="/purchase-orders/new" element={<PurchaseOrderForm />} />
              <Route path="/purchase-orders/:id" element={<PurchaseOrderDetail />} />
              <Route path="/purchase-orders/:id/edit" element={<PurchaseOrderForm />} />

              {/* Inventory */}
              <Route path="/inventory/transactions" element={<InventoryTransactionList />} />
              <Route path="/inventory/report" element={<InventoryReport />} />
              <Route path="/inventory/adjust" element={<InventoryAdjust />} />
              <Route path="/inventory/import" element={<PurchaseOrderList />} />
              <Route path="/inventory/history" element={<InventoryTransactionList />} />

              {/* Orders */}
              <Route path="/orders/list" element={<OrderList />} />
              <Route path="/orders/pending" element={<div style={{ padding: '20px' }}><h2>Đơn hàng chờ xử lý</h2><p>Đang phát triển...</p></div>} />
              <Route path="/orders/completed" element={<div style={{ padding: '20px' }}><h2>Đơn hàng hoàn thành</h2><p>Đang phát triển...</p></div>} />

              {/* Messages */}
              <Route path="/messages/inbox" element={<div style={{ padding: '20px' }}><h2>Hộp thư đến</h2><p>Đang phát triển...</p></div>} />
              <Route path="/messages/sent" element={<div style={{ padding: '20px' }}><h2>Tin đã gửi</h2><p>Đang phát triển...</p></div>} />

              {/* Statistics */}
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/statistics/revenue" element={<RevenueByDay />} />
              <Route path="/statistics/products" element={<div style={{ padding: '20px' }}><h2>Thống kê sản phẩm</h2><p>Đang phát triển...</p></div>} />
              <Route path="/statistics/customers" element={<div style={{ padding: '20px' }}><h2>Thống kê khách hàng</h2><p>Đang phát triển...</p></div>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<LoginRoute />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
