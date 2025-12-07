import { OrderStatus } from '../services/orders.service';

// API Configuration với fallback values
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
                     import.meta.env.VITE_API_URL || 
                     'http://localhost:3201';

const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000;

// API Client với error handling
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Lấy admin token từ localStorage nếu có
    const adminToken = localStorage.getItem('admin_token');
    const defaultHeaders: Record<string, string> = {};
    
    // Kiểm tra xem headers đã có Authorization chưa
    const existingHeaders = options.headers as Record<string, string> | undefined;
    if (adminToken && !existingHeaders?.['Authorization']) {
      defaultHeaders['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const isFormData = options.body instanceof FormData;
    const config: RequestInit = {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...defaultHeaders,
        ...options.headers,
      },
    };

    console.log('API Request:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        
        // Chỉ log error nếu không phải là 404 variants endpoint (tính năng optional)
        if (!(response.status === 404 && endpoint.includes('/variants'))) {
          console.error('API Request failed:', errorMessage);
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Không log lỗi cho variants endpoint 404 (tính năng optional)
      if (!(error instanceof Error && error.message.includes('Cannot GET') && endpoint.includes('/variants'))) {
        console.error('API Request failed:', error);
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const isFormData = data instanceof FormData;
    const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      headers: isFormData ? headers : { 'Content-Type': 'application/json', ...headers },
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  // POST FormData request (for uploads)
  async postForm<T>(endpoint: string, formData: FormData, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper function để tạo URL đầy đủ cho ảnh
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '/placeholder.png';
  
  // Nếu là URL đầy đủ (http/https)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Nếu là đường dẫn tương đối, thêm API_BASE_URL
  // Đảm bảo không có dấu / kép
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  const fullUrl = `${baseUrl}${path}`;
  console.log('Image URL:', { original: imageUrl, full: fullUrl });
  
  return fullUrl;
};

// Export API_BASE_URL for other services
export { API_BASE_URL, API_TIMEOUT };

// Re-export OrderStatus for convenience
export { OrderStatus };
