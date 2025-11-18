                  import { apiClient } from '../lib/api_client';

// Category interfaces
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  sort_order?: number;
  status?: 'active' | 'inactive';
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  sort_order?: number;
  is_active: number; // Backend returns 0 or 1
  created_at: string;
  updated_at?: string;
  products?: any[];
}

export interface CategoriesListResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class CategoriesService {
  

 

  // Lấy danh sách categories cho admin với phân trang
  async getAllCategoriesAdmin(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }): Promise<CategoriesListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    return await apiClient.get<CategoriesListResponse>(
      `/categories/admin/list/all?${queryParams.toString()}`
    );
  }

  // Lấy chi tiết category cho admin
  async getCategoryByIdAdmin(categoryId: number): Promise<Category> {
    return await apiClient.get<Category>(`/categories/admin/${categoryId}`);
  }

  // Tạo category mới (Admin)
  async createCategory(categoryData: CreateCategoryDto): Promise<any> {
    return await apiClient.post('/categories/admin', categoryData);
  }

  // Cập nhật category (Admin)
  async updateCategory(categoryId: number, categoryData: UpdateCategoryDto): Promise<any> {
    return await apiClient.put(`/categories/admin/${categoryId}`, categoryData);
  }

  // Xóa category (Admin)
  async deleteCategory(categoryId: number): Promise<any> {
    return await apiClient.delete(`/categories/admin/${categoryId}`);
  }

  // Kiểm tra slug đã tồn tại chưa
  async checkSlugExists(slug: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/categories/check-slug/${slug}`);
      return (response as any).exists || false;
    } catch (error) {
      console.error('Error checking slug:', error);
      return false;
    }
  }
}

export const categoriesService = new CategoriesService();
export default categoriesService;
