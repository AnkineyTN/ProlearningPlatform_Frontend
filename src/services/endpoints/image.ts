import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  ImageSignatureResponse,
  ImageUploadFromUrlRequest,
  ImageUploadFromUrlResponse,
  ImageUploadCallbackRequest,
  ImageUploadCallbackResponse,
} from '../types/image.types';

export const imageAPI = {
  // Get signature để upload file (IMAGE or DOCUMENT)
  getUploadSignature: (
    type: 'IMAGE' | 'DOCUMENT' = 'IMAGE',
  ): Promise<AxiosResponse<ImageSignatureResponse>> =>
    api.get(`/assets/signature/${type}`),

  // Upload từ URL
  uploadFromUrl: (
    data: ImageUploadFromUrlRequest,
  ): Promise<AxiosResponse<ImageUploadFromUrlResponse>> =>
    api.post('/assets/update-from-url', data),

  // Callback sau khi upload file thành công
  uploadCallback: (
    data: ImageUploadCallbackRequest,
  ): Promise<AxiosResponse<ImageUploadCallbackResponse>> =>
    api.post('/assets/update-uploaded-asset', data),
};
