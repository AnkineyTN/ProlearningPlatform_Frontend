import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  AdminApiEnvelope,
  AdminPlatformStats,
} from '../types/adminUsers.types';

export const adminStatsAPI = {
  getPlatformStats: (): Promise<
    AxiosResponse<AdminApiEnvelope<AdminPlatformStats>>
  > => api.get('/admin/stats'),
};
