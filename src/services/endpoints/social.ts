import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  SocialItemType,
  SocialListResponse,
  SocialParams,
  TrendingApiResponse,
  TrendingCreator,
  TrendingResource,
  TrendingResourceParams,
  TrendingTopic,
  TrendingParams,
} from '../types/social.types';

const createSocialListAPI =
  (path: string) =>
  <T extends SocialItemType>(
    params?: SocialParams,
  ): Promise<AxiosResponse<SocialListResponse<T>>> =>
    api.get(path, { params });

export const socialAPI = {
  getSharedNotes: createSocialListAPI('/social/notes'),
  getSharedExams: createSocialListAPI('/social/exams'),
  getSharedFlashcards: createSocialListAPI('/social/flashcards'),

  postViewLog: (type: SocialItemType, id: number) =>
    api.post(`/social/resources/${type}/${id}/view`),

  getTrendingResources: (params?: TrendingResourceParams) =>
    api.get<TrendingApiResponse<TrendingResource>>('/social/trending/resources', { params }),

  getTrendingCreators: (params?: TrendingParams) =>
    api.get<TrendingApiResponse<TrendingCreator>>('/social/trending/creators', { params }),

  getTrendingTopics: (params?: TrendingParams) =>
    api.get<TrendingApiResponse<TrendingTopic>>('/social/trending/topics', { params }),
};
