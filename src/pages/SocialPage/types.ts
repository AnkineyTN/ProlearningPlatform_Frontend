import type { SocialNote } from '@/services/types/social.types';

export type SectionType = 'NOTE' | 'FLASHCARD' | 'EXAM';
export type FilterType = 'all' | SectionType;
export type SortType = 'trending' | 'recent' | 'liked';

export type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

export type SectionState = {
  items: SocialNote[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  page: number;
};

export const DEFAULT_SECTION: SectionState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
  page: 0,
};
