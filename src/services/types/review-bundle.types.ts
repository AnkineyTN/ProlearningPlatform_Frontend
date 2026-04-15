// ─── Review Bundle List ───────────────────────────────────────────────────────

export type ReviewBundleItem = {
  id: number;
  setId: number;
  periodFrom: string;
  periodTo: string;
  cardCount: number;
};

export type ReviewBundleListResponse = {
  status: string;
  message: string;
  data: ReviewBundleItem[];
  metadata: Record<string, unknown> | null;
};

// ─── Review Bundle Detail ─────────────────────────────────────────────────────

export type ReviewBundleCard = {
  id: number;
  frontCard: string;
  backCard: string;
};

export type ReviewBundleDetail = {
  id: number;
  periodFrom: string;
  periodTo: string;
  cardCount: number;
  cards: ReviewBundleCard[];
};

export type ReviewBundleDetailResponse = {
  status: string;
  message: string;
  data: ReviewBundleDetail;
  metadata: Record<string, unknown> | null;
};

// ─── Generate Flashcard Set from Bundle ───────────────────────────────────────

export type GeneratedFlashcardSet = {
  id: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | string;
  privacy: 'PUBLIC' | 'PRIVATE';
  lastStudy: string | null;
  known: number;
  learning: number;
  remain: number;
  createMethod: 'MANUAL' | 'AI' | string;
  numCards: number;
  createdAt: string;
  updatedAt: string;
};

export type GenerateFlashcardFromBundleResponse = {
  status: string;
  message: string;
  data: GeneratedFlashcardSet;
  metadata: Record<string, unknown> | null;
};

// ─── Generate Exam from Bundle ────────────────────────────────────────────────

export type GeneratedExam = {
  id: number;
  title: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  description: string;
  duration: number;
  numQuestions: number;
  creationMethod: 'MANUAL' | 'AI' | string;
  createdAt: string;
  updatedAt: string;
};

export type GenerateExamFromBundleResponse = {
  status: string;
  message: string;
  data: GeneratedExam;
  metadata: Record<string, unknown> | null;
};

// ─── Delete Bundle ────────────────────────────────────────────────────────────

export type DeleteReviewBundleResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, unknown> | null;
};

// ─── Exam Question Stats (Luồng 2 — Retry Wrong Answers) ─────────────────────

export type QuestionStat = {
  questionId: number;
  questionText: string;
  totalAttempts: number;
  incorrectCount: number;
  incorrectRate: number;
};

export type QuestionStatsResponse = {
  status: string;
  message: string;
  data: QuestionStat[];
  pagination: null;
};

export type GenerateReviewExamRequest = {
  questionIds: number[];
};

export type GenerateReviewExamResponse = {
  status: string;
  message: string;
  data: GeneratedExam;
  metadata: Record<string, unknown> | null;
};
