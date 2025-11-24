import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export type TransactionType =
  | 'purchase'
  | 'sale'
  | 'adjustment'
  | 'return'
  | 'damage'
  | 'transfer';

export interface InventoryTransaction {
  id: number;
  product_id: number;
  variant_id?: number | null;
  transaction_type: TransactionType;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  balance_before: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: number | null;
  notes?: string;
  created_at: string;
  created_by?: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  variant?: {
    id: number;
    variant_name: string;
    sku: string;
  };
}

export interface CreateInventoryTransactionDto {
  product_id: number;
  variant_id?: number | null;
  transaction_type: TransactionType;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: number | null;
  notes?: string;
}

export interface AdjustInventoryDto {
  quantity: number; // Dương = tăng, Âm = giảm
  notes?: string;
  variantId?: number | null;
}

export interface InventoryReportItem {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  low_stock_threshold?: number;
  is_low_stock: boolean;
  variants?: {
    variant_id: number;
    variant_name: string;
    current_stock: number;
  }[];
}

export interface InventoryTransactionListResponse {
  data: InventoryTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class InventoryService {
  private baseUrl = '/inventory';

  // Lấy lịch sử giao dịch kho
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    productId?: number;
    variantId?: number;
    transactionType?: TransactionType;
    startDate?: string;
    endDate?: string;
  }): Promise<InventoryTransactionListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.productId) queryParams.append('productId', params.productId.toString());
    if (params?.variantId) queryParams.append('variantId', params.variantId.toString());
    if (params?.transactionType) queryParams.append('transactionType', params.transactionType);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    return await apiClient.get<InventoryTransactionListResponse>(
      `${this.baseUrl}/transactions${queryString ? `?${queryString}` : ''}`
    );
  }

  // Lấy chi tiết giao dịch
  async getTransactionById(id: number): Promise<InventoryTransaction> {
    return await apiClient.get<InventoryTransaction>(`${this.baseUrl}/transactions/${id}`);
  }

  // Tạo giao dịch kho mới
  async createTransaction(dto: CreateInventoryTransactionDto): Promise<InventoryTransaction> {
    return await apiClient.post<InventoryTransaction>(`${this.baseUrl}/transactions`, dto);
  }

  // Điều chỉnh tồn kho thủ công
  async adjustInventory(productId: number, dto: AdjustInventoryDto): Promise<InventoryTransaction> {
    return await apiClient.post<InventoryTransaction>(
      `${this.baseUrl}/adjust/${productId}`,
      dto
    );
  }

  // Lấy báo cáo tồn kho
  async getInventoryReport(productId?: number): Promise<InventoryReportItem[]> {
    const queryParams = new URLSearchParams();
    if (productId) queryParams.append('productId', productId.toString());

    const queryString = queryParams.toString();
    return await apiClient.get<InventoryReportItem[]>(
      `${this.baseUrl}/report${queryString ? `?${queryString}` : ''}`
    );
  }
}

export const inventoryService = new InventoryService();

