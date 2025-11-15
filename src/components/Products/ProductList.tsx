import '../../styles/Products.css';

export default function ProductList() {
  return (
    <div className="product-list">
      <div className="page-header">
        <h2>Danh sách sản phẩm</h2>
        <button className="btn-primary">Thêm sản phẩm mới</button>
      </div>
      
      <div className="filters">
        <input type="text" placeholder="Tìm kiếm sản phẩm..." className="search-input" />
        <select className="filter-select">
          <option>Tất cả danh mục</option>
        </select>
        <select className="filter-select">
          <option>Tất cả nhãn hàng</option>
        </select>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Nhãn hàng</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={9} className="empty-state">
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
