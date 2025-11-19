import { apiClient } from '../lib/api_client';

export interface ProductBrand {
  id: number;
  name: string;
  slug?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compare_price?: number;
  quantity?: number;
  inventory_quantity?: number;
  status: 'active' | 'inactive';
  featured_image?: string;
  gallery_images?: string[];
  short_description?: string;
  description?: string;
  is_featured?: boolean;
  brand_id?: number;
  category_id?: number;
  brand?: ProductBrand | null;
  category?: ProductCategory | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductDto {
  name: string;
  slug: string;
  sku: string;
  price: number;
  compare_price?: number;
  quantity: number;
  status?: 'active' | 'inactive';
  featured_image?: string;
  gallery_images?: string[];
  short_description?: string;
  description?: string;
  is_featured?: boolean;
  category_id?: number;
  brand_id?: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface ProductsListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class ProductsService {
  async getAdminProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
    category_id?: number;
    brand_id?: number;
  }): Promise<ProductsListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.category_id) query.append('category_id', params.category_id.toString());
    if (params.brand_id) query.append('brand_id', params.brand_id.toString());

    const qs = query.toString();
    const endpoint = qs ? `/products/admin/list?${qs}` : '/products/admin/list';
    return await apiClient.get<ProductsListResponse>(endpoint);
  }

  async getProductById(productId: number): Promise<Product> {
    return await apiClient.get<Product>(`/products/admin/${productId}`);
  }

  async createProduct(product: CreateProductDto): Promise<any> {
    return await apiClient.post('/products/admin', product);
  }

  async updateProduct(productId: number, product: UpdateProductDto): Promise<any> {
    return await apiClient.put(`/products/admin/${productId}`, product);
  }

  async deleteProduct(productId: number): Promise<any> {
    return await apiClient.delete(`/products/admin/${productId}`);
  }

  async getAllProducts(page: number = 1, limit: number = 1000): Promise<ProductsListResponse> {
    return await this.getAdminProducts({ page, limit });
  }

  async getProductVariants(productId: number): Promise<any> {
    return await apiClient.get(`/products/admin/${productId}/variants`);
  }
}

export const productsService = new ProductsService();
export default productsService;

