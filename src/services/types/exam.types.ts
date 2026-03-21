// Enums and constants
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'ESSAY';
export type QuizStatus = 'ONGOING' | 'COMPLETED' | 'NOT_STARTED';
export type PrivacyType = 'PUBLIC' | 'PRIVATE';

// Question Option
export type QuestionOption = {
  optionText: string;
  isCorrect: boolean;
};

// Question related
export type Question = {
  id: number | string;
  quizId?: number;
  questionText: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctAnswer?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuestionRequest = {
  questionText: string;
  questionType: QuestionType;
  options: QuestionOption[];
  correctAnswer?: string;
  order?: number;
};

/** Backend API payload - uses "content" instead of "questionText" */
export type CreateQuestionApiPayload = {
  content: string;
  type: QuestionType;
  options: QuestionOption[];
};

export type UpdateQuestionRequest = {
  content: string;
  type: QuestionType;
  options: QuestionOption[];
};

export type QuestionResponse = {
  status: string;
  message: string;
  data: Question;
  metadata: Record<string, never>;
};

export type QuestionListResponse = {
  status: string;
  message: string;
  data: Question[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

/** Backend returns data.questions (paginated) */
export type QuestionsListApiResponse = {
  status: string;
  message: string;
  data: {
    questions: Array<{
      id: number;
      content: string;
      type: QuestionType;
      options: QuestionOption[];
    }>;
  };
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
};

// Quiz related
export type Quiz = {
  id: number | string;
  setId?: number;
  title: string;
  description: string;
  privacy: PrivacyType;
  numQuestions?: number;
  duration?: number;
  passingScore?: number;
  status?: QuizStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuizRequest = {
  title: string;
  description: string;
  privacy: PrivacyType;
  duration?: number;
  passingScore?: number;
};

export type UpdateQuizRequest = {
  title: string;
  description: string;
  privacy: PrivacyType;
  duration?: number;
  passingScore?: number;
};

export type QuizResponse = {
  status: string;
  message: string;
  data: Quiz;
  metadata: Record<string, never>;
};

export type QuizListResponse = {
  status: string;
  message: string;
  data: Quiz[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export type QuizDetailResponse = {
  status: string;
  message: string;
  data: Quiz & {
    questions: Question[];
  };
  metadata: Record<string, never>;
};

// API Response wrappers
export type ApiResponseQuiz = {
  status: string;
  message: string;
  data: Quiz;
  metadata: Record<string, never>;
};

export type ApiResponseQuestion = {
  status: string;
  message: string;
  data: Question;
  metadata: Record<string, never>;
};

export type VoidResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};

// AI Generation
export type GenerateExamAIResponse = {
  status: string;
  message: string;
  data: { content: string };
  metadata: Record<string, unknown>;
};

export type GenerateExamFromNotesRequest = {
  noteIds: number[];
  questions: Record<string, number>;
  language: string;
  /** easy | medium | hard — backend may use for prompt tuning */
  difficulty?: string;
  /** Optional user instructions for the AI */
  specialRequirements?: string;
};
