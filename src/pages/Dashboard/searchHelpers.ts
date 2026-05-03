export function parseGlobalSearchItems(
  data: unknown,
): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as Record<string, unknown>[];
    if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
    if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  }
  return [];
}

export function searchResultTitle(item: Record<string, unknown>): string {
  const raw = item.title ?? item.name ?? item.code ?? item.id;
  return raw != null ? String(raw) : '—';
}

export function searchResultHref(
  item: Record<string, unknown>,
): string | null {
  const id = item.id ?? item.resourceId;
  if (id == null) return null;
  const typeRaw = item.type ?? item.resourceType ?? item.searchType ?? '';
  const type = String(typeRaw).toUpperCase();
  const setId = item.setId ?? item.set_id;
  if (type.includes('SET')) return `/sets/${id}`;
  if (type.includes('NOTE') && setId != null)
    return `/sets/${setId}/notes/${id}`;
  if (type.includes('NOTE')) return `/note/${id}`;
  if (type.includes('FLASH') && setId != null)
    return `/sets/${setId}/flashcards/${id}`;
  if (type.includes('EXAM') && setId != null)
    return `/sets/${setId}/exams/${id}`;
  return null;
}
