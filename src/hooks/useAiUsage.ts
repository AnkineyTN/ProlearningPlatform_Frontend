import { useQuery } from '@tanstack/react-query';
import { aiUsageAPI } from '@/services/endpoints/ai-usage';

export const aiUsageKeys = {
  all: ['ai-usage'] as const,
};

export function useAiUsage() {
  return useQuery({
    queryKey: aiUsageKeys.all,
    queryFn: () => aiUsageAPI.getUsage().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });
}
