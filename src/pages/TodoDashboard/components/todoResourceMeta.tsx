import {
  BookOpen,
  FileText,
  FlipHorizontal,
  GraduationCap,
} from 'lucide-react';
import type { SearchResourceType } from '@/services/types/search.types';
import type { ResourceType } from '../constants';

export const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  set: <BookOpen className='w-3.5 h-3.5' />,
  note: <FileText className='w-3.5 h-3.5' />,
  flashcard: <FlipHorizontal className='w-3.5 h-3.5' />,
  exam: <GraduationCap className='w-3.5 h-3.5' />,
};

export const RESOURCE_COLORS: Record<ResourceType, string> = {
  set: 'oklch(0.7 0.15 260)',
  note: 'oklch(0.72 0.12 180)',
  flashcard: 'oklch(0.7 0.15 310)',
  exam: 'oklch(0.72 0.15 40)',
};

export const SEARCH_TYPE_MAP: Record<ResourceType, SearchResourceType> = {
  set: 'SET',
  note: 'NOTE',
  flashcard: 'FLASHCARD',
  exam: 'EXAM',
};

export function extractSearchItems(data: unknown): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.content)) return o.content as Record<string, unknown>[];
  if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
  if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  return [];
}
