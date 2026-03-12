export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: string | number;
  type: QuestionType;
  questionText: string;
  answers: Answer[];
  score: number;
  explanation?: string;
  _action?: "CREATE" | "UPDATE" | "DELETE" | null;
}

export interface Exam {
  id?: number | string;
  title: string;
  description: string;
  privacy: string;
  totalScore: number;
  timeLimit: number;
  questions: ExamQuestion[];
}

export interface ExamSubmission {
  questionId: string | number;
  selectedAnswers: string[];
  essayAnswer?: string;
}

export interface ExamResult {
  totalScore: number;
  earnedScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  submissions: ExamSubmission[];
}
