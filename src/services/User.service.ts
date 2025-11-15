import { apiClient } from '../lib/api_client';

// User interfaces
export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role_id?: number;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  role_id?: number;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  phone?: string;
  full_name?: string;
  role_id?: number;
  customer_tier_id?: number;
  created_at: string;
  updated_at?: string;
  is_active?: number;
}

export interface UsersListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class UserService {
  // Lấy danh sách tất cả người dùng với phân trang
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
  }): Promise<UsersListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);

    return await apiClient.get<UsersListResponse>(
      `/users/admin/list/all?${queryParams.toString()}`
    );
  }

  // Lấy thông tin chi tiết một người dùng
  async getUserById(userId: number): Promise<User> {
    return await apiClient.get<User>(`/users/admin/${userId}`);
  }

  // Tạo người dùng mới
  async createUser(userData: CreateUserDto): Promise<any> {
    return await apiClient.post('/users/admin/createUser', userData);
  }

  // Cập nhật thông tin người dùng
  async updateUser(userId: number, userData: UpdateUserDto): Promise<any> {
    return await apiClient.put(`/users/admin/${userId}`, userData);
  }

  // Xóa người dùng
  async deleteUser(userId: number): Promise<any> {
    return await apiClient.delete(`/users/admin/${userId}`);
  }

  // Kiểm tra username đã tồn tại chưa
  async checkUsernameExists(username: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/users/check-username/${username}`);
      return (response as any).exists || false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  // Kiểm tra email đã tồn tại chưa
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiClient.get(`/users/check-email/${email}`);
      return (response as any).exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }
}

export const userService = new UserService();
export default userService;