/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { ResourceRef } from '@/services/types/todo.types';
import {
  TRIGGER_RE,
  RESOURCE_COMMANDS,
  type MentionResourceType,
  type SearchItem,
} from '../utils/mentionTypes';
import { extractSearchItems } from '../utils/mentionHelpers';
import {
  useSetMentionQuery,
  useSearchMentionQuery,
} from '../useMentionQueries';

// ─── Re-exports for existing importers ───────────────────────────────────────
export type { MentionResourceType } from '../utils/mentionTypes';
export {
  renderTitleWithRefs,
  renderTitleWithSetRefs,
} from './mentionTitleRenderer';
export { LinkedResourceChips } from './LinkedResourceChips';

// ─── Highlight helpers ────────────────────────────────────────────────────────
function buildHighlightParts(
  text: string,
  refs: Record<MentionResourceType, ResourceRef[]>,
): Array<{ t: string; isRef: boolean }> {
  const linked = Object.values(refs)
    .flat()
    .filter((r) => r.title && text.includes(r.title));
  if (!linked.length) return [{ t: text, isRef: false }];

  let parts: Array<{ t: string; isRef: boolean }> = [{ t: text, isRef: false }];
  for (const ref of linked) {
    const title = ref.title!;
    const out: typeof parts = [];
    for (const p of parts) {
      if (p.isRef) { out.push(p); continue; }
      const idx = p.t.indexOf(title);
      if (idx === -1) { out.push(p); continue; }
      if (idx > 0) out.push({ t: p.t.slice(0, idx), isRef: false });
      out.push({ t: title, isRef: true });
      const rest = p.t.slice(idx + title.length);
      if (rest) out.push({ t: rest, isRef: false });
    }
    parts = out;
  }
  return parts;
}

