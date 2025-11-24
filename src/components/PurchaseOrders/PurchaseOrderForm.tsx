import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/PurchaseOrders.css';
import {
  purchaseOrdersService,
  suppliersService,
  productsService,
} from '../../services';
import type {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  AddItemToPurchaseOrderDto,
} from '../../services/purchase-orders.service';
import type { Supplier } from '../../services/suppliers.service';
import type { Product } from '../../services/products.service';

interface PurchaseOrderFormProps {
  orderId?: number;
}

export default function PurchaseOrderForm({ orderId }: PurchaseOrderFormProps) {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!orderId || !!params.id;
  const actualOrderId = orderId || (params.id ? parseInt(params.id) : null);

  const [formData, setFormData] = useState({
    supplier_id: '',
    notes: '',
    expected_delivery_date: '',
  });
  const [items, setItems] = useState<
    Array<{
      product_id: string;
      variant_id: string;
      quantity_ordered: string;
      unit_cost: string;
      notes: string;
    }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [suppliersRes, productsRes] = await Promise.all([
          suppliersService.getActiveSuppliers(),
          productsService.getAllProducts(1, 1000),
        ]);
        setSuppliers(suppliersRes);
        setProducts(productsRes.data || []);

        // Load order if editing
        if (actualOrderId) {
          const order = await purchaseOrdersService.getPurchaseOrderById(actualOrderId);
          setFormData({
            supplier_id: order.supplier_id.toString(),
            notes: order.notes || '',
            expected_delivery_date: order.expected_delivery_date
              ? new Date(order.expected_delivery_date).toISOString().split('T')[0]
              : '',
          });
          setItems(
            order.items.map((item) => ({
              product_id: item.product_id.toString(),
              variant_id: item.variant_id?.toString() || '',
              quantity_ordered: item.quantity_ordered.toString(),
              unit_cost: item.unit_cost.toString(),
              notes: item.notes || '',
            }))
          );
        }
      } catch (err: any) {
        alert('Lỗi khi tải dữ liệu: ' + (err?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [actualOrderId]);

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        variant_id: '',
        quantity_ordered: '1',
        unit_cost: '0',
        notes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplier_id) {
      newErrors.supplier_id = 'Vui lòng chọn nhà cung cấp';
    }

    if (items.length === 0) {
      newErrors.items = 'Vui lòng thêm ít nhất một sản phẩm';
    }

    items.forEach((item, index) => {
      if (!item.product_id) {
        newErrors[`item_${index}_product`] = 'Vui lòng chọn sản phẩm';
      }
      if (!item.quantity_ordered || parseFloat(item.quantity_ordered) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Số lượng phải lớn hơn 0';
      }
      if (!item.unit_cost || parseFloat(item.unit_cost) < 0) {
        newErrors[`item_${index}_cost`] = 'Giá nhập phải >= 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSubmitting(true);

      const orderItems = items.map((item) => ({
        product_id: parseInt(item.product_id),
        variant_id: item.variant_id ? parseInt(item.variant_id) : null,
        quantity_ordered: parseInt(item.quantity_ordered),
        unit_cost: parseFloat(item.unit_cost),
        notes: item.notes || undefined,
      }));

      if (isEdit && actualOrderId) {
        // Update order
        const updateDto: UpdatePurchaseOrderDto = {
          supplier_id: parseInt(formData.supplier_id),
          notes: formData.notes || undefined,
          expected_delivery_date: formData.expected_delivery_date || undefined,
        };
        await purchaseOrdersService.updatePurchaseOrder(actualOrderId, updateDto);
        alert('Cập nhật đơn nhập hàng thành công!');
      } else {
        // Create order
        const createDto: CreatePurchaseOrderDto = {
          supplier_id: parseInt(formData.supplier_id),
          notes: formData.notes || undefined,
          expected_delivery_date: formData.expected_delivery_date || undefined,
          items: orderItems,
        };
        await purchaseOrdersService.createPurchaseOrder(createDto);
        alert('Tạo đơn nhập hàng thành công!');
      }

      navigate('/purchase-orders');
    } catch (error: any) {
      alert('Lỗi: ' + (error?.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  return (
    <div className="purchase-order-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Cập nhật Đơn nhập hàng' : 'Tạo Đơn nhập hàng mới'}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/purchase-orders')}>
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="purchase-order-form">
        <div className="form-section">
          <h3>Thông tin đơn hàng</h3>
          <div className="form-group">
            <label>
              Nhà cung cấp <span className="required">*</span>
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
              className={errors.supplier_id ? 'error' : ''}
              required
            >
              <option value="">Chọn nhà cung cấp</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.supplier_id && (
              <span className="error-message">{errors.supplier_id}</span>
            )}
          </div>

          <div className="form-group">
            <label>Ngày dự kiến giao hàng</label>
            <input
              type="date"
              value={formData.expected_delivery_date}
              onChange={(e) =>
                setFormData({ ...formData, expected_delivery_date: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Ghi chú về đơn hàng"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Sản phẩm</h3>
            <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
              + Thêm sản phẩm
            </button>
          </div>
          {errors.items && <div className="error-message">{errors.items}</div>}

          <div className="items-list">
            {items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label>
                    Sản phẩm <span className="required">*</span>
                  </label>
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    className={errors[`item_${index}_product`] ? 'error' : ''}
                    required
                  >
                    <option value="">Chọn sản phẩm</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                  {errors[`item_${index}_product`] && (
                    <span className="error-message">{errors[`item_${index}_product`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Số lượng <span className="required">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity_ordered}
                    onChange={(e) => updateItem(index, 'quantity_ordered', e.target.value)}
                    className={errors[`item_${index}_quantity`] ? 'error' : ''}
                    required
                  />
                  {errors[`item_${index}_quantity`] && (
                    <span className="error-message">{errors[`item_${index}_quantity`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Giá nhập (₫) <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={item.unit_cost}
                    onChange={(e) => updateItem(index, 'unit_cost', e.target.value)}
                    className={errors[`item_${index}_cost`] ? 'error' : ''}
                    required
                  />
                  {errors[`item_${index}_cost`] && (
                    <span className="error-message">{errors[`item_${index}_cost`]}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    placeholder="Ghi chú"
                  />
                </div>

                <div className="item-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(index)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/purchase-orders')}>
            Hủy
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Tạo đơn hàng'}
          </button>
        </div>
      </form>
    </div>
  );
}

