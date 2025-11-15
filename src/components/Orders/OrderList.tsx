import '../../styles/Orders.css';

export default function OrderList() {
  return (
    <div className="order-list">
      <div className="page-header">
        <h2>Danh sách đơn hàng</h2>
      </div>
      
      <div className="filters">
        <input type="text" placeholder="Tìm mã đơn, tên khách hàng..." className="search-input" />
        <select className="filter-select">
          <option>Tất cả trạng thái</option>
          <option>Chờ xử lý</option>
          <option>Đang xử lý</option>
          <option>Đang giao</option>
          <option>Hoàn thành</option>
          <option>Đã hủy</option>
        </select>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
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
