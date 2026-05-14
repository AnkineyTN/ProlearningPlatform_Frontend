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
  GenerateFlashcardsFromWebRequest,
  GenerateFlashcardsFromNoteResponse,
  CreateFlashcardResponse,
  UpdateFlashcardRequest,
  UpdateFlashcardResponse,
  UpdateCardRequest,
  UpdateCardResponse,
  DeleteCardResponse,
  GenerateExamFromFlashcardResponse,
  SaveGameResultRequest,
  SaveGameResultResponse,
  GameRankingResponse,
  GameHistoryResponse,
  NoteAIInput,
} from '../types/flashcard.types';

export type GetFlashcardsBySetQuery = {
  page: number;
  size: number;
  sort?: string;
  q?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
  createMethod?: 'MANUAL' | 'AI' | 'REVIEW';
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
    if (query.createMethod) {
      params.createMethod = query.createMethod;
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
    notes: NoteAIInput[],
    language: string,
    freeText: string,
  ): Promise<AxiosResponse<GenerateFlashcardsFromNoteResponse>> =>
    api.post(`/sets/${setId}/flashcards/ai-note`, {
      notes,
      language,
      free_text: freeText.trim(),
    }),

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
   * Generate exam from flashcard
   * POST /sets/{setId}/exams/from-flashcard/{flashcardId}
   */
  generateExamFromFlashcard: (
    setId: number,
    flashcardId: number | string,
  ): Promise<AxiosResponse<GenerateExamFromFlashcardResponse>> =>
    api.post(`/sets/${setId}/exams/from-flashcard/${flashcardId}`),

  /**
   * Save matching game result
   * POST /sets/{setId}/flashcards/{flashcardId}/game/results
   */
  saveGameResult: (
    setId: number,
    flashcardId: number | string,
    data: SaveGameResultRequest,
  ): Promise<AxiosResponse<SaveGameResultResponse>> =>
    api.post(`/sets/${setId}/flashcards/${flashcardId}/game/results`, data),

  /**
   * Get top 20 game ranking
   * GET /sets/{setId}/flashcards/{flashcardId}/game/ranking
   */
  getGameRanking: (
    setId: number,
    flashcardId: number | string,
  ): Promise<AxiosResponse<GameRankingResponse>> =>
    api.get(`/sets/${setId}/flashcards/${flashcardId}/game/ranking`),

  /**
   * Get current user's game history
   * GET /sets/{setId}/flashcards/{flashcardId}/game/history
   */
  getGameHistory: (
    setId: number,
    flashcardId: number | string,
  ): Promise<AxiosResponse<GameHistoryResponse>> =>
    api.get(`/sets/${setId}/flashcards/${flashcardId}/game/history`),
};
