import { useState, useCallback } from 'react';
import { uploadService } from '../services/upload.service';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const response = await uploadService.uploadImage(file);
      return response.data.url;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Upload ảnh thất bại');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadImage,
    uploading,
    error,
    resetError: () => setError(null),
  };
}

export function useMultipleImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadMultipleImages = useCallback(async (files: File[]) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const response = await uploadService.uploadImage(file);
        setProgress(Math.round(((index + 1) / files.length) * 100));
        return response.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err: any) {
      console.error('Error uploading images:', err);
      setError(err.message || 'Upload ảnh thất bại');
      throw err;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  return {
    uploadMultipleImages,
    uploading,
    error,
    progress,
    resetError: () => setError(null),
  };
}

export default useImageUpload;

