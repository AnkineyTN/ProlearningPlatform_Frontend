import type { AxiosResponse } from 'axios';
import api from '../client';
import type { FlashcardResponse, FlashcardDetailResponse, DeleteFlashcardResponse } from '../types/flashcard.types';

export const flashcardAPI = {
    getAllFlashcardsBySet: (
        setId: number,
        page: number,
        size: number,
        sort: string = 'id,ASC'
    ): Promise<AxiosResponse<FlashcardResponse>> =>
        api.get(`/sets/${setId}/flashcards`, {
            params: {
                page,
                size,
                sort
            }
        }),

    getFlashcardDetail: (
        setId: number,
        flashcardId: string
    ): Promise<AxiosResponse<FlashcardDetailResponse>> =>
        api.get(`/sets/${setId}/flashcards/${flashcardId}`),
    
    createManual: (
        setId: number,
        data: { title: string; description: string; cards: Array<{ frontCard: string; backCard: string; imageUrl?: string | null }> }
    ): Promise<AxiosResponse<any>> => {
        return api.post(`/sets/${setId}/flashcards/manual`, data);
    },

    updateFlashcard: (
        setId: number,
        flashcardId: string,
        data: { title: string; description: string; privacy: 'PUBLIC' | 'PRIVATE' }
    ): Promise<AxiosResponse<any>> => {
        return api.patch(`/sets/${setId}/flashcards/${flashcardId}`, data);
    },

    deleteFlashcard: (
        setId: number,
        flashcardId: string
    ): Promise<AxiosResponse<DeleteFlashcardResponse>> =>
        api.delete(`/sets/${setId}/flashcards/${flashcardId}`)
};