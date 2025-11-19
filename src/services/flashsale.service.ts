import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface FlashSale {
  id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  status: 'upcoming' | 'active' | 'expired';
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface FlashSaleProduct {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    brand?: { name: string };
    category?: { name: string };
  };
  variant?: {
    id: number;
    variant_name: string;
    sku: string;
  };
  original_price: number;
  sale_price: number;
  discount_percent: number;
  max_quantity: number | null;
  sold_quantity: number;
  remaining: number | null;
}

export interface CreateFlashSaleDto {
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export interface UpdateFlashSaleDto {
  name?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface AddProductToFlashSaleDto {
  product_id: number;
  variant_id?: number;
  original_price?: number;
  sale_price: number;
  max_quantity?: number;
}

export interface UpdateFlashSaleProductDto {
  sale_price?: number;
  original_price?: number;
  max_quantity?: number;
}

// ============== SERVICE ==============
class FlashSaleService {
  private baseUrl = '/flash-sales';

  // Admin: Lấy tất cả Flash Sales
  async getAllFlashSales(page: number = 1, limit: number = 20, status?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status && status !== 'all') {
      params.append('status', status);
    }
    return await apiClient.get<any>(`${this.baseUrl}/admin/list?${params}`);
  }

  // Admin: Lấy chi tiết Flash Sale
  async getFlashSaleById(id: number) {
    return await apiClient.get<any>(`${this.baseUrl}/admin/${id}`);
  }

  // Admin: Tạo Flash Sale mới
  async createFlashSale(dto: CreateFlashSaleDto) {
    return await apiClient.post<any>(`${this.baseUrl}/admin`, dto);
  }

  // Admin: Cập nhật Flash Sale
  async updateFlashSale(id: number, dto: UpdateFlashSaleDto) {
    return await apiClient.put<any>(`${this.baseUrl}/admin/${id}`, dto);
  }

  // Admin: Xóa Flash Sale
  async deleteFlashSale(id: number) {
    return await apiClient.delete<any>(`${this.baseUrl}/admin/${id}`);
  }

  // Admin: Lấy danh sách sản phẩm trong Flash Sale
  async getFlashSaleProducts(flashSaleId: number, page: number = 1, limit: number = 20) {
    return await apiClient.get<any>(
      `${this.baseUrl}/admin/${flashSaleId}/products?page=${page}&limit=${limit}`
    );
  }

  // Admin: Thêm sản phẩm vào Flash Sale
  async addProductToFlashSale(flashSaleId: number, dto: AddProductToFlashSaleDto) {
    return await apiClient.post<any>(`${this.baseUrl}/admin/${flashSaleId}/products`, dto);
  }

  // Admin: Thêm nhiều sản phẩm (bulk)
  async bulkAddProducts(flashSaleId: number, products: AddProductToFlashSaleDto[]) {
    return await apiClient.post<any>(`${this.baseUrl}/admin/${flashSaleId}/products/bulk`, {
      products,
    });
  }

  // Admin: Cập nhật sản phẩm trong Flash Sale
  async updateFlashSaleProduct(
    flashSaleId: number,
    itemId: number,
    dto: UpdateFlashSaleProductDto
  ) {
    return await apiClient.put<any>(
      `${this.baseUrl}/admin/${flashSaleId}/products/${itemId}`,
      dto
    );
  }

  // Admin: Xóa sản phẩm khỏi Flash Sale
  async removeProductFromFlashSale(flashSaleId: number, itemId: number) {
    return await apiClient.delete<any>(
      `${this.baseUrl}/admin/${flashSaleId}/products/${itemId}`
    );
  }
}

export const flashSaleService = new FlashSaleService();