// ─── Props ────────────────────────────────────────────────────────────────────
export type ResourceMentionInputProps = {
  value: string;
  onChange: (v: string) => void;
  onRefAdded: (type: MentionResourceType, ref: ResourceRef) => void;
  linkedRefs?: Record<MentionResourceType, ResourceRef[]>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

// ─── Main component ───────────────────────────────────────────────────────────
export const ResourceMentionInput = ({
  value,
  onChange,
  onRefAdded,
  linkedRefs,
  placeholder,
  className,
  disabled,
  onKeyDown,
}: ResourceMentionInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dropdownSearchRef = useRef<HTMLInputElement>(null);

  const hasHighlights =
    !!linkedRefs &&
    Object.values(linkedRefs)
      .flat()
      .some((r) => r.title && value.includes(r.title));

  const syncScroll = () => {
    if (highlightRef.current && inputRef.current) {
      highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };
  const { user } = useAuth();

  // ── Dropdown-specific state ───────────────────────────────────────────────
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  // ── Derive picker state from main input ───────────────────────────────────
  const match = TRIGGER_RE.exec(value);
  const triggerWord = match ? match[1].toLowerCase() : null;

  const activeCommand =
    triggerWord !== null
      ? RESOURCE_COMMANDS.find((c) => triggerWord.startsWith(c.id))
      : null;

  const activeType = activeCommand?.id ?? null;

  // Command picker: `/` typed but resource type not yet resolved
  const isCommandMode = triggerWord !== null && !activeType;
  const filteredCommands = isCommandMode
    ? RESOURCE_COMMANDS.filter((c) => c.id.startsWith(triggerWord!))
    : [];
  const visibleCommands =
    filteredCommands.length ? filteredCommands : RESOURCE_COMMANDS;

  const isPickerOpen = isCommandMode || !!activeType;

  // ── Reset dropdown state on mode change ───────────────────────────────────
  useEffect(() => {
    setDropdownSearch('');
    setDebouncedSearch('');
    setActiveIndex(-1);
  }, [activeType, isCommandMode]);

  // ── Debounce dropdown search ──────────────────────────────────────────────
  useEffect(() => {
    const t = window.setTimeout(
      () => setDebouncedSearch(dropdownSearch.trim()),
      280,
    );
    return () => window.clearTimeout(t);
  }, [dropdownSearch]);

  // ── Auto-focus dropdown search when resource picker opens ─────────────────
  useEffect(() => {
    if (activeType && !isCommandMode) {
      setTimeout(() => dropdownSearchRef.current?.focus(), 0);
    }
  }, [activeType, isCommandMode]);

  // ── Reset activeIndex when results change ─────────────────────────────────
  useEffect(() => {
    setActiveIndex(-1);
  }, [debouncedSearch, activeType]);

  // ── Queries ───────────────────────────────────────────────────────────────
  const setQuery = useSetMentionQuery(debouncedSearch, activeType === 'set');
  const noteQuery = useSearchMentionQuery('note', debouncedSearch, activeType === 'note');
  const flashcardQuery = useSearchMentionQuery('flashcard', debouncedSearch, activeType === 'flashcard');
  const examQuery = useSearchMentionQuery('exam', debouncedSearch, activeType === 'exam');

  const activeQuery =
    activeType === 'set' ? setQuery
    : activeType === 'note' ? noteQuery
    : activeType === 'flashcard' ? flashcardQuery
    : activeType === 'exam' ? examQuery
    : null;

  const items: SearchItem[] = (() => {
    if (!activeQuery || !activeType) return [];
    if (activeType === 'set') {
      return (setQuery.data?.pages ?? []).flatMap(
        (p) => p.data.data as unknown as SearchItem[],
      );
    }
    const q =
      activeType === 'note' ? noteQuery
      : activeType === 'flashcard' ? flashcardQuery
      : examQuery;
    return (q.data?.pages ?? [])
      .flatMap((p) => extractSearchItems((p as Record<string, unknown>).data))
      .filter((item) => !user || Number(item.userId) === user.id);
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const replaceAndClose = (replacement: string) =>
    onChange(value.replace(TRIGGER_RE, replacement));

  const handleCommandSelect = (cmd: (typeof RESOURCE_COMMANDS)[number]) => {
    replaceAndClose(`/${cmd.id}`);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleItemSelect = (item: SearchItem) => {
    if (!activeType) return;
    const id = Number(item.id ?? item.resourceId);
    if (!id) return;
    const rawSetId = item.setId ?? item.set_id;
    const setId = rawSetId != null ? Number(rawSetId) : null;
    const title = String(item.title ?? item.name ?? item.code ?? `${activeType} #${id}`);
    replaceAndClose(title);
    onRefAdded(activeType, { id, setId: activeType === 'set' ? id : setId, title });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const closeAndFocus = () => {
    onChange(value.replace(TRIGGER_RE, '').trimEnd());
    inputRef.current?.focus();
  };

  // Shared keyboard navigation — returns true if the key was consumed
  const handleNavKey = (e: React.KeyboardEvent): boolean => {
    if (!isPickerOpen) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const len = isCommandMode ? visibleCommands.length : items.length;
      setActiveIndex((i) => Math.min(i + 1, len - 1));
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return true;
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      if (isCommandMode) handleCommandSelect(visibleCommands[activeIndex]);
      else handleItemSelect(items[activeIndex]);
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeAndFocus();
      return true;
    }
    return false;
  };

  const handleMainKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (handleNavKey(e)) return;
    onKeyDown?.(e);
  };

  const handleDropdownKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleNavKey(e);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollHeight - el.scrollTop - el.clientHeight < 80 &&
      activeQuery?.hasNextPage &&
      !activeQuery?.isFetchingNextPage
    ) {
      activeQuery.fetchNextPage();
    }
  };

  // Scroll active item into view inside the list container
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const el = listRef.current.querySelector(
      `[data-idx="${activeIndex}"]`,
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const isFetching = activeQuery?.isFetching ?? false;
  const isFetchingNextPage = activeQuery?.isFetchingNextPage ?? false;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='relative flex-1 min-w-0'>
      {hasHighlights && linkedRefs && (
        <div
          ref={highlightRef}
          aria-hidden
          className={`${className ?? ''} absolute inset-0 pointer-events-none select-none overflow-hidden whitespace-pre`}
        >
          {buildHighlightParts(value, linkedRefs).map((p, i) =>
            p.isRef ? (
              <span key={i} style={{ color: 'var(--pl-accent)' }}>{p.t}</span>
            ) : (
              <span key={i}>{p.t}</span>
            ),
          )}
        </div>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); requestAnimationFrame(syncScroll); }}
        onKeyDown={(e) => { handleMainKeyDown(e); requestAnimationFrame(syncScroll); }}
        onScroll={syncScroll}
        placeholder={placeholder}
        className={className}
        style={hasHighlights ? { color: 'transparent', caretColor: 'var(--pl-text)' } : undefined}
        disabled={disabled}
      />

      {isPickerOpen && (
        <div className='absolute left-0 top-full mt-1 w-full z-50 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] shadow-xl overflow-hidden'>

          {/* ── Command picker ──────────────────────────────────────────── */}
          {isCommandMode && (
            <>
              <div className='px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]'>
                Link a resource
              </div>
              {visibleCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  type='button'
                  data-idx={idx}
                  onMouseDown={(e) => { e.preventDefault(); handleCommandSelect(cmd); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[12.5px] text-[var(--pl-text)] border-b border-[var(--pl-border)] last:border-0 transition-colors ${
                    idx === activeIndex
                      ? 'bg-[var(--pl-accent-soft-2)]'
                      : 'hover:bg-[var(--pl-bg-hover)]'
                  }`}
                >
                  <cmd.Icon className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
                  <span>/{cmd.id}</span>
                  <span className='ml-auto text-[10.5px] text-[var(--pl-text-faint)]'>
                    {cmd.label}
                  </span>
                  {idx === activeIndex && (
                    <span className='text-[9px] text-[var(--pl-accent)] border border-[var(--pl-accent-border)] rounded px-1'>
                      ↵
                    </span>
                  )}
                </button>
              ))}
            </>
          )}

          {/* ── Resource picker ─────────────────────────────────────────── */}
          {!isCommandMode && activeType && (() => {
            const activeCmd = RESOURCE_COMMANDS.find((c) => c.id === activeType)!;
            return (
              <>
                {/* Header + dedicated search input */}
                <div className='px-3 pt-2.5 pb-2 border-b border-[var(--pl-border)] bg-[var(--pl-bg-elev)]'>
                  <div className='text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] mb-1.5'>
                    {activeCmd.label}
                  </div>
                  <div className='flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[var(--pl-border)] bg-[var(--pl-bg)] focus-within:border-[var(--pl-accent-border)] transition-colors'>
                    <Search className='w-3 h-3 text-[var(--pl-text-faint)] flex-shrink-0' />
                    <input
                      ref={dropdownSearchRef}
                      value={dropdownSearch}
                      onChange={(e) => setDropdownSearch(e.target.value)}
                      onKeyDown={handleDropdownKeyDown}
                      placeholder={`Search ${activeCmd.label.toLowerCase()}s…`}
                      className='bg-transparent outline-none text-[12px] text-[var(--pl-text)] w-full placeholder:text-[var(--pl-text-faint)]'
                    />
                  </div>
                </div>

                {/* Results list */}
                <div
                  ref={listRef}
                  className='overflow-y-auto'
                  style={{ maxHeight: 220 }}
                  onScroll={handleScroll}
                >
                  {isFetching && items.length === 0 ? (
                    <div className='px-3 py-5 text-xs text-[var(--pl-text-faint)] text-center'>
                      Loading…
                    </div>
                  ) : items.length === 0 ? (
                    <div className='px-3 py-5 text-xs text-[var(--pl-text-faint)] text-center'>
                      No results found
                    </div>
                  ) : (
                    <>
                      {items.map((item, i) => {
                        const label = String(
                          item.title ?? item.name ?? item.code ?? item.id ?? '—',
                        );
                        const isActive = i === activeIndex;
                        return (
                          <button
                            key={i}
                            type='button'
                            data-idx={i}
                            onMouseDown={(e) => { e.preventDefault(); handleItemSelect(item); }}
                            onMouseEnter={() => setActiveIndex(i)}
                            className={`w-full text-left px-3 py-2.5 text-[12.5px] text-[var(--pl-text)] border-b border-[var(--pl-border)] last:border-0 flex items-center gap-2.5 transition-colors ${
                              isActive
                                ? 'bg-[var(--pl-accent-soft-2)]'
                                : 'hover:bg-[var(--pl-bg-hover)]'
                            }`}
                          >
                            <activeCmd.Icon className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
                            <span className='truncate flex-1'>{label}</span>
                            {isActive && (
                              <span className='text-[9px] text-[var(--pl-accent)] border border-[var(--pl-accent-border)] rounded px-1 flex-shrink-0'>
                                ↵
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {isFetchingNextPage && (
                        <div className='px-3 py-2 text-xs text-[var(--pl-text-faint)] text-center'>
                          Loading more…
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// ─── Alias for backward compat ────────────────────────────────────────────────
export const SetMentionInput = ResourceMentionInput;
