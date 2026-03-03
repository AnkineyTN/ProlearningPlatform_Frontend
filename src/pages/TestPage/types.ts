export type QuestionType = "multiple-choice" | "true-false" | "essay";

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string | number;
  type: QuestionType;
  questionText: string;
  answers: Answer[];
  score: number;
  explanation?: string;
  _action?: "CREATE" | "UPDATE" | "DELETE" | null;
}

export interface Test {
  id?: number;
  title: string;
  description: string;
  privacy: string;
  totalScore: number;
  timeLimit: number; // in minutes
  questions: Question[];
}

export interface TestSubmission {
  questionId: string | number;
  selectedAnswers: string[]; // IDs of selected answers
  essayAnswer?: string;
}

export interface TestResult {
  totalScore: number;
  earnedScore: number;
  percentage: number;
  passed: boolean;
  timeTaken: number; // in seconds
  submissions: TestSubmission[];
}
