export type ContentType = 'NOTE' | 'FLASHCARD' | 'EXAM' | 'EDIT';

export type ActivityLogRequest = {
  contentType: ContentType;
  setId?: number | null;
  todoId?: number | null;
  activeDuration: number;
  rawDuration: number;
  score?: number | null;
  itemsCount?: number;
  clientTimestamp: string;
};

export type HeatmapDay = {
  date: string;
  totalMinutes: number;
  sessions: number;
  bestScore: number | null;
  totalItems: number;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  studiedToday: boolean;
};

export type ContentTypeSummary = {
  contentType: string;
  totalMinutes: number;
  sessions: number;
};

export type ActivitySummary = {
  totalMinutes: number;
  totalSessions: number;
  totalItems: number;
  avgExamScore: number | null;
  breakdown: ContentTypeSummary[];
};

export type HeatmapMode = 'time' | 'sessions' | 'score';
