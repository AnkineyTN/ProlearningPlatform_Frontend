export type SearchResourceType = 'SET' | 'NOTE' | 'FLASHCARD' | 'EXAM';

export type GlobalSearchParams = {
  keyword: string;
  searchType?: SearchResourceType;
  limit?: number;
  page?: number;
  size?: number;
  /** Repeated `sort` query params; default id,ASC */
  sort?: string[];
};

export type GlobalSearchApiResponse = {
  status?: number | string;
  message?: string;
  data: unknown;
  metadata?: unknown;
};
