import { apiClient } from '../lib/api_client';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminProfile {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
}

export interface AdminLoginResponse {
  access_token: string;
  admin?: AdminProfile;
  message?: string;
}

class AdminAuthService {
  private readonly TOKEN_KEY = 'admin_token';
  private readonly ADMIN_KEY = 'admin_profile';

  // Lưu token vào localStorage
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Xóa token
  removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
  }

  // Lưu thông tin admin
  setAdmin(admin: AdminProfile) {
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(admin));
  }

  // Lấy thông tin admin
  getAdmin(): AdminProfile | null {
    const adminStr = localStorage.getItem(this.ADMIN_KEY);
    if (!adminStr) return null;
    try {
      return JSON.parse(adminStr);
    } catch {
      return null;
    }
  }

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Login
  async login(credentials: AdminLoginDto): Promise<AdminLoginResponse> {
    const response = await apiClient.post<AdminLoginResponse>(
      '/admin/auth/login',
      credentials
    );
    
    if (response.access_token) {
      this.setToken(response.access_token);
      if (response.admin) {
        this.setAdmin(response.admin);
      }
    }
    
    return response;
  }

  // Logout
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await apiClient.post('/admin/auth/logout', {}, {
          Authorization: `Bearer ${token}`
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this.removeToken();
  }

  // Lấy profile admin
  async getProfile(): Promise<AdminProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await apiClient.get<AdminProfile>(
      '/admin/auth/profile',
      {
        Authorization: `Bearer ${token}`
      }
    );

    this.setAdmin(response);
    return response;
  }

  // Lấy thông tin admin hiện tại (me)
  async getMe(): Promise<AdminProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await apiClient.get<AdminProfile>(
      '/admin/auth/me',
      {
        Authorization: `Bearer ${token}`
      }
    );

    this.setAdmin(response);
    return response;
  }
}

export const adminAuthService = new AdminAuthService();
export default adminAuthService;

