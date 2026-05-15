import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  AnalysisListResponse,
  AnalysisResponse,
  TopicAssignResponse,
} from '../types/knowledge-analysis.types';

export const knowledgeAnalysisAPI = {
  triggerFlashcardAnalysis: (
    setId: number,
    flashcardId: number,
    sessionId: number,
  ): Promise<AxiosResponse<AnalysisResponse>> =>
    api.post(
      `/sets/${setId}/flashcards/${flashcardId}/sessions/${sessionId}/analysis`,
    ),

  triggerExamAnalysis: (
    setId: number,
    examId: number,
    attemptId: number,
  ): Promise<AxiosResponse<AnalysisResponse>> =>
    api.post(`/sets/${setId}/exams/${examId}/attempts/${attemptId}/analysis`),

  triggerSetAnalysis: (
    setId: number,
  ): Promise<AxiosResponse<AnalysisResponse>> =>
    api.post(`/sets/${setId}/analysis`),

  getFlashcardAnalyses: (
    setId: number,
    flashcardId: number,
  ): Promise<AxiosResponse<AnalysisListResponse>> =>
    api.get(`/sets/${setId}/flashcards/${flashcardId}/analyses`),

  getExamAnalyses: (
    setId: number,
    examId: number,
  ): Promise<AxiosResponse<AnalysisListResponse>> =>
    api.get(`/sets/${setId}/exams/${examId}/analyses`),

  getSetAnalyses: (
    setId: number,
  ): Promise<AxiosResponse<AnalysisListResponse>> =>
    api.get(`/sets/${setId}/analyses`),

  assignFlashcardTopics: (
    setId: number,
    flashcardId: number,
  ): Promise<AxiosResponse<TopicAssignResponse>> =>
    api.post(`/sets/${setId}/flashcards/${flashcardId}/topics/assign`),

  assignExamTopics: (
    setId: number,
    examId: number,
  ): Promise<AxiosResponse<TopicAssignResponse>> =>
    api.post(`/sets/${setId}/exams/${examId}/topics/assign`),
};
