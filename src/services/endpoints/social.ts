import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  SocialItemType,
  SocialListResponse,
  SocialParams,
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
};
