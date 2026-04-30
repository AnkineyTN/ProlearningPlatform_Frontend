import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { pomodoroAPI, pomodoroUploadAPI } from "@/services/endpoints/pomodoro";
import type {
  CreateSoundRequest,
  CreateSpaceRequest,
  PomodoroSetting,
  SearchParams,
  SessionRequest,
} from "@/services/types/pomodoro.types";

// Helpers — backend may wrap responses with { status, data, ... } or return raw.
const unwrap = <T>(payload: unknown): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>) &&
    (payload as { data: unknown }).data &&
    typeof (payload as { data: unknown }).data === "object" &&
    !Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

// ── Settings ────────────────────────────────────────────────
export const usePomodoroSetting = () =>
  useQuery({
    queryKey: ["pomodoro", "setting"],
    queryFn: async () => {
      const res = await pomodoroAPI.getSetting();
      return unwrap<PomodoroSetting>(res.data);
    },
  });

export const useUpdatePomodoroSetting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: PomodoroSetting) => {
      const res = await pomodoroAPI.updateSetting(data);
      return unwrap<PomodoroSetting>(res.data);
    },
    onSuccess: (data) => {
      qc.setQueryData(["pomodoro", "setting"], data);
    },
  });
};

// ── Spaces ──────────────────────────────────────────────────
export const useSpacesSearch = (params: SearchParams) =>
  useQuery({
    queryKey: ["pomodoro", "spaces", params],
    queryFn: async () => {
      const res = await pomodoroAPI.searchSpaces(params);
      return res.data;
    },
  });

export const useCreateSpace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSpaceRequest) => {
      const res = await pomodoroAPI.createSpace(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "spaces"] });
    },
  });
};

export const useDeleteSpace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pomodoroAPI.deleteSpace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "spaces"] });
    },
  });
};

export const useToggleFavoriteSpace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pomodoroAPI.toggleFavoriteSpace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "spaces"] });
    },
  });
};

// ── Sounds ──────────────────────────────────────────────────
export const useSoundsSearch = (params: SearchParams) =>
  useQuery({
    queryKey: ["pomodoro", "sounds", params],
    queryFn: async () => {
      const res = await pomodoroAPI.searchSounds(params);
      return res.data;
    },
  });

export const useCreateSound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSoundRequest) => {
      const res = await pomodoroAPI.createSound(data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "sounds"] });
    },
  });
};

export const useDeleteSound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pomodoroAPI.deleteSound(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "sounds"] });
    },
  });
};

export const useToggleFavoriteSound = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pomodoroAPI.toggleFavoriteSound(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "sounds"] });
    },
  });
};

// ── Sessions & Stats ────────────────────────────────────────
export const useRecordSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionRequest) => pomodoroAPI.recordSession(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pomodoro", "stats"] });
    },
  });
};

export const useWeeklyStats = (startDate: string, timezone?: string) =>
  useQuery({
    queryKey: ["pomodoro", "stats", "weekly", startDate, timezone],
    queryFn: async () => {
      const res = await pomodoroAPI.getWeeklyStats(startDate, timezone);
      return unwrap<import("@/services/types/pomodoro.types").WeeklyStats>(
        res.data,
      );
    },
    enabled: !!startDate,
  });

// ── Asset upload (Cloudinary 3-step flow) ─────────────────────
export const useUploadPomodoroAsset = () =>
  useMutation({
    mutationFn: async ({
      file,
      type,
    }: {
      file: File;
      type: "IMAGE" | "VIDEO" | "AUDIO";
    }) => {
      // Step 1
      const sigRes = await pomodoroUploadAPI.getSignature(type);
      const sig = unwrap<{
        assetId: number;
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        uploadPreset: string;
        uploadResourceType: string;
      }>(sigRes.data);

      // Step 2
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", sig.timestamp.toString());
      formData.append("signature", sig.signature);
      formData.append("upload_preset", sig.uploadPreset);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/${sig.uploadResourceType}/upload`,
        formData,
      );
      const { secure_url, public_id } = cloudRes.data;

      // Step 3
      await pomodoroUploadAPI.confirmUpload({
        assetId: sig.assetId,
        publicId: public_id,
        url: secure_url,
        fileName: file.name,
      });

      return {
        assetId: sig.assetId,
        url: secure_url,
        publicId: public_id,
      };
    },
  });
