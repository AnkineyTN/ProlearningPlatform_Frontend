import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  ImageSignatureResponse,
  ImageUploadFromUrlRequest,
  ImageUploadFromUrlResponse,
  ImageUploadCallbackRequest,
  ImageUploadCallbackResponse,
} from "../types/image.types";

export const imageAPI = {
  // Get signature để upload file
  getUploadSignature: (): Promise<AxiosResponse<ImageSignatureResponse>> =>
    api.get("/images/signature"),

  // Upload từ URL
  uploadFromUrl: (
    data: ImageUploadFromUrlRequest,
  ): Promise<AxiosResponse<ImageUploadFromUrlResponse>> =>
    api.post("/images/upload-from-url", data),

  // Callback sau khi upload file thành công
  uploadCallback: (
    data: ImageUploadCallbackRequest,
  ): Promise<AxiosResponse<ImageUploadCallbackResponse>> =>
    api.post("/images/update-uploaded-image", data),
};
