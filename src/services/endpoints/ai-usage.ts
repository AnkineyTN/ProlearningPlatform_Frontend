import api from '@/services/client';
import type { ApiResponse } from '@/services/types/auth.types';
import type { AiUsageData } from '@/services/types/ai-usage.types';

export const aiUsageAPI = {
  getUsage: () => api.get<ApiResponse<AiUsageData>>('/users/me/ai-usage'),
};
