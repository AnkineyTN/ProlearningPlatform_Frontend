// hooks/useImageUpload.ts
import { useMutation } from "@tanstack/react-query";
import { imageAPI } from "@/services/endpoints/image";
import axios from "axios";

// Hook để upload image file
export const useUploadImageFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      // Bước 1: Lấy signature
      const signatureResponse = await imageAPI.getUploadSignature("IMAGE");
      const {
        signature,
        timestamp,
        apiKey,
        cloudName,
        assetId,
        uploadPreset,
        uploadResourceType,
      } = signatureResponse.data.data;

      // Bước 2: Upload lên Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${uploadResourceType}/upload`,
        formData,
      );

      const { secure_url, public_id } = cloudinaryResponse.data;

      // Bước 3: Gọi callback để verify
      const callbackResponse = await imageAPI.uploadCallback({
        assetId,
        publicId: public_id,
        url: secure_url,
        fileName: file.name,
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
    onError: (error: unknown) => {
      console.error("Error uploading image file:", error);
    },
  });
};

// Hook để upload document file (PDF, DOC, TXT, etc.)
export const useUploadDocumentFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      // Bước 1: Lấy signature
      const signatureResponse = await imageAPI.getUploadSignature("DOCUMENT");
      const {
        signature,
        timestamp,
        apiKey,
        cloudName,
        assetId,
        uploadPreset,
        uploadResourceType,
      } = signatureResponse.data.data;

      // Bước 2: Upload lên Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${uploadResourceType}/upload`,
        formData,
      );

      const { secure_url, public_id } = cloudinaryResponse.data;

      // Bước 3: Gọi callback để verify
      const callbackResponse = await imageAPI.uploadCallback({
        assetId,
        publicId: public_id,
        url: secure_url,
        fileName: file.name,
      });
      console.log(
        "🚀 ~ useUploadDocumentFile ~ callbackResponse:",
        callbackResponse,
      );

      return {
        url: secure_url,
        assetId,
        publicId: public_id,
        fileName: file.name,
        extension: file.name.split(".").pop() || "",
      };
    },
    onError: (error: unknown) => {
      console.error("Error uploading document file:", error);
    },
  });
};

// Hook để upload từ URL
export const useUploadImageFromUrl = () => {
  return useMutation({
    mutationFn: async ({
      sourceUrl,
      assetType = "IMAGE",
    }: {
      sourceUrl: string;
      assetType?: "IMAGE" | "DOCUMENT";
    }) => {
      const response = await imageAPI.uploadFromUrl({ sourceUrl, assetType });
      return response.data.data;
    },
    onError: (error: unknown) => {
      console.error("Error uploading image from URL:", error);
    },
  });
};
