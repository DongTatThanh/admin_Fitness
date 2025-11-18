import { apiClient } from '../lib/api_client';

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku: string;
  price: number;
  compare_price?: number;
  inventory_quantity: number;
  image_url?: string;
  is_active: boolean;
  flavor?: string;
  size?: string;
  color?: string;
  weight?: string;
  weight_unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVariantDto {
  variantName: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  image?: string;
  status?: 'active' | 'inactive';
  attributeValues?: {
    flavor?: string;
    size?: string;
    color?: string;
    weight?: string;
    weight_unit?: string;
  };
}

export interface UpdateVariantDto {
  variantName?: string;
  sku?: string;
  price?: number;
  comparePrice?: number;
  quantity?: number;
  image?: string;
  status?: 'active' | 'inactive';
  attributeValues?: {
    flavor?: string;
    size?: string;
    color?: string;
    weight?: string;
    weight_unit?: string;
  };
}

class VariantService {
  // Lấy danh sách variants của sản phẩm
  async getProductVariants(productId: number): Promise<{ success: boolean; data: ProductVariant[] }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProductVariant[] }>(`/products/${productId}/variants`);
      return response;
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách variants');
    }
  }

  // Thêm variant mới
  async addProductVariant(
    productId: number,
    variantDto: CreateVariantDto
  ): Promise<{ success: boolean; message: string; data: ProductVariant }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: ProductVariant }>(`/products/${productId}/variants`, variantDto);
      return response;
    } catch (error: any) {
      console.error('Error adding variant:', error);
      throw new Error(error.response?.data?.message || 'Không thể thêm variant');
    }
  }

  // Cập nhật variant
  async updateVariant(
    variantId: number,
    variantDto: UpdateVariantDto
  ): Promise<{ success: boolean; message: string; data: ProductVariant }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string; data: ProductVariant }>(`/variants/${variantId}`, variantDto);
      return response;
    } catch (error: any) {
      console.error('Error updating variant:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật variant');
    }
  }

  // Xóa variant
  async deleteVariant(variantId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/variants/${variantId}`);
      return response;
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa variant');
    }
  }
}

export const variantService = new VariantService();
