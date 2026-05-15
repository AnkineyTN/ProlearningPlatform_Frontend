import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  AdminApiEnvelope,
  AdminBlockUserRequest,
  AdminDirectoryUser,
  AdminUpdateUserRequest,
  AdminUserDirectoryRow,
  AdminUserStats,
} from '../types/adminUsers.types';

function extractRows(data: unknown): AdminUserDirectoryRow[] {
  if (Array.isArray(data)) return data as AdminUserDirectoryRow[];
  if (
    data &&
    typeof data === 'object' &&
    'content' in data &&
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
    keyword?: string;
    accountType?: string;
  }): Promise<AxiosResponse<AdminApiEnvelope<unknown>>> =>
    api.get('/admin/users', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'id,DESC',
        ...(params.keyword ? { keyword: params.keyword } : {}),
        ...(params.accountType ? { accountType: params.accountType } : {}),
      },
    }),

  update: (
    userId: number,
    body: AdminUpdateUserRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminDirectoryUser>>> =>
    api.patch(`/admin/users/${userId}`, body),

  delete: (userId: number): Promise<AxiosResponse<AdminApiEnvelope<unknown>>> =>
    api.delete(`/admin/users/${userId}`),

  blockUser: (
    userId: number,
    body: AdminBlockUserRequest,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminDirectoryUser>>> =>
    api.post(`/admin/users/${userId}/block`, body),

  unblockUser: (
    userId: number,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminDirectoryUser>>> =>
    api.post(`/admin/users/${userId}/unblock`),

  listBlocked: (params: {
    page?: number;
    size?: number;
  }): Promise<AxiosResponse<AdminApiEnvelope<unknown>>> =>
    api.get('/admin/users/blocked', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: 'id,DESC',
      },
    }),

  getUserStats: (
    userId: number,
  ): Promise<AxiosResponse<AdminApiEnvelope<AdminUserStats>>> =>
    api.get(`/admin/users/${userId}/stats`),
};

export function extractAdminUsersList(data: unknown): AdminUserDirectoryRow[] {
  return extractRows(data);
}
