import type { AxiosResponse } from "axios";
import api, { publicApi } from "../client";

export type AppealStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type AppealDto = {
  id: number;
  userId: number | null;
  email: string;
  reason: string;
  status: AppealStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

type ApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
  metadata: Record<string, unknown> | null;
};

export const appealsAPI = {
  submitAuthenticated: (reason: string): Promise<AxiosResponse<ApiEnvelope<AppealDto>>> =>
    api.post("/users/me/appeal", { reason }),

  submitPublic: (email: string, reason: string): Promise<AxiosResponse<ApiEnvelope<AppealDto>>> =>
    publicApi.post("/public/appeals", { email, reason }),

  adminList: (params: {
    status?: AppealStatus;
    page?: number;
    size?: number;
  }): Promise<AxiosResponse<ApiEnvelope<unknown>>> =>
    api.get("/admin/appeals", {
      params: {
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: "createdAt,DESC",
      },
    }),

  adminReview: (
    appealId: number,
    body: { status: AppealStatus; adminNote?: string },
  ): Promise<AxiosResponse<ApiEnvelope<AppealDto>>> =>
    api.patch(`/admin/appeals/${appealId}`, body),
};
