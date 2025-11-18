import { apiClient } from '../lib/api_client';

export interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    filename: string;
    url: string;
    size: number;
    mimetype: string;
    originalName: string;
  };
}

class UploadService {
  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.postForm<UploadResponse>('/uploads/image', formData);
  }
}

export const uploadService = new UploadService();
export default uploadService;

