import { apiClient } from '../lib/api_client';

// Brand interfaces
export interface CreateBrandDto {
  name: string;
  slug: string ,
  country?: string;
  description?: string;
  logo_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  slug?: string;
  country?: string;
  description?: string;
  logo_url?: string;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface UpdateBrandStatusDto {
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  country?: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  products_count?: number;
  products?: any[];
}

export interface BrandAdminQueryDto {
  search?: string;
  page?: number;
  limit?: number;
  is_active?: 'true' | 'false';
  is_featured?: 'true' | 'false';
  sortBy?: string;

}

export interface BrandsListResponse {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class BrandService {
  // Tạo brand mới (Admin)
  async createBrand(brandData: CreateBrandDto): Promise<any> {
    return await apiClient.post('/brands/admin', brandData);
  }

  // Cập nhật brand (Admin)
  async updateBrand(brandId: number, brandData: UpdateBrandDto): Promise<any> {
    return await apiClient.put(`/brands/admin/${brandId}`, brandData);
  }

  // Xóa brand (Admin)
  async deleteBrand(brandId: number): Promise<any> {
    return await apiClient.delete(`/brands/admin/${brandId}`);
  }

  // Lấy danh sách brands cho admin với phân trang và filter
  async getAdminBrands(params: {
    search?: string;
    page?: number;
    limit?: number;
    is_active?: 'true' | 'false';
    is_featured?: 'true' | 'false';
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<BrandsListResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active);
    if (params.is_featured !== undefined) queryParams.append('is_featured', params.is_featured);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    return await apiClient.get<BrandsListResponse>(
      `/brands/admin?${queryParams.toString()}`
    );
  }

  // Lấy chi tiết brand với stats (Admin)
  async getBrandDetails(brandId: number): Promise<Brand> {
    return await apiClient.get<Brand>(`/brands/admin/${brandId}`);
  }

  // Cập nhật trạng thái brand (Admin)
  async updateBrandStatus(brandId: number, isActive: boolean): Promise<any> {
    return await apiClient.patch(`/brands/admin/${brandId}/status`, { is_active: isActive });
  }

  // Cập nhật logo brand (Admin)
  async updateBrandLogo(brandId: number, logoUrl: string): Promise<any> {
    return await apiClient.patch(`/brands/admin/${brandId}/logo`, { logo_url: logoUrl });
  }
}

export const brandService = new BrandService();
export default brandService;
