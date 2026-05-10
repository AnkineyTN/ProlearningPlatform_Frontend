import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BookOpen, FileText, FlipHorizontal, GraduationCap } from "lucide-react";
import { setAPI } from "@/services/endpoints/sets";
import { searchAPI } from "@/services/endpoints/search";
import { useAuth } from "@/hooks/useAuth";
import type { ResourceRef } from "@/services/types/todo.types";
import type { SearchResourceType } from "@/services/types/search.types";

// ─── Types ─────────────────────────────────────────────────────────────────
export type MentionResourceType = "set" | "note" | "flashcard" | "exam";

type SetItem = { id: number; title: string };
type SearchItem = Record<string, unknown>;

// ─── Constants ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

// Matches / followed by any non-whitespace chars at the end of the string
const TRIGGER_RE = /\/(\S*)$/;

const RESOURCE_COMMANDS = [
  { id: "set" as MentionResourceType, label: "Set", Icon: BookOpen },
  { id: "note" as MentionResourceType, label: "Note", Icon: FileText },
  { id: "flashcard" as MentionResourceType, label: "Flashcard", Icon: FlipHorizontal },
  { id: "exam" as MentionResourceType, label: "Exam", Icon: GraduationCap },
];

const SEARCH_TYPE_MAP: Record<MentionResourceType, SearchResourceType> = {
  set: "SET",
  note: "NOTE",
  flashcard: "FLASHCARD",
  exam: "EXAM",
};

// ─── Helper: parse globalSearch response items ──────────────────────────────
function extractSearchItems(data: unknown): SearchItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as SearchItem[];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.content)) return o.content as SearchItem[];
  if (Array.isArray(o.items)) return o.items as SearchItem[];
  if (Array.isArray(o.data)) return o.data as SearchItem[];
  return [];
}

type SearchMeta = { currentPage: number; totalPages: number } | undefined;
function extractSearchMeta(page: unknown): SearchMeta {
  const o = page as Record<string, unknown> | undefined;
  const m = o?.metadata as SearchMeta;
  return m;
}

// ─── Sub-query: Sets (setAPI, infinity scroll) ──────────────────────────────
const useSetMentionQuery = (searchQuery: string, enabled: boolean) =>
  useInfiniteQuery({
    queryKey: ["mention-sets", searchQuery],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      setAPI.getSetData({
        page: pageParam as number,
        size: PAGE_SIZE,
        sort: [{ property: "id", direction: "DESC" }],
        q: searchQuery || undefined,
      }),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const meta = lastPage.data.metadata;
      return meta && (lastPageParam as number) + 1 < meta.totalPages
        ? (lastPageParam as number) + 1
        : undefined;
    },
    enabled,
    staleTime: 30_000,
  });

// ─── Sub-query: Note / Flashcard / Exam (searchAPI, infinity scroll) ────────
const useSearchMentionQuery = (
  type: MentionResourceType,
  searchQuery: string,
  enabled: boolean,
) =>
  useInfiniteQuery({
    queryKey: ["mention-search", type, searchQuery],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await searchAPI.search({
        keyword: searchQuery,
        searchType: SEARCH_TYPE_MAP[type],
        page: pageParam as number,
        size: PAGE_SIZE,
      });
      return res.data;
    },
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const meta = extractSearchMeta(lastPage);
      return meta && (lastPageParam as number) + 1 < meta.totalPages
        ? (lastPageParam as number) + 1
        : undefined;
    },
    enabled: enabled && searchQuery.length > 0,
    staleTime: 30_000,
  });

