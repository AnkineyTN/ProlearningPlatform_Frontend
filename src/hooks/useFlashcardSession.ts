import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashcardSessionAPI } from "@/services/endpoints/flashcard-session";
import type {
  StartSessionRequest,
  SyncProgressRequest,
} from "@/services/types/flashcard-session.types";

/**
 * Hook để bắt đầu hoặc tiếp tục phiên học
 */
export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      data,
    }: {
      setId: number;
      flashcardId: number;
      data?: StartSessionRequest;
    }) => flashcardSessionAPI.startSession(setId, flashcardId, data),
    onSuccess: (response, variables) => {
      console.log("Session started:", response.data);
      // Invalidate session status để cập nhật trạng thái mới
      queryClient.invalidateQueries({
        queryKey: ["session-status", variables.setId, variables.flashcardId],
      });
    },
    onError: (error: any) => {
      console.error("Error starting session:", error);
    },
  });
};

/**
 * Hook để lấy trạng thái phiên học
 */
export const useSessionStatus = (
  setId: number,
  flashcardId: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ["session-status", setId, flashcardId],
    queryFn: async () => {
      const response = await flashcardSessionAPI.getSessionStatus(
        setId,
        flashcardId
      );
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: enabled && !!flashcardId,
  });
};

/**
 * Hook để đồng bộ tiến trình học
 */
export const useSyncProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      sessionId,
      data,
    }: {
      setId: number;
      flashcardId: number;
      sessionId: number;
      data: SyncProgressRequest;
    }) => flashcardSessionAPI.syncProgress(setId, flashcardId, sessionId, data),
    onSuccess: (response, variables) => {
      console.log("Progress synced:", response.data);
      // Cập nhật cache của session status
      queryClient.setQueryData(
        ["session-status", variables.setId, variables.flashcardId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: [response.data.data],
          };
        }
      );
    },
    onError: (error: any) => {
      console.error("Error syncing progress:", error);
    },
  });
};

/**
 * Hook để lấy kết quả phiên học
 */
export const useSessionResult = (
  setId: number,
  flashcardId: number,
  sessionId: number,
  enabled = false
) => {
  return useQuery({
    queryKey: ["session-result", setId, flashcardId, sessionId],
    queryFn: async () => {
      const response = await flashcardSessionAPI.getSessionResult(
        setId,
        flashcardId,
        sessionId
      );
      return response.data;
    },
    staleTime: Infinity, // Kết quả không thay đổi nên cache mãi mãi
    enabled: enabled && !!sessionId,
  });
};

/**
 * Hook để hủy phiên học
 */
export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      sessionId,
    }: {
      setId: number;
      flashcardId: number;
      sessionId: number;
    }) => flashcardSessionAPI.cancelSession(setId, flashcardId, sessionId),
    onSuccess: (response, variables) => {
      console.log("Session cancelled:", response.data);
      // Invalidate session status
      queryClient.invalidateQueries({
        queryKey: ["session-status", variables.setId, variables.flashcardId],
      });
      // Invalidate session result nếu có
      queryClient.invalidateQueries({
        queryKey: [
          "session-result",
          variables.setId,
          variables.flashcardId,
          variables.sessionId,
        ],
      });
    },
    onError: (error: any) => {
      console.error("Error cancelling session:", error);
    },
  });
};
