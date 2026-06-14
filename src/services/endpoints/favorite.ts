import api from '../client';
import type {
  FavoriteListResponse,
  FavoriteParams,
  FavoriteType,
  ToggleFavoriteResponse,
} from '../types/favorite.types';

export const favoriteAPI = {
  toggle: (type: FavoriteType, id: number) =>
    api.post<ToggleFavoriteResponse>(`/users/me/favorites/${type}/${id}`),

  getByType: (type: FavoriteType, params?: FavoriteParams) =>
    api.get<FavoriteListResponse>(`/users/me/favorites/${type}`, { params }),

  getAll: (params?: FavoriteParams & { type?: FavoriteType }) =>
    api.get<FavoriteListResponse>('/users/me/favorites', { params }),
};
