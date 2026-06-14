import type { SocialNote } from './social.types';

export type FavoriteType = 'NOTE' | 'FLASHCARD' | 'EXAM';

export type FavoriteItem = SocialNote & {
  isFavorited: boolean;
};

export type FavoriteParams = {
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export type FavoriteListResponse = {
  status: string;
  message: string;
  data: FavoriteItem[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type ToggleFavoriteResponse = {
  status: string;
  message: string;
  data: boolean;
};
