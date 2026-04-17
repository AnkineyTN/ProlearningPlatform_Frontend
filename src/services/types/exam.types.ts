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
  createMethod?: 'MANUAL' | 'AI' | 'REVIEW';
  createdAt?: string;
  updatedAt?: string;
  userRole?: 'OWNER' | 'EDITOR' | 'VIEWER';
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

// AI Generation — ai-note, ai-file, ai-web return this shape
export type GenerateExamAIResponse = {
  status: number | string;
  message: string;
  data: { content: string };
  metadata?: Record<string, unknown>;
};

/** Backend expects these exact keys (Easy / Medium / Hard), typically summing to 100. */
export type ExamAIDifficultyDistribution = {
  Easy: number;
  Medium: number;
  Hard: number;
};

export type GenerateExamFromNotesRequest = {
  noteIds: number[];
  questions: Record<string, number>;
  difficulty: ExamAIDifficultyDistribution;
  freeText: string;
  language: string;
};

export type GenerateExamFromWebRequest = {
  urls: string[];
  questions: Record<string, number>;
  difficulty: ExamAIDifficultyDistribution;
  free_text: string;
  language: string;
};

// Exam attempts (take exam, submit, results)
export type ExamAttemptSummary = {
  id: number;
  examId: number;
  status: string;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  score: number | null;
  totalPoints: number;
};

export type ExamAttemptAnswerPayload = {
  questionId: number;
  selectedOptionId: number;
  essayAnswer: string;
};

export type SubmitExamAttemptRequest = {
  answers: ExamAttemptAnswerPayload[];
};

export type ExamGradedAnswer = {
  questionId: number;
  questionContent?: string;
  selectedOptionId: number;
  studentAnswer?: string;
  isCorrect: boolean;
  expectedAnswer?: string;
  earnedPoints: number;
  feedback?: string;
};

export type ExamAttemptDetail = ExamAttemptSummary & {
  answers?: ExamGradedAnswer[];
};

export type ExamAttemptStartResponse = {
  status: string;
  message: string;
  data: ExamAttemptSummary;
  metadata: unknown;
};

export type ExamAttemptDetailResponse = {
  status: string;
  message: string;
  data: ExamAttemptDetail;
  metadata: unknown;
};

export type ExamAttemptListResponse = {
  status: string;
  message: string;
  data: ExamAttemptSummary[];
  metadata: unknown;
};

export type AiExplainWrongAnswerRequest = {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  language: string;
};

export type AiExplainWrongAnswerResponse = {
  status: number | string;
  message: string;
  data: { explanation: string };
  metadata?: Record<string, unknown>;
};
