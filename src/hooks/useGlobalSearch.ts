import { useQuery } from '@tanstack/react-query';

import { searchAPI } from '@/services/endpoints/search';
import type { SearchResourceType } from '@/services/types/search.types';

type UseGlobalSearchOptions = {
  searchType?: SearchResourceType;
  page?: number;
  size?: number;
  enabled?: boolean;
};

export function useGlobalSearch(
  keyword: string,
  options?: UseGlobalSearchOptions,
) {
  const trimmed = keyword.trim();

  return useQuery({
    queryKey: [
      'global-search',
      trimmed,
      options?.searchType,
      options?.page,
      options?.size,
    ],
    queryFn: async () => {
      const response = await searchAPI.search({
        keyword: trimmed,
        page: options?.page ?? 0,
        size: options?.size ?? 20,
        searchType: options?.searchType,
      });
      return response.data;
    },
    enabled: Boolean(trimmed.length > 0) && (options?.enabled !== false),
    staleTime: 30 * 1000,
  });
}
