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
  GenerateExamAIResponse,
  GenerateExamFromNotesRequest,
  GenerateExamFromWebRequest,
  ExamAIDifficultyDistribution,
  ExamAttemptStartResponse,
  ExamAttemptDetailResponse,
  ExamAttemptListResponse,
  SubmitExamAttemptRequest,
  AiExplainWrongAnswerRequest,
  AiExplainWrongAnswerResponse,
} from '../types/exam.types';

export const examAPI = {
  // Quiz endpoints
  /**
   * Get all quizzes for a set with pagination
   */
  getQuizzes: (
    setId: number,
    params: {
      page?: number;
      size?: number;
      sort?: string;
      q?: string;
      privacy?: 'PUBLIC' | 'PRIVATE';
    } = {},
  ): Promise<AxiosResponse<QuizListResponse>> => {
    const {
      page = 0,
      size = 10,
      sort = 'id,ASC',
      q,
      privacy,
    } = params;
    const query: Record<string, string | number> = { page, size, sort };
    const qt = q?.trim();
    if (qt) {
      query.q = qt;
    }
    if (privacy) {
      query.privacy = privacy;
    }
    return api.get(`/set/${setId}/exams`, {
      params: query,
    });
  },

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

  /**
   * Generate exam from files with AI
   * POST /set/{setId}/exams/ai-file (multipart/form-data)
   */
  generateExamFromFiles: (
    setId: number,
    files: File[],
    questionCounts: { MCQ: number; TF: number; ESS: number },
    difficulty: ExamAIDifficultyDistribution,
    freeText: string,
    language: string,
  ): Promise<AxiosResponse<GenerateExamAIResponse>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('questions', JSON.stringify(questionCounts));
    formData.append('difficulty', JSON.stringify(difficulty));
    formData.append('freeText', freeText.trim());
    formData.append('language', language);
    return api.post(`/set/${setId}/exams/ai-file`, formData);
  },

  generateExamFromNotes: (
    setId: number,
    data: GenerateExamFromNotesRequest,
  ): Promise<AxiosResponse<GenerateExamAIResponse>> =>
    api.post(`/set/${setId}/exams/ai-note`, data),

  generateExamFromWeb: (
    setId: number,
    data: GenerateExamFromWebRequest,
  ): Promise<AxiosResponse<GenerateExamAIResponse>> =>
    api.post(`/set/${setId}/exams/ai-web`, data),

  /** Start a new exam attempt (server sets deadline from exam duration). */
  startExamAttempt: (
    setId: number,
    examId: number,
  ): Promise<AxiosResponse<ExamAttemptStartResponse>> =>
    api.post(`/set/${setId}/exams/${examId}/attempts`),

  /** List current user's attempts for this exam. */
  listExamAttempts: (
    setId: number,
    examId: number,
  ): Promise<AxiosResponse<ExamAttemptListResponse>> =>
    api.get(`/set/${setId}/exams/${examId}/attempts`),

  /** Graded attempt detail (after submit or for review). */
  getExamAttempt: (
    setId: number,
    examId: number,
    attemptId: number,
  ): Promise<AxiosResponse<ExamAttemptDetailResponse>> =>
    api.get(`/set/${setId}/exams/${examId}/attempts/${attemptId}`),

  submitExamAttempt: (
    setId: number,
    examId: number,
    attemptId: number,
    body: SubmitExamAttemptRequest,
  ): Promise<AxiosResponse<ExamAttemptDetailResponse>> =>
    api.post(
      `/set/${setId}/exams/${examId}/attempts/${attemptId}/submit`,
      body,
    ),

  explainWrongAnswer: (
    setId: number,
    body: AiExplainWrongAnswerRequest,
  ): Promise<AxiosResponse<AiExplainWrongAnswerResponse>> =>
    api.post(`/set/${setId}/exams/ai-explain-wrong-answer`, body),
};
