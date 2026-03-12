import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  QuizResponse,
  QuizListResponse,
  QuizDetailResponse,
  CreateQuizRequest,
  UpdateQuizRequest,
  QuestionResponse,
  QuestionsListApiResponse,
  CreateQuestionApiPayload,
  UpdateQuestionRequest,
  VoidResponse,
} from '../types/exam.types';

export const examAPI = {
  // Quiz endpoints
  /**
   * Get all quizzes for a set with pagination
   */
  getQuizzes: (
    setId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,ASC',
  ): Promise<AxiosResponse<QuizListResponse>> =>
    api.get(`/set/${setId}/exams`, {
      params: { page, size, sort },
    }),

  /**
   * Create a new quiz
   */
  createQuiz: (
    setId: number,
    data: CreateQuizRequest,
  ): Promise<AxiosResponse<QuizResponse>> =>
    api.post(`/set/${setId}/exams`, data),

  /**
   * Get quiz metadata by id
   */
  getQuizById: (
    setId: number,
    quizId: number,
  ): Promise<AxiosResponse<QuizResponse>> =>
    api.get(`/set/${setId}/exams/${quizId}`),

  /**
   * Get questions for a quiz (returns data.questions)
   */
  getQuizDetail: (
    setId: number,
    quizId: number,
  ): Promise<AxiosResponse<QuizDetailResponse>> =>
    api.get(`/set/${setId}/exams/${quizId}/questions`),

  /**
   * Update quiz
   */
  updateQuiz: (
    setId: number,
    quizId: number,
    data: UpdateQuizRequest,
  ): Promise<AxiosResponse<QuizResponse>> =>
    api.put(`/set/${setId}/exams/${quizId}`, data),

  /**
   * Delete quiz
   */
  deleteQuiz: (
    setId: number,
    quizId: number,
  ): Promise<AxiosResponse<VoidResponse>> =>
    api.delete(`/set/${setId}/exams/${quizId}`),

  // Question endpoints
  /**
   * Get all questions for a quiz with pagination (returns data.questions)
   */
  getQuestions: (
    setId: number,
    quizId: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'id,ASC',
  ): Promise<AxiosResponse<QuestionsListApiResponse>> =>
    api.get(`/set/${setId}/exams/${quizId}/questions`, {
      params: { page, size, sort },
    }),

  /**
   * Create questions in a quiz (batch - backend expects array, uses "content" not "questionText")
   */
  createQuestions: (
    setId: number,
    quizId: number,
    data: CreateQuestionApiPayload[],
  ): Promise<AxiosResponse<unknown>> =>
    api.post(`/set/${setId}/exams/${quizId}/questions`, data),

  /**
   * Get question details
   */
  getQuestionDetail: (
    setId: number,
    quizId: number,
    questionId: number,
  ): Promise<AxiosResponse<QuestionResponse>> =>
    api.get(`/set/${setId}/exams/${quizId}/questions/${questionId}`),

  /**
   * Update question
   */
  updateQuestion: (
    setId: number,
    quizId: number,
    questionId: number,
    data: UpdateQuestionRequest,
  ): Promise<AxiosResponse<QuestionResponse>> =>
    api.put(`/set/${setId}/exams/${quizId}/questions/${questionId}`, data),

  /**
   * Delete question
   */
  deleteQuestion: (
    setId: number,
    quizId: number,
    questionId: number,
  ): Promise<AxiosResponse<VoidResponse>> =>
    api.delete(`/set/${setId}/exams/${quizId}/questions/${questionId}`),
};
