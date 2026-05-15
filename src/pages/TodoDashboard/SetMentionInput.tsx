/* eslint-disable react-refresh/only-export-components */
import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { ResourceRef } from '@/services/types/todo.types';
import {
  TRIGGER_RE,
  RESOURCE_COMMANDS,
  type MentionResourceType,
  type SearchItem,
} from './mentionTypes';
import { extractSearchItems } from './mentionHelpers';
import { useSetMentionQuery, useSearchMentionQuery } from './useMentionQueries';

// ─── Re-exports for existing importers ───────────────────────────────────────
export type { MentionResourceType } from './mentionTypes';
export {
  renderTitleWithRefs,
  renderTitleWithSetRefs,
} from './mentionTitleRenderer';
export { LinkedResourceChips } from './LinkedResourceChips';

// ─── Props ────────────────────────────────────────────────────────────────────
export type ResourceMentionInputProps = {
  value: string;
  onChange: (v: string) => void;
  onRefAdded: (type: MentionResourceType, ref: ResourceRef) => void;
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
  placeholder,
  className,
  disabled,
  onKeyDown,
}: ResourceMentionInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Detect /word at end of string
  const match = TRIGGER_RE.exec(value);
  const triggerWord = match ? match[1].toLowerCase() : null;

  // Determine state
  const activeCommand =
    triggerWord !== null
      ? RESOURCE_COMMANDS.find((c) => triggerWord.startsWith(c.id))
      : null;

  const activeType = activeCommand?.id ?? null;
  const searchQuery = activeType ? triggerWord!.slice(activeType.length) : '';

  // Command picker: triggerWord is defined but no full type matches yet
  const isCommandMode = triggerWord !== null && !activeType;
  const filteredCommands = isCommandMode
    ? RESOURCE_COMMANDS.filter((c) => c.id.startsWith(triggerWord!))
    : [];

  // ── Queries (always called, enabled conditionally) ──────────────────────
  const setQuery = useSetMentionQuery(searchQuery, activeType === 'set');

  const noteQuery = useSearchMentionQuery(
    'note',
    searchQuery,
    activeType === 'note',
  );
  const flashcardQuery = useSearchMentionQuery(
    'flashcard',
    searchQuery,
    activeType === 'flashcard',
  );
  const examQuery = useSearchMentionQuery(
    'exam',
    searchQuery,
    activeType === 'exam',
  );

  // Pick the active query
  const activeQuery =
    activeType === 'set'
      ? setQuery
      : activeType === 'note'
        ? noteQuery
        : activeType === 'flashcard'
          ? flashcardQuery
          : activeType === 'exam'
            ? examQuery
            : null;

  // Build items list
  const items: SearchItem[] = (() => {
    if (!activeQuery || !activeType) return [];
    if (activeType === 'set') {
      const pages = setQuery.data?.pages ?? [];
      return pages.flatMap((p) => p.data.data as unknown as SearchItem[]);
    }
    const searchQ =
      activeType === 'note'
        ? noteQuery
        : activeType === 'flashcard'
          ? flashcardQuery
          : examQuery;
    return (searchQ.data?.pages ?? [])
      .flatMap((p) => extractSearchItems((p as Record<string, unknown>).data))
      .filter((item) => !user || Number(item.userId) === user.id);
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────
  const replaceAndClose = (replacement: string) => {
    onChange(value.replace(TRIGGER_RE, replacement));
  };

  const handleCommandSelect = (cmd: (typeof RESOURCE_COMMANDS)[number]) => {
    // Replace trigger with the full command name so the resource picker activates
    replaceAndClose(`/${cmd.id}`);
    // Move cursor to end of input (async because onChange is batched)
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleItemSelect = (item: SearchItem) => {
    if (!activeType) return;
    const id = Number(item.id ?? item.resourceId);
    if (!id) return;
    const rawSetId = item.setId ?? item.set_id;
    const setId = rawSetId != null ? Number(rawSetId) : null;
    const title = String(
      item.title ?? item.name ?? item.code ?? `${activeType} #${id}`,
    );
    replaceAndClose(title);
    onRefAdded(activeType, {
      id,
      setId: activeType === 'set' ? id : setId,
      title,
    });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && triggerWord !== null) {
      e.preventDefault();
      // Strip the /xxx trigger from the value
      onChange(value.replace(TRIGGER_RE, '').trimEnd());
      return;
    }
    onKeyDown?.(e);
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

  const isPickerOpen = isCommandMode || !!activeType;
  const isFetching = activeQuery?.isFetching ?? false;
  const isFetchingNextPage = activeQuery?.isFetchingNextPage ?? false;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className='relative flex-1 min-w-0'>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />

      {isPickerOpen && (
        <div
          ref={listRef}
          className='absolute left-0 top-full mt-1 w-full z-50 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] shadow-xl overflow-hidden'
        >
          {/* ── Command picker ─────────────────────────────────── */}
          {isCommandMode && (
            <>
              <div className='px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]'>
                Link a resource
              </div>
              {(filteredCommands.length
                ? filteredCommands
                : RESOURCE_COMMANDS
              ).map((cmd) => (
                <button
                  key={cmd.id}
                  type='button'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCommandSelect(cmd);
                  }}
                  className='w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[12.5px] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 transition-colors'
                >
                  <cmd.Icon className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
                  <span>/{cmd.id}</span>
                  <span className='ml-auto text-[10.5px] text-[var(--pl-text-faint)]'>
                    {cmd.label}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* ── Resource picker ────────────────────────────────── */}
          {!isCommandMode && activeType && (
            <>
              <div className='px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]'>
                {RESOURCE_COMMANDS.find((c) => c.id === activeType)?.label}
                {searchQuery && (
                  <span className='ml-1 normal-case opacity-70'>
                    · "{searchQuery}"
                  </span>
                )}
              </div>

              <div
                className='overflow-y-auto'
                style={{ maxHeight: 200 }}
                onScroll={handleScroll}
              >
                {/* Note/Flashcard/Exam: require search query */}
                {activeType !== 'set' && searchQuery.length === 0 ? (
                  <div className='px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center'>
                    Type to search{' '}
                    {RESOURCE_COMMANDS.find(
                      (c) => c.id === activeType,
                    )?.label.toLowerCase()}
                    s…
                  </div>
                ) : isFetching && items.length === 0 ? (
                  <div className='px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center'>
                    Loading…
                  </div>
                ) : items.length === 0 ? (
                  <div className='px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center'>
                    No results found
                  </div>
                ) : (
                  <>
                    {items.map((item, i) => {
                      const ItemIcon = RESOURCE_COMMANDS.find(
                        (c) => c.id === activeType,
                      )!.Icon;
                      const label = String(
                        item.title ?? item.name ?? item.code ?? item.id ?? '—',
                      );
                      return (
                        <button
                          key={i}
                          type='button'
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleItemSelect(item);
                          }}
                          className='w-full text-left px-3 py-2.5 text-[12.5px] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 flex items-center gap-2.5 transition-colors'
                        >
                          <ItemIcon className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
                          <span className='truncate'>{label}</span>
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
          )}
        </div>
      )}
    </div>
  );
};

// ─── Alias for backward compat ────────────────────────────────────────────────
export const SetMentionInput = ResourceMentionInput;
