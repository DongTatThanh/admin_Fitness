import { useState, useEffect } from 'react';
import '../../styles/Inventory.css';
import { inventoryService } from '../../services';
import type { InventoryReportItem } from '../../services/inventory.service';

export default function InventoryReport() {
  const [report, setReport] = useState<InventoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const productId = productFilter ? parseInt(productFilter) : undefined;
      const data = await inventoryService.getInventoryReport(productId);
      setReport(data);
    } catch (err: any) {
      console.error('Error loading inventory report:', err);
      setError('Không thể tải báo cáo tồn kho: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [productFilter]);

  // Debounce product filter
  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 500);

    return () => clearTimeout(timer);
  }, [productFilter]);

  const filteredReport = lowStockOnly
    ? report.filter((item) => item.is_low_stock)
    : report;

  return (
    <div className="inventory-report-container">
      <div className="inventory-header">
        <h2>Báo cáo Tồn kho</h2>
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            <span>Chỉ hiển thị hàng sắp hết</span>
          </label>
        </div>
        <div className="filter-group">
          <button className="btn btn-primary" onClick={loadReport}>
            Làm mới
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Report */}
      <div className="inventory-report-wrapper">
        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : filteredReport.length === 0 ? (
          <div className="text-center">Không có dữ liệu</div>
        ) : (
          filteredReport.map((item) => (
            <div key={item.product_id} className="report-item">
              <div className="report-item-header">
                <div>
                  <h3>{item.product_name}</h3>
                  <p className="text-muted">SKU: {item.sku}</p>
                </div>
                <div className="stock-info">
                  <span className={`stock-badge ${item.is_low_stock ? 'low-stock' : 'normal'}`}>
                    Tồn kho: {item.current_stock}
                  </span>
                  {item.low_stock_threshold && (
                    <span className="text-muted">
                      Ngưỡng: {item.low_stock_threshold}
                    </span>
                  )}
                </div>
              </div>

              {item.variants && item.variants.length > 0 && (
                <div className="variants-list">
                  <h4>Variants:</h4>
                  <table className="variants-table">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Tồn kho</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.variants.map((variant) => (
                        <tr key={variant.variant_id}>
                          <td>{variant.variant_name}</td>
                          <td className="font-semibold">{variant.current_stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}




