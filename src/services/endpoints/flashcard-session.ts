import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  StartSessionRequest,
  StartSessionResponse,
  SessionStatusResponse,
  SyncProgressRequest,
  SyncProgressResponse,
  SessionResultResponse,
  CancelSessionResponse,
} from '@/services/types/flashcard-session.types';

export const flashcardSessionAPI = {
  /**
   * Bắt đầu hoặc tiếp tục phiên học flashcard
   */
  startSession: (
    setId: number,
    flashcardId: number,
    data?: StartSessionRequest,
  ): Promise<AxiosResponse<StartSessionResponse>> =>
    api.post(`/sets/${setId}/flashcards/${flashcardId}/session/start`, data),

  /**
   * Kiểm tra trạng thái phiên học flashcard
   */
  getSessionStatus: (
    setId: number,
    flashcardId: number,
  ): Promise<AxiosResponse<SessionStatusResponse>> =>
    api.get(`/sets/${setId}/flashcards/${flashcardId}/session/status`),

  /**
   * Đồng bộ tiến trình phiên học flashcard
   */
  syncProgress: (
    setId: number,
    flashcardId: number,
    sessionId: number,
    data: SyncProgressRequest,
  ): Promise<AxiosResponse<SyncProgressResponse>> =>
    api.put(
      `/sets/${setId}/flashcards/${flashcardId}/session/${sessionId}/progress`,
      data,
    ),

  /**
   * Lấy kết quả phiên học flashcard
   */
  getSessionResult: (
    setId: number,
    flashcardId: number,
    sessionId: number,
  ): Promise<AxiosResponse<SessionResultResponse>> =>
    api.get(
      `/sets/${setId}/flashcards/${flashcardId}/session/${sessionId}/result`,
    ),

  /**
   * Hủy phiên học flashcard
   */
  cancelSession: (
    setId: number,
    flashcardId: number,
    sessionId: number,
  ): Promise<AxiosResponse<CancelSessionResponse>> =>
    api.delete(`/sets/${setId}/flashcards/${flashcardId}/session/${sessionId}`),
};
