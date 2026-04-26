import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  ActivityLogRequest,
  ActivitySummary,
  HeatmapDay,
  StreakData,
} from "@/services/types/activityLog.types";
import type { ApiResponse } from "@/services/types/auth.types";

export const activityLogAPI = {
  logActivity: (
    data: ActivityLogRequest,
  ): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/activity-log", data, { keepalive: true } as never),

  getHeatmap: (
    months = 6,
  ): Promise<AxiosResponse<ApiResponse<HeatmapDay[]>>> =>
    api.get("/activity-log/heatmap", { params: { months } }),

  getStreak: (): Promise<AxiosResponse<ApiResponse<StreakData>>> =>
    api.get("/activity-log/streak"),

  getSummary: (
    days = 30,
  ): Promise<AxiosResponse<ApiResponse<ActivitySummary>>> =>
    api.get("/activity-log/summary", { params: { days } }),
};
