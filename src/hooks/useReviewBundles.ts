import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewBundleAPI } from '@/services/endpoints/review-bundle';
import { examAPI } from '@/services/endpoints/exam';
import type { GenerateReviewExamRequest } from '@/services/types/review-bundle.types';

// ─── Review Bundles ───────────────────────────────────────────────────────────

export const useReviewBundles = () => {
  return useQuery({
    queryKey: ['review-bundles'],
    queryFn: async () => {
      const response = await reviewBundleAPI.getAll();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReviewBundle = (bundleId: number | string | undefined) => {
  return useQuery({
    queryKey: ['review-bundle', bundleId],
    queryFn: async () => {
      const response = await reviewBundleAPI.getById(bundleId!);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!bundleId,
  });
};

export const useGenerateFlashcardFromBundle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bundleId: number | string) =>
      reviewBundleAPI.generateFlashcard(bundleId),
    onSuccess: () => {
      // Invalidate flashcard lists so the new REVIEW flashcard appears in set tab
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
};

export const useGenerateExamFromBundle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bundleId: number | string) =>
      reviewBundleAPI.generateExam(bundleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

export const useDismissBundle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bundleId: number | string) =>
      reviewBundleAPI.delete(bundleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-bundles'] });
    },
  });
};

// ─── Exam Question Stats (Luồng 2) ────────────────────────────────────────────

export const useExamQuestionStats = (setId: number, examId: number) => {
  return useQuery({
    queryKey: ['exam-question-stats', setId, examId],
    queryFn: async () => {
      const response = await examAPI.getQuestionStats(setId, examId);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!setId && !!examId,
  });
};

export const useGenerateReviewExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      examId,
      body,
    }: {
      setId: number;
      examId: number;
      body: GenerateReviewExamRequest;
    }) => examAPI.generateReviewExam(setId, examId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams', variables.setId] });
    },
  });
};
