import type { ApiMetadata } from './auth.types';

export type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
export type AssetSource = 'SYSTEM' | 'USER';
export type SessionType = 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK';
export type PomodoroTab = 'ALL' | 'MY_UPLOADS' | 'FAVORITES';
export type PomodoroSourceFilter = 'SYSTEM' | 'USER';
export type PomodoroSortBy = 'createdAt' | 'name';
export type PomodoroSortDir = 'asc' | 'desc';

export interface PomodoroSetting {
  pomodoroDuration: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartPomodoro: boolean;
}

export interface SpaceDto {
  id: number;
  name: string;
  description: string | null;
  assetUrl: string;
  assetType: AssetType;
  source: AssetSource;
  isFavorite: boolean;
}

export interface SoundDto {
  id: number;
  name: string;
  description: string | null;
  assetUrl: string;
  source: AssetSource;
  isFavorite: boolean;
}

export interface DailyStat {
  date: string;
  focusMinutes: number;
  sessions: number;
  completedSessions: number;
}

export interface WeeklyStats {
  totalFocusMinutes: number;
  totalSessions: number;
  completionRate: number;
  dailyBreakdown: DailyStat[];
  bestDay: DailyStat | null;
  currentStreak: number;
}

export interface PageMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}

export interface SearchParams {
  keyword?: string;
  tab?: PomodoroTab;
  source?: PomodoroSourceFilter;
  page?: number;
  size?: number;
  sortBy?: PomodoroSortBy;
  sortDir?: PomodoroSortDir;
}

export interface CreateSpaceRequest {
  name: string;
  description?: string;
  assetId: number;
}

export interface CreateSoundRequest {
  name: string;
  description?: string;
  assetId: number;
}

export interface SessionRequest {
  type: SessionType;
  duration: number;
  planned: number;
  completed: boolean;
  startedAt: string;
  endedAt: string;
}

// Backend may wrap responses with { status, message, data, metadata } or return raw.
// These flexible response types accept both shapes.
export type PomodoroResponse<T> = T & {
  status?: string;
  message?: string;
  data?: T;
  metadata?: ApiMetadata | null;
};

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PageMetadata;
  status?: string;
  message?: string;
}
