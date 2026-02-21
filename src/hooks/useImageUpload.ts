// hooks/useImageUpload.ts
import { useMutation } from "@tanstack/react-query";
import { imageAPI } from "@/services/endpoints/image";
import axios from "axios";

// Hook để upload file
export const useUploadImageFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      // Bước 1: Lấy signature
      const signatureResponse = await imageAPI.getUploadSignature();
      const { signature, timestamp, apiKey, cloudName, assetId, uploadPreset } =
        signatureResponse.data.data;

      // Bước 2: Upload lên Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );

      const { secure_url, public_id } = cloudinaryResponse.data;

      // Bước 3: Gọi callback để verify
      const callbackResponse = await imageAPI.uploadCallback({
        assetId,
        publicId: public_id,
        url: secure_url,
      });
      console.log(
        "🚀 ~ useUploadImageFile ~ callbackResponse:",
        callbackResponse,
      );

      return {
        url: secure_url,
        assetId,
        publicId: public_id,
      };
    },
    onError: (error: any) => {
      console.error("Error uploading image file:", error);
    },
  });
};

// Hook để upload từ URL
export const useUploadImageFromUrl = () => {
  return useMutation({
    mutationFn: async (sourceUrl: string) => {
      const response = await imageAPI.uploadFromUrl({ sourceUrl });
      return response.data.data;
    },
    onError: (error: any) => {
      console.error("Error uploading image from URL:", error);
    },
  });
};
