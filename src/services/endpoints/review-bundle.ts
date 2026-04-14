import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  ReviewBundleListResponse,
  ReviewBundleDetailResponse,
  GenerateFlashcardFromBundleResponse,
  GenerateExamFromBundleResponse,
  DeleteReviewBundleResponse,
} from '../types/review-bundle.types';

export const reviewBundleAPI = {
  /**
   * GET /review-bundles
   * Returns all bundles for the current user, sorted newest first
   */
  getAll: (): Promise<AxiosResponse<ReviewBundleListResponse>> =>
    api.get('/review-bundles'),

  /**
   * GET /review-bundles/{bundleId}
   * Returns the list of incorrect cards in this bundle
   */
  getById: (
    bundleId: number | string,
  ): Promise<AxiosResponse<ReviewBundleDetailResponse>> =>
    api.get(`/review-bundles/${bundleId}`),

  /**
   * POST /review-bundles/{bundleId}/generate-flashcard
   * Calls AI to generate a new flashcard set from the incorrect cards in this bundle
   */
  generateFlashcard: (
    bundleId: number | string,
  ): Promise<AxiosResponse<GenerateFlashcardFromBundleResponse>> =>
    api.post(`/review-bundles/${bundleId}/generate-flashcard`),

  /**
   * POST /review-bundles/{bundleId}/generate-exam
   * Calls AI to generate a new exam from the incorrect cards in this bundle
   */
  generateExam: (
    bundleId: number | string,
  ): Promise<AxiosResponse<GenerateExamFromBundleResponse>> =>
    api.post(`/review-bundles/${bundleId}/generate-exam`),

  /**
   * DELETE /review-bundles/{bundleId}
   * Mark the bundle as mastered — permanently deletes it
   */
  delete: (
    bundleId: number | string,
  ): Promise<AxiosResponse<DeleteReviewBundleResponse>> =>
    api.delete(`/review-bundles/${bundleId}`),
};
