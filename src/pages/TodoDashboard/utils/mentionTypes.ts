import {
  BookOpen,
  FileText,
  FlipHorizontal,
  GraduationCap,
} from 'lucide-react';
import type { SearchResourceType } from '@/services/types/search.types';

// ─── Types ───────────────────────────────────────────────────────────────────
export type MentionResourceType = 'set' | 'note' | 'flashcard' | 'exam';

export type SearchItem = Record<string, unknown>;

// ─── Constants ────────────────────────────────────────────────────────────────
export const PAGE_SIZE = 15;

// Matches / followed by any non-whitespace chars at the end of the string
export const TRIGGER_RE = /\/(\S*)$/;

export const RESOURCE_COMMANDS = [
  { id: 'set' as MentionResourceType, label: 'Set', Icon: BookOpen },
  { id: 'note' as MentionResourceType, label: 'Note', Icon: FileText },
  {
    id: 'flashcard' as MentionResourceType,
    label: 'Flashcard',
    Icon: FlipHorizontal,
  },
  { id: 'exam' as MentionResourceType, label: 'Exam', Icon: GraduationCap },
];

export const SEARCH_TYPE_MAP: Record<MentionResourceType, SearchResourceType> =
  {
    set: 'SET',
    note: 'NOTE',
    flashcard: 'FLASHCARD',
    exam: 'EXAM',
  };
