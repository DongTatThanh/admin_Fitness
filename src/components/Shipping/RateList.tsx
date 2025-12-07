import { useState, useEffect } from 'react';
import '../../styles/Shipping.css';
import {
  shippingRatesService,
  shippingCarriersService,
  shippingZonesService,
} from '../../services';
import type { ShippingRate } from '../../services/shipping-rates.service';
import type { ShippingCarrier } from '../../services/shipping-carriers.service';
import type { ShippingZone } from '../../services/shipping-zones.service';
import RateForm from './RateForm';

export default function RateList() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([]);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRates, setTotalRates] = useState(0);
  const [limit, setLimit] = useState(20);
  const [carrierFilter, setCarrierFilter] = useState<number | ''>('');
  const [zoneFilter, setZoneFilter] = useState<number | ''>('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'delete' | 'add'>('view');
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  // Load carriers and zones for filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [carriersRes, zonesRes] = await Promise.all([
          shippingCarriersService.getActiveCarriers(),
          shippingZonesService.getZones({ limit: 1000 }),
        ]);
        setCarriers(carriersRes);
        setZones(zonesRes.data);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    };
    loadFilters();
  }, []);

  // Load rates
  const loadRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shippingRatesService.getRates({
        page: currentPage,
        limit: limit,
        carrierId: carrierFilter || undefined,
        zoneId: zoneFilter || undefined,
      });

      setRates(response.data);
      setTotalPages(response.totalPages);
      setTotalRates(response.total);
    } catch (err: any) {
      console.error('Error loading rates:', err);
      setError('Không thể tải danh sách bảng giá: ' + (err?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, [currentPage, limit, carrierFilter, zoneFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };


  // Xem chi tiết
  const handleViewRate = async (rateId: number) => {
    try {
      const rate = await shippingRatesService.getRateById(rateId);
      setSelectedRate(rate);
      setModalMode('view');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Sửa
  const handleEditRate = async (rateId: number) => {
    try {
      const rate = await shippingRatesService.getRateById(rateId);
      setSelectedRate(rate);
      setModalMode('edit');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  // Xóa
  const handleDeleteRate = async (rateId: number) => {
    try {
      const rate = await shippingRatesService.getRateById(rateId);
      setSelectedRate(rate);
      setModalMode('delete');
      setShowModal(true);
    } catch (err: any) {
      alert('Lỗi: ' + (err?.message || 'Unknown error'));
    }
  };

  const confirmDelete = async () => {
    if (!selectedRate) return;

    try {
      await shippingRatesService.deleteRate(selectedRate.id);
      alert('Xóa bảng giá thành công!');
      setShowModal(false);
      setSelectedRate(null);
      loadRates();
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err?.message || 'Unknown error'));
    }
  };

  // Thêm mới
  const handleAddRate = () => {
    setSelectedRate(null);
    setModalMode('add');
    setShowModal(true);
  };

  const handleFormSuccess = () => {
    setShowModal(false);
    setSelectedRate(null);
    loadRates();
  };

  return (
    <div className="shipping-container">
      <div className="shipping-header">
        <h2>Quản lý Bảng giá Vận chuyển</h2>
        <button className="btn btn-primary" onClick={handleAddRate}>
          + Thêm bảng giá mới
        </button>
      </div>

      {/* Filters */}
      <div className="shipping-filters">
        <div className="filter-group">
          <label>Đơn vị vận chuyển</label>
          <select
            value={carrierFilter}
            onChange={(e) => {
              setCarrierFilter(e.target.value ? Number(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Khu vực</label>
          <select
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value ? Number(e.target.value) : '');
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
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
      <div className="shipping-table-wrapper">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên bảng giá</th>
              <th>Đơn vị vận chuyển</th>
              <th>Khu vực</th>
              <th>Trọng lượng (kg)</th>
              <th>Phí cơ bản</th>
              <th>Phí / kg</th>
              <th>Thời gian (ngày)</th>
              <th>Ưu tiên</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center">
                  <div className="loading-spinner">Đang tải...</div>
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center">
                  Không có bảng giá nào
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id}>
                  <td>{rate.id}</td>
                  <td className="font-semibold">{rate.name}</td>
                  <td>{rate.carrier?.name || `ID: ${rate.carrier_id}`}</td>
                  <td>{rate.zone?.name || `ID: ${rate.zone_id}`}</td>
                  <td>
                    {rate.min_weight} - {rate.max_weight || '∞'} kg
                  </td>
                  <td>{formatCurrency(rate.base_fee)}</td>
                  <td>{formatCurrency(rate.fee_per_kg)}</td>
                  <td>{rate.estimated_days} ngày</td>
                  <td>
                    <span className="priority-badge">{rate.priority}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => handleViewRate(rate.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleEditRate(rate.id)}
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteRate(rate.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
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
            Trang {currentPage} / {totalPages} (Tổng: {totalRates})
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            {modalMode === 'delete' && selectedRate && (
              <>
                <div className="modal-header">
                  <h3>Xác nhận xóa</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Bạn có chắc chắn muốn xóa bảng giá "{selectedRate.name}"?</p>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Hủy
                    </button>
                    <button className="btn btn-danger" onClick={confirmDelete}>
                      Xóa
                    </button>
                  </div>
                </div>
              </>
            )}

            {modalMode === 'view' && selectedRate && (
              <>
                <div className="modal-header">
                  <h3>Chi tiết Bảng giá</h3>
                  <button className="modal-close" onClick={() => setShowModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-view">
                    <div className="detail-row">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{selectedRate.id}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Tên:</span>
                      <span className="detail-value">{selectedRate.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Đơn vị vận chuyển:</span>
                      <span className="detail-value">
                        {selectedRate.carrier?.name || `ID: ${selectedRate.carrier_id}`}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Khu vực:</span>
                      <span className="detail-value">
                        {selectedRate.zone?.name || `ID: ${selectedRate.zone_id}`}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Trọng lượng:</span>
                      <span className="detail-value">
                        {selectedRate.min_weight} - {selectedRate.max_weight || 'Không giới hạn'} kg
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phí cơ bản:</span>
                      <span className="detail-value">{formatCurrency(selectedRate.base_fee)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phí mỗi kg:</span>
                      <span className="detail-value">{formatCurrency(selectedRate.fee_per_kg)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Thời gian ước tính:</span>
                      <span className="detail-value">{selectedRate.estimated_days} ngày</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Độ ưu tiên:</span>
                      <span className="detail-value">{selectedRate.priority}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                      Đóng
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditRate(selectedRate.id)}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              </>
            )}

            {(modalMode === 'add' || modalMode === 'edit') && (
              <RateForm
                rate={modalMode === 'edit' ? selectedRate : null}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowModal(false);
                  setSelectedRate(null);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}




