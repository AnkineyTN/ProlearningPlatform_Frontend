/* eslint-disable @typescript-eslint/no-explicit-any */
import { flashcardAPI } from '@/services/endpoints/flashcard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateFlashcardManualRequest,
  UpdateCardRequest,
  AddCardsRequest,
  DeleteMultipleCardsRequest,
  UpdateMultipleCardsRequest,
  SaveGameResultRequest,
  NoteAIInput,
} from "@/services/types/flashcard.types";

interface UseFlashcardsParams {
  setId: number;
  page: number;
  size: number;
  sort?: string;
  q?: string;
  privacy?: 'PUBLIC' | 'PRIVATE';
  createMethod?: 'MANUAL' | 'AI' | 'REVIEW';
}

export const useFlashcards = ({
  setId,
  page,
  size,
  sort = "id,ASC",
  q,
  privacy,
  createMethod,
}: UseFlashcardsParams) => {
  return useQuery({
    queryKey: ["flashcards", setId, page, size, sort, q ?? "", privacy ?? "", createMethod ?? ""],
    queryFn: async () => {
      const response = await flashcardAPI.getAllFlashcardsBySet(setId, {
        page,
        size,
        sort,
        q,
        privacy,
        createMethod,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useFlashcardDetail = (setId: number, flashcardId: number) => {
  return useQuery({
    queryKey: ["flashcard-detail", setId, flashcardId],
    queryFn: async () => {
      const response = await flashcardAPI.getFlashcardDetail(
        setId,
        flashcardId,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!flashcardId,
  });
};

export const useCreateFlashcardManual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      data,
    }: {
      setId: number;
      data: CreateFlashcardManualRequest;
    }) => flashcardAPI.createManual(setId, data),
    onSuccess: (_, variables) => {
      // Invalidate flashcard list để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
    onError: (error: any) => {
      console.error("Error creating flashcard:", error);
    },
  });
};

export const useUpdateFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      payload,
    }: {
      setId: number;
      flashcardId: number | string;
      payload: {
        title: string;
        description: string;
        privacy: "PUBLIC" | "PRIVATE";
      };
    }) => flashcardAPI.updateFlashcard(setId, flashcardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcards"] });
    },
  });
};

export const useDeleteFlashcard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
    }: {
      setId: number;
      flashcardId: number | string;
    }) => flashcardAPI.deleteFlashcard(setId, flashcardId),
    onSuccess: (data, variables) => {
      console.log("Deleted flashcard:", data);
      // Invalidate flashcard list để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
    onError: (error: any) => {
      console.error("Error deleting flashcard:", error);
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      cardId,
      data,
    }: {
      setId: number;
      flashcardId: number | string;
      cardId: number;
      data: UpdateCardRequest;
    }) => flashcardAPI.updateCard(setId, flashcardId, cardId, data),
    onSuccess: (data, variables) => {
      console.log("Updated card:", data);
      // Invalidate flashcard detail để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcard-detail", variables.setId, variables.flashcardId],
      });
    },
    onError: (error: any) => {
      console.error("Error updating card:", error);
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      cardId,
    }: {
      setId: number;
      flashcardId: number | string;
      cardId: number;
    }) => flashcardAPI.deleteCard(setId, flashcardId, cardId),
    onSuccess: (data, variables) => {
      console.log("Deleted card:", data);
      // Invalidate flashcard detail để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcard-detail", variables.setId, variables.flashcardId],
      });
    },
    onError: (error: any) => {
      console.error("Error deleting card:", error);
    },
  });
};

export const useAddCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      cards,
    }: {
      setId: number;
      flashcardId: number | string;
      cards: AddCardsRequest[];
    }) => flashcardAPI.addCards(setId, flashcardId, cards),
    onSuccess: (data, variables) => {
      console.log("Added cards:", data);
      // Invalidate flashcard detail và list để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcard-detail", variables.setId, variables.flashcardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
    onError: (error: any) => {
      console.error("Error adding cards:", error);
    },
  });
};

// Hook để xóa nhiều cards cùng lúc
export const useDeleteMultipleCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      data,
    }: {
      setId: number;
      flashcardId: number | string;
      data: DeleteMultipleCardsRequest;
    }) => flashcardAPI.deleteMultipleCards(setId, flashcardId, data),
    onSuccess: (data, variables) => {
      console.log("Deleted multiple cards:", data);
      // Invalidate flashcard detail và list để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcard-detail", variables.setId, variables.flashcardId],
      });
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
    onError: (error: any) => {
      console.error("Error deleting multiple cards:", error);
    },
  });
};

// Hook để update nhiều cards cùng lúc
export const useUpdateMultipleCards = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      cards,
    }: {
      setId: number;
      flashcardId: number | string;
      cards: UpdateMultipleCardsRequest[];
    }) => flashcardAPI.updateMultipleCards(setId, flashcardId, cards),
    onSuccess: (data, variables) => {
      console.log("Updated multiple cards:", data);
      // Invalidate flashcard detail để refetch data mới
      queryClient.invalidateQueries({
        queryKey: ["flashcard-detail", variables.setId, variables.flashcardId],
      });
    },
    onError: (error: any) => {
      console.error("Error updating multiple cards:", error);
    },
  });
};

export const useGenerateFlashcardsFromNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      notes,
      language,
      freeText,
    }: {
      setId: number;
      notes: NoteAIInput[];
      language: string;
      freeText?: string;
    }) => {
      const response = await flashcardAPI.generateFlashcardsFromNote(
        setId,
        notes,
        language,
        freeText ?? "",
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
  });
};

export const useGenerateFlashcardsFromWeb = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      urls,
      language,
      freeText,
    }: {
      setId: number;
      urls: string[];
      language: string;
      freeText: string;
    }) => {
      const response = await flashcardAPI.generateFlashcardsFromWeb(setId, {
        urls,
        language,
        free_text: freeText,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
  });
};

export const useGenerateFlashcardsFromFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      files,
      language,
      freeText,
    }: {
      setId: number;
      files: File[];
      language: string;
      freeText?: string;
    }) => {
      const response = await flashcardAPI.generateFlashcardsFromFile(setId, {
        files,
        language,
        freeText,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["flashcards", variables.setId],
      });
    },
  });
};

export const useGenerateExamFromFlashcard = () => {
  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
    }: {
      setId: number;
      flashcardId: number | string;
    }) => flashcardAPI.generateExamFromFlashcard(setId, flashcardId),
  });
};

export const useSaveGameResult = () => {
  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      data,
    }: {
      setId: number;
      flashcardId: number | string;
      data: SaveGameResultRequest;
    }) => flashcardAPI.saveGameResult(setId, flashcardId, data),
  });
};

export const useGameRanking = (
  setId: number,
  flashcardId: number | string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["game-ranking", setId, flashcardId],
    queryFn: async () => {
      const response = await flashcardAPI.getGameRanking(setId, flashcardId);
      return response.data;
    },
    enabled,
  });
};

export const useGameHistory = (
  setId: number,
  flashcardId: number | string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["game-history", setId, flashcardId],
    queryFn: async () => {
      const response = await flashcardAPI.getGameHistory(setId, flashcardId);
      return response.data;
    },
    enabled,
  });
};
