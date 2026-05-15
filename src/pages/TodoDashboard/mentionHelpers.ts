import type { SearchItem } from './mentionTypes';

// ─── Helper: parse globalSearch response items ────────────────────────────────
export function extractSearchItems(data: unknown): SearchItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SearchItem[];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.content)) return o.content as SearchItem[];
  if (Array.isArray(o.items)) return o.items as SearchItem[];
  if (Array.isArray(o.data)) return o.data as SearchItem[];
  return [];
}

export type SearchMeta =
  | { currentPage: number; totalPages: number }
  | undefined;

export function extractSearchMeta(page: unknown): SearchMeta {
  const o = page as Record<string, unknown> | undefined;
  const m = o?.metadata as SearchMeta;
  return m;
}
