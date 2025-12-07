import { useState, useEffect } from 'react';
import '../../styles/Inventory.css';
import { inventoryService } from '../../services';
import type { InventoryTransaction, TransactionType } from '../../services/inventory.service';

export default function InventoryTransactionList() {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [limit, setLimit] = useState(20);
  const [productFilter, setProductFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await inventoryService.getTransactions({
        page: currentPage,
        limit: limit,
        productId: productFilter ? parseInt(productFilter) : undefined,
        transactionType: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setTransactions(response.data);
      setTotalPages(response.totalPages);
      setTotalTransactions(response.total);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
      setError('Không thể tải lịch sử giao dịch: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentPage, limit, typeFilter, startDate, endDate]);

  // Debounce product filter
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadTransactions();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [productFilter]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeBadge = (type: TransactionType) => {
    const typeMap: Record<TransactionType, { label: string; className: string }> = {
      purchase: { label: 'Nhập hàng', className: 'type-purchase' },
      sale: { label: 'Bán hàng', className: 'type-sale' },
      adjustment: { label: 'Điều chỉnh', className: 'type-adjustment' },
      return: { label: 'Trả hàng', className: 'type-return' },
      damage: { label: 'Hư hỏng', className: 'type-damage' },
      transfer: { label: 'Chuyển kho', className: 'type-transfer' },
    };
    const { label, className } = typeMap[type];
    return <span className={`type-badge ${className}`}>{label}</span>;
  };

  return (
    <div className="inventory-transactions-container">
      <div className="inventory-header">
        <h2>Lịch sử Giao dịch Kho</h2>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        <div className="filter-group">
          <label>Product ID</label>
          <input
            type="number"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            placeholder="Lọc theo Product ID"
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Loại giao dịch</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TransactionType | '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            <option value="purchase">Nhập hàng</option>
            <option value="sale">Bán hàng</option>
            <option value="adjustment">Điều chỉnh</option>
            <option value="return">Trả hàng</option>
            <option value="damage">Hư hỏng</option>
            <option value="transfer">Chuyển kho</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>Số lượng / trang</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Table */}
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày giờ</th>
              <th>Sản phẩm</th>
              <th>Variant</th>
              <th>Loại</th>
              <th>Số lượng</th>
              <th>Tồn kho trước</th>
              <th>Tồn kho sau</th>
              <th>Đơn giá</th>
              <th>Tổng tiền</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center">
                  Không có giao dịch nào
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>#{tx.id}</td>
                  <td className="text-muted">{formatDate(tx.created_at)}</td>
                  <td>
                    <div>
                      <strong>{tx.product?.name || `Product ID: ${tx.product_id}`}</strong>
                      <br />
                      <small className="text-muted">{tx.product?.sku}</small>
                    </div>
                  </td>
                  <td>
                    {tx.variant ? (
                      <div>
                        <strong>{tx.variant.variant_name}</strong>
                        <br />
                        <small className="text-muted">{tx.variant.sku}</small>
                      </div>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>{getTypeBadge(tx.transaction_type)}</td>
                  <td>
                    <span
                      className={
                        tx.quantity > 0
                          ? 'text-success'
                          : tx.quantity < 0
                            ? 'text-danger'
                            : ''
                      }
                    >
                      {tx.quantity > 0 ? '+' : ''}
                      {tx.quantity}
                    </span>
                  </td>
                  <td>{tx.balance_before}</td>
                  <td className="font-semibold">{tx.balance_after}</td>
                  <td>{formatCurrency(tx.unit_cost)}</td>
                  <td>{formatCurrency(tx.total_cost)}</td>
                  <td className="text-muted">{tx.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Trước
          </button>
          <span className="page-info">
            Trang {currentPage} / {totalPages} (Tổng: {totalTransactions})
          </span>
          <button
            className="btn btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}




