import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

export type AISource = 'notes' | 'files' | 'web';

export type AIPrivacy = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';

export type NoteAIInput = {
  note_id: number;
  document_urls: string[];
};

export type AISubmitData = {
  source: AISource;
  notes?: NoteAIInput[];
  files?: File[];
  urls?: string[];
  title: string;
  privacy: AIPrivacy;
  language: string;
  freeText: string;
  questionCounts?: { MCQ: number; TF: number; ESS: number };
  difficulty?: ExamAIDifficultyDistribution;
};

export const DEFAULT_DIFFICULTY: ExamAIDifficultyDistribution = {
  Easy: 50,
  Medium: 30,
  Hard: 20,
};
