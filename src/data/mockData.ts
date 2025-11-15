import type { DashboardStats, TopProduct } from '../services/dashboard.service';
import type { Order } from '../services/orders.service';

// Mock data cho development khi backend chưa sẵn sàng

export const mockDashboardStats: DashboardStats = {
  total_revenue: 125500000,
  total_orders: 248,
  total_customers: 1234,
  total_products: 156,
  revenue_growth: 12.5,
  orders_growth: 8.3,
  customers_growth: 15.7,
};

export const mockTopProducts: TopProduct[] = [
  {
    product_id: '1',
    product_name: 'Whey Protein Isolate 2kg',
    total_sold: 145,
    total_revenue: 18125000,
  },
  {
    product_id: '2',
    product_name: 'Mass Gainer 5kg',
    total_sold: 98,
    total_revenue: 18130000,
  },
  {
    product_id: '3',
    product_name: 'BCAA Amino 500g',
    total_sold: 156,
    total_revenue: 7020000,
  },
  {
    product_id: '4',
    product_name: 'Pre-Workout Extreme',
    total_sold: 87,
    total_revenue: 5916000,
  },
  {
    product_id: '5',
    product_name: 'Creatine Monohydrate 300g',
    total_sold: 134,
    total_revenue: 6968000,
  },
];

export const mockRecentOrders: Order[] = [
  {
    id: 'ord-001',
    customer_id: 'cust-001',
    customer_name: 'Nguyễn Văn A',
    customer_email: 'nguyenvana@email.com',
    customer_phone: '0912345678',
    status: 'completed',
    total_amount: 1250000,
    items: [
      {
        id: 'item-001',
        product_id: 'prod-001',
        product_name: 'Whey Protein 2kg',
        quantity: 1,
        price: 1250000,
        total: 1250000,
      },
    ],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-002',
    customer_id: 'cust-002',
    customer_name: 'Trần Thị B',
    customer_email: 'tranthib@email.com',
    customer_phone: '0923456789',
    status: 'processing',
    total_amount: 450000,
    items: [
      {
        id: 'item-002',
        product_id: 'prod-002',
        product_name: 'BCAA 500g',
        quantity: 1,
        price: 450000,
        total: 450000,
      },
    ],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-003',
    customer_id: 'cust-003',
    customer_name: 'Lê Văn C',
    customer_email: 'levanc@email.com',
    customer_phone: '0934567890',
    status: 'delivered',
    total_amount: 1850000,
    items: [
      {
        id: 'item-003',
        product_id: 'prod-003',
        product_name: 'Mass Gainer 5kg',
        quantity: 1,
        price: 1850000,
        total: 1850000,
      },
    ],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-004',
    customer_id: 'cust-004',
    customer_name: 'Phạm Thị D',
    customer_email: 'phamthid@email.com',
    customer_phone: '0945678901',
    status: 'completed',
    total_amount: 680000,
    items: [
      {
        id: 'item-004',
        product_id: 'prod-004',
        product_name: 'Pre-Workout',
        quantity: 1,
        price: 680000,
        total: 680000,
      },
    ],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ord-005',
    customer_id: 'cust-005',
    customer_name: 'Hoàng Văn E',
    customer_email: 'hoangvane@email.com',
    customer_phone: '0956789012',
    status: 'processing',
    total_amount: 520000,
    items: [
      {
        id: 'item-005',
        product_id: 'prod-005',
        product_name: 'Creatine 300g',
        quantity: 1,
        price: 520000,
        total: 520000,
      },
    ],
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
  },
];
