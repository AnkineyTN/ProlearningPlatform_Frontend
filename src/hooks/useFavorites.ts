import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteAPI } from '@/services/endpoints/favorite';
import type {
  FavoriteParams,
  FavoriteType,
} from '@/services/types/favorite.types';

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (type: FavoriteType, params?: FavoriteParams) =>
    [...favoriteKeys.all, type, params] as const,
};

export function useFavorites(
  type: FavoriteType,
  params?: FavoriteParams,
  enabled = true,
) {
  return useQuery({
    queryKey: favoriteKeys.list(type, params),
    queryFn: () =>
      favoriteAPI.getByType(type, params).then((r) => r.data.data ?? []),
    enabled,
    staleTime: 30_000,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: FavoriteType; id: number }) =>
      favoriteAPI.toggle(type, id).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });
}
