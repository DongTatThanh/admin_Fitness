import { useState } from 'react';
import '../styles/Products.css';

export default function Products() {
  const [showModal, setShowModal] = useState(false);

  const products = [
    {
      id: 1,
      name: 'Whey Protein Isolate',
      category: 'Protein',
      price: '1,250,000₫',
      stock: 45,
      image: 'https://via.placeholder.com/80',
      status: 'Còn hàng'
    },
    {
      id: 2,
      name: 'Mass Gainer 5kg',
      category: 'Tăng cân',
      price: '1,850,000₫',
      stock: 23,
      image: 'https://via.placeholder.com/80',
      status: 'Còn hàng'
    },
    {
      id: 3,
      name: 'BCAA Amino 500g',
      category: 'Amino Acid',
      price: '450,000₫',
      stock: 67,
      image: 'https://via.placeholder.com/80',
      status: 'Còn hàng'
    },
    {
      id: 4,
      name: 'Pre-Workout Extreme',
      category: 'Pre-Workout',
      price: '680,000₫',
      stock: 5,
      image: 'https://via.placeholder.com/80',
      status: 'Sắp hết'
    },
    {
      id: 5,
      name: 'Creatine Monohydrate',
      category: 'Creatine',
      price: '520,000₫',
      stock: 89,
      image: 'https://via.placeholder.com/80',
      status: 'Còn hàng'
    },
  ];

  return (
    <div className="products">
      <div className="products-header">
        <h2>Quản Lý Sản Phẩm</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="products-toolbar">
        <div className="search-box">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." />
          <span className="search-icon"></span>
        </div>
        <div className="filters">
          <select>
            <option>Tất cả danh mục</option>
            <option>Protein</option>
            <option>Tăng cân</option>
            <option>Amino Acid</option>
            <option>Pre-Workout</option>
          </select>
          <select>
            <option>Tất cả trạng thái</option>
            <option>Còn hàng</option>
            <option>Sắp hết</option>
            <option>Hết hàng</option>
          </select>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img src={product.image} alt={product.name} className="product-img" />
                </td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category}</td>
                <td className="price">{product.price}</td>
                <td>
                  <span className={product.stock < 10 ? 'stock-low' : 'stock-normal'}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status ${product.status === 'Còn hàng' ? 'in-stock' : 'low-stock'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="edit-btn" title="Sửa">Edit</button>
                    <button className="delete-btn" title="Xóa">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm sản phẩm mới</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input type="text" placeholder="Nhập tên sản phẩm" />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select>
                    <option>Chọn danh mục</option>
                    <option>Protein</option>
                    <option>Tăng cân</option>
                    <option>Amino Acid</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Giá</label>
                    <input type="number" placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Tồn kho</label>
                    <input type="number" placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea rows={4} placeholder="Nhập mô tả sản phẩm"></textarea>
                </div>
                <div className="form-group">
                  <label>Hình ảnh</label>
                  <input type="file" />
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="submit-btn">
                    Thêm sản phẩm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
