import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  CreateSoundRequest,
  CreateSpaceRequest,
  PaginatedResponse,
  PomodoroResponse,
  PomodoroSetting,
  SearchParams,
  SessionRequest,
  SoundDto,
  SpaceDto,
  WeeklyStats,
} from "../types/pomodoro.types";

const buildSearchParams = (params: SearchParams = {}) => {
  const out: Record<string, string | number> = {};
  if (params.keyword) out.keyword = params.keyword;
  if (params.tab) out.tab = params.tab;
  if (params.source) out.source = params.source;
  if (params.page !== undefined) out.page = params.page;
  if (params.size !== undefined) out.size = params.size;
  if (params.sortBy) out.sortBy = params.sortBy;
  if (params.sortDir) out.sortDir = params.sortDir;
  return out;
};

export const pomodoroAPI = {
  // ── Settings ────────────────────────────────────────────────
  getSetting: (): Promise<AxiosResponse<PomodoroResponse<PomodoroSetting>>> =>
    api.get("/pomodoro/setting"),

  updateSetting: (
    data: PomodoroSetting,
  ): Promise<AxiosResponse<PomodoroResponse<PomodoroSetting>>> =>
    api.put("/pomodoro/setting", data),

  // ── Spaces ──────────────────────────────────────────────────
  searchSpaces: (
    params: SearchParams = {},
  ): Promise<AxiosResponse<PaginatedResponse<SpaceDto>>> =>
    api.get("/pomodoro/spaces/search", { params: buildSearchParams(params) }),

  createSpace: (
    data: CreateSpaceRequest,
  ): Promise<AxiosResponse<PomodoroResponse<SpaceDto>>> =>
    api.post("/pomodoro/spaces", data),

  deleteSpace: (spaceId: number): Promise<AxiosResponse<void>> =>
    api.delete(`/pomodoro/spaces/${spaceId}`),

  toggleFavoriteSpace: (spaceId: number): Promise<AxiosResponse<void>> =>
    api.post(`/pomodoro/spaces/${spaceId}/favorite`),

  // ── Sounds ──────────────────────────────────────────────────
  searchSounds: (
    params: SearchParams = {},
  ): Promise<AxiosResponse<PaginatedResponse<SoundDto>>> =>
    api.get("/pomodoro/sounds/search", { params: buildSearchParams(params) }),

  createSound: (
    data: CreateSoundRequest,
  ): Promise<AxiosResponse<PomodoroResponse<SoundDto>>> =>
    api.post("/pomodoro/sounds", data),

  deleteSound: (soundId: number): Promise<AxiosResponse<void>> =>
    api.delete(`/pomodoro/sounds/${soundId}`),

  toggleFavoriteSound: (soundId: number): Promise<AxiosResponse<void>> =>
    api.post(`/pomodoro/sounds/${soundId}/favorite`),

  // ── Sessions & Stats ────────────────────────────────────────
  recordSession: (data: SessionRequest): Promise<AxiosResponse<void>> =>
    api.post("/pomodoro/sessions", data),

  getWeeklyStats: (
    startDate: string,
    timezone?: string,
  ): Promise<AxiosResponse<PomodoroResponse<WeeklyStats>>> =>
    api.get("/pomodoro/stats/weekly", {
      params: { startDate, ...(timezone ? { timezone } : {}) },
    }),
};

// ── Asset upload (Cloudinary 3-step flow) ─────────────────────
export const pomodoroUploadAPI = {
  getSignature: (
    type: "IMAGE" | "VIDEO" | "AUDIO",
  ): Promise<
    AxiosResponse<
      PomodoroResponse<{
        assetId: number;
        signature: string;
        timestamp: number;
        apiKey: string;
        cloudName: string;
        uploadPreset: string;
        uploadResourceType: string;
      }>
    >
  > => api.get(`/assets/signature/${type}`),

  confirmUpload: (data: {
    assetId: number;
    publicId: string;
    url: string;
    fileName: string;
  }): Promise<AxiosResponse<void>> =>
    api.post("/assets/update-uploaded-asset", data),
};
