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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    console.log('POST request data before stringify:', data);
    const bodyString = data ? JSON.stringify(data) : undefined;
    console.log('POST request body string:', bodyString);
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: bodyString,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    console.log('PUT request data before stringify:', data);
    const bodyString = data ? JSON.stringify(data) : undefined;
    console.log('PUT request body string:', bodyString);
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: bodyString,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
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
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
};

// Export API_BASE_URL for other services
export { API_BASE_URL, API_TIMEOUT };

// Re-export OrderStatus for convenience
export { OrderStatus };
