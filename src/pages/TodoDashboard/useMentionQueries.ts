import { useInfiniteQuery } from '@tanstack/react-query';
import { setAPI } from '@/services/endpoints/sets';
import { searchAPI } from '@/services/endpoints/search';
import { PAGE_SIZE, SEARCH_TYPE_MAP } from './utils/mentionTypes';
import type { MentionResourceType } from './utils/mentionTypes';
import { extractSearchMeta } from './utils/mentionHelpers';

// ─── Sub-query: Sets (setAPI, infinite scroll) ────────────────────────────────
export const useSetMentionQuery = (searchQuery: string, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: ['mention-sets', searchQuery],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      setAPI.getSetData({
        page: pageParam as number,
        size: PAGE_SIZE,
        sort: [{ property: 'id', direction: 'DESC' }],
        q: searchQuery || undefined,
      }),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const meta = lastPage.data.metadata;
      return meta && (lastPageParam as number) + 1 < meta.totalPages
        ? (lastPageParam as number) + 1
        : undefined;
    },
    enabled,
    staleTime: 30_000,
  });

// ─── Sub-query: Note / Flashcard / Exam (searchAPI, infinite scroll) ──────────
export const useSearchMentionQuery = (
  type: MentionResourceType,
  searchQuery: string,
  enabled: boolean,
) =>
  useInfiniteQuery({
    queryKey: ['mention-search', type, searchQuery],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await searchAPI.search({
        keyword: searchQuery,
        searchType: SEARCH_TYPE_MAP[type],
        page: pageParam as number,
        size: PAGE_SIZE,
      });
      return res.data;
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const meta = extractSearchMeta(lastPage);
      return meta && (lastPageParam as number) + 1 < meta.totalPages
        ? (lastPageParam as number) + 1
        : undefined;
    },
    enabled: enabled && searchQuery.length > 0,
    staleTime: 30_000,
  });
