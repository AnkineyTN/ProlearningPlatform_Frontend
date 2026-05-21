/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, Brain, ClipboardList } from 'lucide-react';
import { socialAPI } from '@/services/endpoints/social';
import type { SectionType } from './types';

export const PAGE_SIZE = 6;

export const SECTIONS: {
  type: SectionType;
  labelKey: string;
  icon: React.ElementType;
  fetchFn: (params?: {
    q: string;
    page?: number;
    size?: number;
  }) => Promise<any>;
}[] = [
  {
    type: 'NOTE',
    labelKey: 'social.notes',
    icon: BookOpen,
    fetchFn: (p) => socialAPI.getSharedNotes<'NOTE'>(p),
  },
  {
    type: 'FLASHCARD',
    labelKey: 'social.flashcards',
    icon: Brain,
    fetchFn: (p) => socialAPI.getSharedFlashcards<'FLASHCARD'>(p),
  },
  {
    type: 'EXAM',
    labelKey: 'social.exams',
    icon: ClipboardList,
    fetchFn: (p) => socialAPI.getSharedExams<'EXAM'>(p),
  },
];
