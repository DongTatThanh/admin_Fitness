import { apiClient } from '../lib/api_client';

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPost {
  id: number;
  category_id: number;
  category?: BlogCategory | null;
  title: string;
  slug: string;
  thumbnail?: string;
  content: string;
  author: string;
  is_featured?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePostDto {
  category_id: number;
  title: string;
  slug: string;
  thumbnail?: string;
  content: string;
  author: string;
  is_featured?: number;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {}

export interface PostsListResponse {
  data: BlogPost[];
  total: number;
  page: number;
  lastPage: number;
}

class PostsService {
  async getAdminPosts(params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    isFeatured?: number;
  }): Promise<PostsListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.categoryId !== undefined) query.append('categoryId', params.categoryId.toString());
    if (params.isFeatured !== undefined) query.append('isFeatured', params.isFeatured.toString());

    const qs = query.toString();
    const endpoint = qs ? `/posts/admin?${qs}` : '/posts/admin';
    return await apiClient.get<PostsListResponse>(endpoint);
  }

  async getPostById(postId: number): Promise<BlogPost> {
    return await apiClient.get<BlogPost>(`/posts/admin/${postId}`);
  }

  async createPost(data: CreatePostDto): Promise<any> {
    return await apiClient.post('/posts/admin', data);
  }

  async updatePost(postId: number, data: UpdatePostDto): Promise<any> {
    return await apiClient.put(`/posts/admin/${postId}`, data);
  }

  async deletePost(postId: number): Promise<any> {
    return await apiClient.delete(`/posts/admin/${postId}`);
  }

  async getAdminCategories(search?: string): Promise<BlogCategory[]> {
    const endpoint = search ? `/posts/admin/categories?search=${encodeURIComponent(search)}` : '/posts/admin/categories';
    const response = await apiClient.get<{ data: BlogCategory[] } | BlogCategory[]>(endpoint);
    if (Array.isArray(response)) {
      return response;
    }
    return response.data ?? [];
  }
}

export const postsService = new PostsService();
export default postsService;

