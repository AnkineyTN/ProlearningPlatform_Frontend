import { useQuery } from '@tanstack/react-query';
import { flashcardAPI } from '@/services/endpoints/flashcard';

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