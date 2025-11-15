import '../../styles/Products.css';

export default function ProductInventory() {
  return (
    <div className="product-inventory">
      <div className="page-header">
        <h2>Quản lý kho</h2>
      </div>
      
      <div className="inventory-stats">
        <div className="stat-card">
          <h3>Tổng sản phẩm</h3>
          <p className="stat-value">0</p>
        </div>
        <div className="stat-card">
          <h3>Sắp hết hàng</h3>
          <p className="stat-value warning">0</p>
        </div>
        <div className="stat-card">
          <h3>Hết hàng</h3>
          <p className="stat-value danger">0</p>
        </div>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="empty-state">
                  Đang phát triển...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
