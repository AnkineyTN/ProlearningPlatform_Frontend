import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  FlashcardResponse,
  FlashcardDetailResponse,
  DeleteFlashcardResponse,
  AddCardsRequest,
  AddCardsResponse,
  DeleteMultipleCardsRequest,
  DeleteMultipleCardsResponse,
  UpdateMultipleCardsRequest,
  UpdateMultipleCardsResponse,
  GenerateFlashcardsFromNoteRequest,
  GenerateFlashcardsFromNoteResponse,
  CreateFlashcardResponse,
  UpdateFlashcardRequest,
  UpdateFlashcardResponse,
  UpdateCardRequest,
  UpdateCardResponse,
  DeleteCardResponse,
  CardReviewResponse,
  FlashcardLearnResponse,
  FlashcardStudySessionSyncRequest,
} from '../types/flashcard.types';

export const flashcardAPI = {
  getAllFlashcardsBySet: (
    setId: number,
    page: number,
    size: number,
    sort: string = 'id,ASC',
  ): Promise<AxiosResponse<FlashcardResponse>> =>
    api.get(`/sets/${setId}/flashcards`, {
      params: {
        page,
        size,
        sort,
      },
    }),

  getFlashcardDetail: (
    setId: number,
    flashcardId: number,
  ): Promise<AxiosResponse<FlashcardDetailResponse>> =>
    api.get(`/sets/${setId}/flashcards/${flashcardId}`),

  createManual: (
    setId: number,
    data: {
      title: string;
      description: string;
      cards: Array<{
        frontCard: string;
        backCard: string;
        imageUrl?: string | null;
      }>;
    },
  ): Promise<AxiosResponse<CreateFlashcardResponse>> => {
    return api.post(`/sets/${setId}/flashcards/manual`, data);
  },

  updateFlashcard: (
    setId: number,
    flashcardId: number | string,
    data: UpdateFlashcardRequest,
  ): Promise<AxiosResponse<UpdateFlashcardResponse>> => {
    return api.patch(`/sets/${setId}/flashcards/${flashcardId}`, data);
  },

  deleteFlashcard: (
    setId: number,
    flashcardId: number | string,
  ): Promise<AxiosResponse<DeleteFlashcardResponse>> =>
    api.delete(`/sets/${setId}/flashcards/${flashcardId}`),

  updateCard: (
    setId: number,
    flashcardId: number | string,
    cardId: number,
    data: UpdateCardRequest,
  ): Promise<AxiosResponse<UpdateCardResponse>> =>
    api.patch(`/sets/${setId}/flashcards/${flashcardId}/cards/${cardId}`, data),

  deleteCard: (
    setId: number,
    flashcardId: number | string,
    cardId: number,
  ): Promise<AxiosResponse<DeleteCardResponse>> =>
    api.delete(`/sets/${setId}/flashcards/${flashcardId}/cards/${cardId}`),

  // Add one or many cards to existing flashcard
  addCards: (
    setId: number,
    flashcardId: number | string,
    cards: AddCardsRequest[],
  ): Promise<AxiosResponse<AddCardsResponse>> =>
    api.post(`/sets/${setId}/flashcards/${flashcardId}/cards`, cards),

  // Delete multiple cards by IDs
  deleteMultipleCards: (
    setId: number,
    flashcardId: number | string,
    data: DeleteMultipleCardsRequest,
  ): Promise<AxiosResponse<DeleteMultipleCardsResponse>> =>
    api.delete(`/sets/${setId}/flashcards/${flashcardId}/cards`, { data }),

  // Update multiple cards
  updateMultipleCards: (
    setId: number,
    flashcardId: number | string,
    cards: UpdateMultipleCardsRequest[],
  ): Promise<AxiosResponse<UpdateMultipleCardsResponse>> =>
    api.patch(`/sets/${setId}/flashcards/${flashcardId}/cards`, cards),

  // Generate flashcards from note
  generateFlashcardsFromNote: (
    setId: number,
    data: GenerateFlashcardsFromNoteRequest,
  ): Promise<AxiosResponse<GenerateFlashcardsFromNoteResponse>> =>
    api.post(`/sets/${setId}/flashcards/ai-note`, data),

  generateFlashcardsFromFile: (
    setId: number,
    files: File[],
  ): Promise<AxiosResponse<GenerateFlashcardsFromNoteResponse>> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return api.post(`/sets/${setId}/flashcards/ai-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get cards for flashcard review/learning
   */
  getCardsForReview: (
    setId: number,
    flashcardId: number,
    limit: number = 20,
  ): Promise<AxiosResponse<FlashcardLearnResponse>> =>
    api.get(`/sets/${setId}/flashcards/review/${flashcardId}/learn`, {
      params: { limit },
    }),

  /**
   * Submit review for a card
   */
  submitCardReview: (
    setId: number,
    flashcardId: number,
    data: FlashcardStudySessionSyncRequest,
  ): Promise<AxiosResponse<CardReviewResponse>> =>
    api.post(`/sets/${setId}/flashcards/review/${flashcardId}/reviews`, data),
};