// ─── Props ──────────────────────────────────────────────────────────────────
export type ResourceMentionInputProps = {
  value: string;
  onChange: (v: string) => void;
  onRefAdded: (type: MentionResourceType, ref: ResourceRef) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

// ─── Main component ─────────────────────────────────────────────────────────
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
  const activeCommand = triggerWord !== null
    ? RESOURCE_COMMANDS.find((c) => triggerWord.startsWith(c.id))
    : null;

  const activeType = activeCommand?.id ?? null;
  const searchQuery = activeType ? triggerWord!.slice(activeType.length) : "";

  // Command picker: triggerWord is defined but no full type matches yet
  const isCommandMode = triggerWord !== null && !activeType;
  const filteredCommands = isCommandMode
    ? RESOURCE_COMMANDS.filter((c) => c.id.startsWith(triggerWord!))
    : [];

  // ── Queries (always called, enabled conditionally) ──────────────────────
  const setQuery = useSetMentionQuery(searchQuery, activeType === "set");

  const noteQuery = useSearchMentionQuery("note", searchQuery, activeType === "note");
  const flashcardQuery = useSearchMentionQuery("flashcard", searchQuery, activeType === "flashcard");
  const examQuery = useSearchMentionQuery("exam", searchQuery, activeType === "exam");

  // Pick the active query
  const activeQuery =
    activeType === "set" ? setQuery
    : activeType === "note" ? noteQuery
    : activeType === "flashcard" ? flashcardQuery
    : activeType === "exam" ? examQuery
    : null;

  // Build items list
  const items: SearchItem[] = (() => {
    if (!activeQuery || !activeType) return [];
    if (activeType === "set") {
      const pages = (setQuery.data?.pages ?? []);
      return pages.flatMap((p) => p.data.data as unknown as SearchItem[]);
    }
    const searchQ = activeType === "note" ? noteQuery
      : activeType === "flashcard" ? flashcardQuery
      : examQuery;
    return (searchQ.data?.pages ?? []).flatMap((p) =>
      extractSearchItems((p as Record<string, unknown>).data),
    ).filter((item) => !user || Number(item.userId) === user.id);
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const replaceAndClose = (replacement: string) => {
    onChange(value.replace(TRIGGER_RE, replacement));
  };

  const handleCommandSelect = (cmd: typeof RESOURCE_COMMANDS[number]) => {
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
    const title = String(item.title ?? item.name ?? item.code ?? `${activeType} #${id}`);
    replaceAndClose(title);
    onRefAdded(activeType, { id, setId: activeType === "set" ? id : setId, title });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && triggerWord !== null) {
      e.preventDefault();
      // Strip the /xxx trigger from the value
      onChange(value.replace(TRIGGER_RE, "").trimEnd());
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
    <div className="relative flex-1 min-w-0">
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
          className="absolute left-0 top-full mt-1 w-full z-50 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] shadow-xl overflow-hidden"
        >
          {/* ── Command picker ─────────────────────────────────── */}
          {isCommandMode && (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]">
                Link a resource
              </div>
              {(filteredCommands.length ? filteredCommands : RESOURCE_COMMANDS).map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleCommandSelect(cmd); }}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 text-[12.5px] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 transition-colors"
                >
                  <cmd.Icon className="w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]" />
                  <span>/{cmd.id}</span>
                  <span className="ml-auto text-[10.5px] text-[var(--pl-text-faint)]">{cmd.label}</span>
                </button>
              ))}
            </>
          )}

          {/* ── Resource picker ────────────────────────────────── */}
          {!isCommandMode && activeType && (
            <>
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--pl-accent-strong)] bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]">
                {RESOURCE_COMMANDS.find((c) => c.id === activeType)?.label}
                {searchQuery && <span className="ml-1 normal-case opacity-70">· "{searchQuery}"</span>}
              </div>

              <div
                className="overflow-y-auto"
                style={{ maxHeight: 200 }}
                onScroll={handleScroll}
              >
                {/* Note/Flashcard/Exam: require search query */}
                {activeType !== "set" && searchQuery.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center">
                    Type to search {RESOURCE_COMMANDS.find((c) => c.id === activeType)?.label.toLowerCase()}s…
                  </div>
                ) : isFetching && items.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center">Loading…</div>
                ) : items.length === 0 ? (
                  <div className="px-3 py-4 text-xs text-[var(--pl-text-faint)] text-center">No results found</div>
                ) : (
                  <>
                    {items.map((item, i) => {
                      const ItemIcon = RESOURCE_COMMANDS.find((c) => c.id === activeType)!.Icon;
                      const label = String(item.title ?? item.name ?? item.code ?? item.id ?? "—");
                      return (
                        <button
                          key={i}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleItemSelect(item); }}
                          className="w-full text-left px-3 py-2.5 text-[12.5px] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 flex items-center gap-2.5 transition-colors"
                        >
                          <ItemIcon className="w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]" />
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                    {isFetchingNextPage && (
                      <div className="px-3 py-2 text-xs text-[var(--pl-text-faint)] text-center">
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

// ─── Alias for backward compat ──────────────────────────────────────────────
export const SetMentionInput = ResourceMentionInput;

// ─── Title renderer ─────────────────────────────────────────────────────────
/** Renders a todo title with any embedded resource names as clickable links. */
export function renderTitleWithRefs(
  title: string,
  todo: {
    setRefs?: ResourceRef[];
    noteRefs?: ResourceRef[];
    flashcardRefs?: ResourceRef[];
    examRefs?: ResourceRef[];
  },
  isDone: boolean,
): React.ReactNode {
  type RefWithUrl = { ref: ResourceRef; url: string };

  const collect = (refs: ResourceRef[] | undefined, getUrl: (r: ResourceRef) => string): RefWithUrl[] =>
    (refs ?? []).filter((r) => r.title && title.includes(r.title)).map((r) => ({ ref: r, url: getUrl(r) }));

  const allLinked: RefWithUrl[] = [
    ...collect(todo.setRefs, (r) => `/sets/${r.id}`),
    ...collect(todo.noteRefs, (r) => `/sets/${r.setId}/notes/${r.id}`),
    ...collect(todo.flashcardRefs, (r) => `/sets/${r.setId}/flashcards/${r.id}`),
    ...collect(todo.examRefs, (r) => `/sets/${r.setId}/exams/${r.id}`),
  ];

  if (!allLinked.length) return title;

  let parts: (string | React.ReactElement)[] = [title];

  allLinked.forEach(({ ref, url }, refIdx) => {
    const newParts: typeof parts = [];
    parts.forEach((part, partIdx) => {
      if (typeof part !== "string") { newParts.push(part); return; }
      const idx = part.indexOf(ref.title!);
      if (idx === -1) { newParts.push(part); return; }
      if (idx > 0) newParts.push(part.slice(0, idx));
      newParts.push(
        <a
          key={`${refIdx}-${partIdx}`}
          href={url}
          onClick={(e) => e.stopPropagation()}
          className={`font-semibold hover:underline ${isDone ? "opacity-50" : ""}`}
          style={{ color: "var(--pl-accent)" }}
        >
          {ref.title}
        </a>,
      );
      const after = part.slice(idx + ref.title!.length);
      if (after) newParts.push(after);
    });
    parts = newParts;
  });

  return <>{parts}</>;
}

/** Backward-compat alias. */
export const renderTitleWithSetRefs = (
  title: string,
  setRefs: ResourceRef[],
  isDone: boolean,
) => renderTitleWithRefs(title, { setRefs }, isDone);

// ─── Linked resource chips (for task rows) ──────────────────────────────────
type ChipDef = { ref: ResourceRef; url: string; Icon: React.ElementType; color: string };

const CHIP_STYLES: Record<MentionResourceType, { color: string; Icon: React.ElementType }> = {
  set:       { color: "oklch(0.7 0.15 260)",  Icon: BookOpen },
  note:      { color: "oklch(0.72 0.12 180)", Icon: FileText },
  flashcard: { color: "oklch(0.7 0.15 310)",  Icon: FlipHorizontal },
  exam:      { color: "oklch(0.72 0.15 40)",  Icon: GraduationCap },
};

function buildChips(todo: {
  setRefs?: ResourceRef[];
  noteRefs?: ResourceRef[];
  flashcardRefs?: ResourceRef[];
  examRefs?: ResourceRef[];
}): ChipDef[] {
  const add = (refs: ResourceRef[] | undefined, type: MentionResourceType, getUrl: (r: ResourceRef) => string) =>
    (refs ?? []).filter((r) => r.title).map((r) => ({
      ref: r,
      url: getUrl(r),
      ...CHIP_STYLES[type],
    }));

  return [
    ...add(todo.setRefs, "set", (r) => `/sets/${r.id}`),
    ...add(todo.noteRefs, "note", (r) => `/sets/${r.setId}/notes/${r.id}`),
    ...add(todo.flashcardRefs, "flashcard", (r) => `/sets/${r.setId}/flashcards/${r.id}`),
    ...add(todo.examRefs, "exam", (r) => `/sets/${r.setId}/exams/${r.id}`),
  ];
}

/** Small chips showing linked resources, rendered next to Priority in task rows. */
export const LinkedResourceChips = ({
  todo,
}: {
  todo: {
    setRefs?: ResourceRef[];
    noteRefs?: ResourceRef[];
    flashcardRefs?: ResourceRef[];
    examRefs?: ResourceRef[];
  };
}) => {
  const chips = buildChips(todo);
  if (!chips.length) return null;

  return (
    <>
      {chips.map(({ ref, url, Icon, color }, i) => (
        <a
          key={`${ref.id}-${i}`}
          href={url}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 hover:opacity-80 transition-opacity"
          style={{
            color,
            borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
            background: `color-mix(in oklch, ${color} 10%, transparent)`,
          }}
        >
          <Icon className="w-2.5 h-2.5" />
          <span className="max-w-[80px] truncate">{ref.title}</span>
        </a>
      ))}
    </>
  );
};
