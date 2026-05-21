import { useQuery } from '@tanstack/react-query';
import { socialAPI } from '@/services/endpoints/social';
import type { SocialParams } from '@/services/types/social.types';

export const socialKeys = {
  all: ['social'] as const,
  notes: (params?: SocialParams) =>
    [...socialKeys.all, 'notes', params] as const,
  flashcards: (params?: SocialParams) =>
    [...socialKeys.all, 'flashcards', params] as const,
  exams: (params?: SocialParams) =>
    [...socialKeys.all, 'exams', params] as const,
};

export function usePublicNotes(params?: SocialParams) {
  return useQuery({
    queryKey: socialKeys.notes(params),
    queryFn: () => socialAPI.getSharedNotes(params).then((r) => r.data.data),
  });
}

export function usePublicFlashcards(params?: SocialParams) {
  return useQuery({
    queryKey: socialKeys.flashcards(params),
    queryFn: () =>
      socialAPI.getSharedFlashcards(params).then((r) => r.data.data),
  });
}

export function usePublicExams(params?: SocialParams) {
  return useQuery({
    queryKey: socialKeys.exams(params),
    queryFn: () => socialAPI.getSharedExams(params).then((r) => r.data.data),
  });
}
