import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { flashcardAPI } from '@/services/endpoints/flashcard';
import type { CreateFlashcardManualRequest } from '@/services/types/flashcard.types';

interface UseFlashcardsParams {
    setId: number;
    page: number;
    size: number;
    sort?: string;
}

export const useFlashcards = ({ setId, page, size, sort = 'id,ASC' }: UseFlashcardsParams) => {
    return useQuery({
        queryKey: ['flashcards', setId, page, size, sort],
        queryFn: async () => {
            const response = await flashcardAPI.getAllFlashcardsBySet(setId, page, size, sort);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        placeholderData: (previousData) => previousData,
    });
};

export const useFlashcardDetail = (setId: number, flashcardId: string) => {
    return useQuery({
        queryKey: ['flashcard-detail', setId, flashcardId],
        queryFn: async () => {
            const response = await flashcardAPI.getFlashcardDetail(setId, flashcardId);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!flashcardId,
    });
};

export const useCreateFlashcardManual = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ setId, data }: { setId: number; data: CreateFlashcardManualRequest }) =>
            flashcardAPI.createManual(setId, data),
        onSuccess: (data, variables) => {
            // Invalidate flashcard list để refetch data mới
            queryClient.invalidateQueries({ queryKey: ['flashcards', variables.setId] });
        },
        onError: (error: any) => {
            console.error('Error creating flashcard:', error);
        },
    });
};

export const useUpdateFlashcard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ setId, flashcardId, payload }: {
            setId: number;
            flashcardId: string;
            payload: { title: string; description: string; privacy: 'PUBLIC' | 'PRIVATE' }
        }) => flashcardAPI.updateFlashcard(setId, flashcardId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['flashcards'] });
        },
    });
};

export const useDeleteFlashcard = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ setId, flashcardId }: { setId: number; flashcardId: string }) =>
            flashcardAPI.deleteFlashcard(setId, flashcardId),
        onSuccess: (data, variables) => {
            // Invalidate flashcard list để refetch data mới
            queryClient.invalidateQueries({ queryKey: ['flashcards', variables.setId] });
        },
        onError: (error: any) => {
            console.error('Error deleting flashcard:', error);
        },
    });
};