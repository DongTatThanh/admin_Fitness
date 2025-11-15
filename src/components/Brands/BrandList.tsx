import '../../styles/Brands.css';

export default function BrandList() {
  return (
    <div className="brand-list">
      <div className="page-header">
        <h2>Danh sách nhãn hàng</h2>
        <button className="btn-primary">Thêm nhãn hàng mới</button>
      </div>
      
      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Logo</th>
                <th>Tên nhãn hàng</th>
                <th>Quốc gia</th>
                <th>Số sản phẩm</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="empty-state">
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
