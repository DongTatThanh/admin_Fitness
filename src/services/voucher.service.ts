import { apiClient } from '../lib/api_client';

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';
export type ApplicableType = 'all' | 'products' | 'categories' | 'brands';

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string;
  type: DiscountType; // Backend field name
  value: string; // Backend returns string
  maximum_discount_amount?: string | null;
  minimum_order_amount?: string;
  usage_limit?: number | null;
  used_count: number;
  usage_limit_per_customer?: number;
  start_date: string;
  end_date: string;
  applicable_to: string; // Backend field name
  applicable_items?: number[] | null;
  image?: string;
  is_active: number; // Backend returns 0/1
  created_at: string;
  updated_at: string;
}

export interface CreateVoucherDto {
  code: string;
  name: string;
  description?: string;
  discount_type: DiscountType; // DTO field name
  discount_value: number; // DTO field name
  max_discount_amount?: number;
  min_order_value?: number; // DTO field name
  usage_limit?: number;
  usage_limit_per_customer?: number;
  start_date: string;
  end_date: string;
  applicable_type?: string; // DTO field name
  applicable_items?: any; // DTO field name
  image_url?: string; // DTO field name
  is_active?: boolean;
}

export interface UpdateVoucherDto {
  code?: string;
  name?: string;
  description?: string;
  discount_type?: DiscountType; // DTO field name
  discount_value?: number; // DTO field name
  max_discount_amount?: number;
  min_order_value?: number; // DTO field name
  usage_limit?: number;
  usage_limit_per_customer?: number;
  start_date?: string;
  end_date?: string;
  applicable_type?: string; // DTO field name
  applicable_items?: any; // DTO field name
  image_url?: string; // DTO field name
  is_active?: boolean;
}

export interface ValidateVoucherDto {
  code: string;
  order_value: number;
  customer_id?: number;
  product_ids?: number[];
  category_ids?: number[];
  brand_ids?: number[];
}

class VoucherService {
  // Lấy tất cả voucher
  async getAllVouchers(): Promise<{ success: boolean; data: Voucher[] }> {
    try {
      const response = await apiClient.get<Voucher[]>('/discount-codes');
      // Backend returns array directly, not wrapped in {value: [], Count: ...}
      return { success: true, data: Array.isArray(response) ? response : [] };
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách voucher');
    }
  }

  // Lấy voucher còn hiệu lực
  async getActiveVouchers(): Promise<{ success: boolean; data: Voucher[] }> {
    try {
      const response = await apiClient.get<Voucher[]>('/discount-codes/active');
      // Backend returns array directly
      return { success: true, data: Array.isArray(response) ? response : [] };
    } catch (error: any) {
      console.error('Error fetching active vouchers:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy voucher còn hiệu lực');
    }
  }

  // Tìm voucher theo mã
  async getVoucherByCode(code: string): Promise<{ success: boolean; data: Voucher }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Voucher }>(`/discount-codes/${code}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching voucher by code:', error);
      throw new Error(error.response?.data?.message || 'Không tìm thấy voucher');
    }
  }

  // Tạo voucher mới
  async createVoucher(data: CreateVoucherDto): Promise<{ success: boolean; message: string; data: Voucher }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: Voucher }>('/discount-codes', data);
      return response;
    } catch (error: any) {
      console.error('Error creating voucher:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo voucher');
    }
  }

  // Validate và sử dụng voucher
  async validateVoucher(data: ValidateVoucherDto): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: any }>('/discount-codes/validate', data);
      return response;
    } catch (error: any) {
      console.error('Error validating voucher:', error);
      throw new Error(error.response?.data?.message || 'Voucher không hợp lệ');
    }
  }

  // Cập nhật voucher
  async updateVoucher(id: number, data: UpdateVoucherDto): Promise<{ success: boolean; message: string; data: Voucher }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string; data: Voucher }>(`/discount-codes/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Error updating voucher:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật voucher');
    }
  }

  // Xóa mềm voucher
  async deleteVoucher(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/discount-codes/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error deleting voucher:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa voucher');
    }
  }

  // Xóa cứng voucher
  async hardDeleteVoucher(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(`/discount-codes/${id}/hard`);
      return response;
    } catch (error: any) {
      console.error('Error hard deleting voucher:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa vĩnh viễn voucher');
    }
  }
}

export const voucherService = new VoucherService();
