import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  GlobalSearchApiResponse,
  GlobalSearchParams,
} from '../types/search.types';

function buildSearchQueryString(params: GlobalSearchParams): string {
  const sp = new URLSearchParams();
  sp.set('keyword', params.keyword);
  sp.set('page', String(params.page ?? 0));
  sp.set('size', String(params.size ?? 10));
  if (params.limit != null) {
    sp.set('limit', String(params.limit));
  }
  if (params.searchType) {
    sp.set('searchType', params.searchType);
  }
  for (const s of params.sort ?? ['id,ASC']) {
    sp.append('sort', s);
  }
  return sp.toString();
}

export const searchAPI = {
  search: (
    params: GlobalSearchParams,
  ): Promise<AxiosResponse<GlobalSearchApiResponse>> =>
    api.get(`/search?${buildSearchQueryString(params)}`),
  searchMe: (
    params: GlobalSearchParams,
  ): Promise<AxiosResponse<GlobalSearchApiResponse>> =>
    api.get(`/search/me?${buildSearchQueryString(params)}`),
};
