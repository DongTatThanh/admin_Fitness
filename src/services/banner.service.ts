import { apiClient } from '../lib/api_client';

// ============== INTERFACES ==============
export interface Banner {
  id: number;
  name: string;
  image_url: string;
  link_url?: string;
  link_target?: '_self' | '_blank' | '_parent' | '_top';
  position: number; // 1=Header, 2=Sidebar, 3=Footer, 4=Home Page
  sort_order: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBannerDto {
  name: string;
  image_url?: string;
  link_url?: string;
  link_target?: '_self' | '_blank' | '_parent' | '_top';
  position: number;
  sort_order?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  created_by?: number;
}

export interface UpdateBannerDto {
  name?: string;
  image_url?: string;
  link_url?: string;
  link_target?: '_self' | '_blank' | '_parent' | '_top';
  position?: number;
  sort_order?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface BannerListResponse {
  data: Banner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============== SERVICE ==============
class BannerService {
  private baseUrl = '/banners';

  // Admin: Lấy danh sách banner với phân trang và filter
  async getAdminBanners(
    page: number = 1,
    limit: number = 20,
    position?: number,
    is_active?: boolean
  ): Promise<BannerListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (position !== undefined) {
      params.append('position', position.toString());
    }
    
    if (is_active !== undefined) {
      params.append('is_active', is_active.toString());
    }

    return await apiClient.get<BannerListResponse>(`${this.baseUrl}/admin/list?${params}`);
  }

  // Admin: Lấy chi tiết banner
  async getBannerById(id: number): Promise<Banner> {
    return await apiClient.get<Banner>(`${this.baseUrl}/admin/${id}`);
  }

  // Admin: Tạo banner mới (với upload ảnh)
  async createBanner(formData: FormData): Promise<any> {
    return await apiClient.post<any>(`${this.baseUrl}/admin`, formData);
  }

  // Admin: Cập nhật banner (với upload ảnh nếu có)
  async updateBanner(id: number, formData: FormData): Promise<any> {
    return await apiClient.put<any>(`${this.baseUrl}/admin/${id}`, formData);
  }

  // Admin: Xóa banner
  async deleteBanner(id: number): Promise<any> {
    return await apiClient.delete<any>(`${this.baseUrl}/admin/${id}`);
  }

  // Admin: Bật/tắt trạng thái banner
  async toggleActive(id: number): Promise<any> {
    return await apiClient.put<any>(`${this.baseUrl}/admin/${id}/toggle-active`, {});
  }

  // Public: Lấy banner theo vị trí
  async getBannersByPosition(position: number): Promise<Banner[]> {
    return await apiClient.get<Banner[]>(`${this.baseUrl}/position/${position}`);
  }

  // Public: Lấy tất cả banner active
  async getAllBanners(): Promise<Banner[]> {
    return await apiClient.get<Banner[]>(this.baseUrl);
  }
}

export const bannerService = new BannerService();
