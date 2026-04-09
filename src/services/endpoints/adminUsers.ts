import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  AdminApiEnvelope,
  AdminDirectoryUser,
  AdminUpdateUserRequest,
  AdminUserDirectoryRow,
} from "../types/adminUsers.types";

function extractRows(data: unknown): AdminUserDirectoryRow[] {
  if (Array.isArray(data)) return data as AdminUserDirectoryRow[];
  if (
    data &&
    typeof data === "object" &&
    "content" in data &&
    Array.isArray((data as { content: unknown }).content)
  ) {
    return (data as { content: AdminUserDirectoryRow[] }).content;
  }
  return [];
}

export const adminUsersAPI = {
  list: (params: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<AxiosResponse<AdminApiEnvelope<unknown>>> =>
    api.get("/admin/users", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "id,DESC",
      },
    }),

  update: (
    userId: number,
    body: AdminUpdateUserRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminDirectoryUser>>> =>
    api.patch(`/admin/users/${userId}`, body),

  delete: (
    userId: number,
  ): Promise<AxiosResponse<AdminApiEnvelope<unknown>>> =>
    api.delete(`/admin/users/${userId}`),
};

export function extractAdminUsersList(data: unknown): AdminUserDirectoryRow[] {
  return extractRows(data);
}
