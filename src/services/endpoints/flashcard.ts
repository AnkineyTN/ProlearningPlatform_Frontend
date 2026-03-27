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
  GenerateFlashcardsFromWebRequest,
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

export type GetFlashcardsBySetQuery = {
  page: number;
  size: number;
  sort?: string;
  q?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
};

export const flashcardAPI = {
  getAllFlashcardsBySet: (
    setId: number,
    query: GetFlashcardsBySetQuery,
  ): Promise<AxiosResponse<FlashcardResponse>> => {
    const sort = query.sort ?? 'id,ASC';
    const params: Record<string, string | number> = {
      page: query.page,
      size: query.size,
      sort,
    };
    const q = query.q?.trim();
    if (q) {
      params.q = q;
    }
    if (query.privacy) {
      params.privacy = query.privacy;
    }
    return api.get(`/sets/${setId}/flashcards`, { params });
  },

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

  generateFlashcardsFromWeb: (
    setId: number,
    data: GenerateFlashcardsFromWebRequest,
  ): Promise<AxiosResponse<GenerateFlashcardsFromNoteResponse>> =>
    api.post(`/sets/${setId}/flashcards/ai-web`, data),

  generateFlashcardsFromFile: (
    setId: number,
    payload: {
      files: File[];
      language: string;
      freeText?: string;
    },
  ): Promise<AxiosResponse<GenerateFlashcardsFromNoteResponse>> => {
    const formData = new FormData();
    payload.files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('language', payload.language);
    formData.append('freeText', payload.freeText?.trim() ?? '');
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
