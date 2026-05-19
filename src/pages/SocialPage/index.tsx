/* eslint-disable @typescript-eslint/no-explicit-any */
import { BookOpen, Brain, ClipboardList, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NoteCard from '@/components/cards/NoteCard';
import FlashcardCard from '@/components/cards/FlashCard';
import ExamCard from '@/components/cards/ExamCard';
import { socialAPI } from '@/services/endpoints/social';
import type { SocialNote } from '@/services/types/social.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionType = 'NOTE' | 'FLASHCARD' | 'EXAM';

type PaginationMeta = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
};

type SectionState = {
  items: SocialNote[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  query: string;
  page: number;
};

const DEFAULT_SECTION: SectionState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
  query: '',
  page: 1,
};

// ─── Section config ────────────────────────────────────────────────────────────

const SECTIONS: {
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

const PAGE_SIZE = 8;

// ─── SearchBar ─────────────────────────────────────────────────────────────────

type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder,
}: SearchBarProps) => {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className='relative flex items-center gap-2'>
      <div className='relative flex-1'>
        <Search
          size={14}
          className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] pointer-events-none'
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder ?? 'Search…'}
          className='w-full h-9 pl-9 pr-8 text-[13px] rounded-[9px] border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[var(--pl-text)] placeholder:text-[var(--pl-text-faint)] outline-none focus:border-[var(--pl-accent-border)] transition-colors'
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              onSearch();
            }}
            className='absolute right-2 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] transition-colors'
          >
            <X size={13} />
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        className='h-9 px-4 rounded-[9px] bg-[oklch(var(--pl-accent-l)_var(--pl-accent-c)_var(--pl-accent-h))] text-white text-[13px] font-medium hover:opacity-90 transition-opacity shrink-0'
      >
        Search
      </button>
    </div>
  );
};

// ─── SectionHeader ─────────────────────────────────────────────────────────────

type SectionHeaderProps = {
  icon: React.ElementType;
  label: string;
  count?: number;
  sectionType: SectionType;
  sectionState: SectionState;
  onQueryChange: (type: SectionType, q: string) => void;
  onSearch: (type: SectionType) => void;
};

const SectionHeader = ({
  icon: Icon,
  label,
  count,
  sectionType,
  sectionState,
  onQueryChange,
  onSearch,
}: SectionHeaderProps) => (
  <div className='mb-5'>
    <div className='flex items-center gap-2 mb-4'>
      <div
        className='w-8 h-8 rounded-[8px] grid place-items-center shrink-0'
        style={{
          background:
            'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.12)',
          color:
            'oklch(var(--pl-accent-l) var(--pl-accent-c) calc(var(--pl-accent-h) - 10))',
        }}
      >
        <Icon size={15} />
      </div>
      <h2 className='text-[16px] font-semibold text-[var(--pl-text)] tracking-[-0.01em]'>
        {label}
      </h2>
      {count !== undefined && (
        <span className='ml-1 px-2 py-[2px] rounded-full bg-[var(--pl-bg-hover)] text-[11px] font-medium text-[var(--pl-text-muted)]'>
          {count}
        </span>
      )}
    </div>
    <SearchBar
      value={sectionState.query}
      onChange={(q) => onQueryChange(sectionType, q)}
      onSearch={() => onSearch(sectionType)}
      placeholder={`Search ${label.toLowerCase()}…`}
    />
  </div>
);

// ─── LoadMore ──────────────────────────────────────────────────────────────────

type LoadMoreProps = {
  meta: PaginationMeta | null;
  loading: boolean;
  onLoadMore: () => void;
};

const LoadMore = ({ meta, loading, onLoadMore }: LoadMoreProps) => {
  if (!meta || meta.currentPage >= meta.totalPages) return null;
  return (
    <div className='flex justify-center mt-5'>
      <button
        onClick={onLoadMore}
        disabled={loading}
        className='px-5 py-2 rounded-[9px] border border-[var(--pl-border)] text-[13px] text-[var(--pl-text-muted)] hover:border-[var(--pl-accent-border)] hover:text-[var(--pl-text)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  );
};

// ─── SkeletonCard ──────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] p-[18px] flex flex-col gap-3 animate-pulse'>
    <div className='flex justify-between'>
      <div className='w-9 h-9 rounded-[9px] bg-[var(--pl-bg-hover)]' />
      <div className='w-7 h-7 rounded-[6px] bg-[var(--pl-bg-hover)]' />
    </div>
    <div className='h-4 w-3/4 rounded-md bg-[var(--pl-bg-hover)]' />
    <div className='h-3 w-full rounded-md bg-[var(--pl-bg-hover)]' />
    <div className='h-3 w-5/6 rounded-md bg-[var(--pl-bg-hover)]' />
    <div className='mt-auto pt-3 border-t border-[var(--pl-border)] flex justify-between'>
      <div className='h-3 w-16 rounded-md bg-[var(--pl-bg-hover)]' />
      <div className='h-3 w-12 rounded-md bg-[var(--pl-bg-hover)]' />
    </div>
  </div>
);

// ─── CardGrid ──────────────────────────────────────────────────────────────────

type CardGridProps = {
  type: SectionType;
  state: SectionState;
};

const CardGrid = ({ type, state }: CardGridProps) => {
  const { loading, error, items } = state;

  if (error) {
    return (
      <div className='py-10 text-center text-[13px] text-[oklch(0.65_0.2_25)]'>
        Failed to load. Please try again.
      </div>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <div className='py-10 text-center text-[13px] text-[var(--pl-text-faint)]'>
        No results found.
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {items.map((item) => {
        if (type === 'NOTE')
          return (
            <NoteCard
              key={item.id}
              note={item as any}
              onAccess={(id) => console.log('access note', id)}
            />
          );
        if (type === 'FLASHCARD')
          return (
            <FlashcardCard
              key={item.id}
              flashcard={item as any}
              onAccess={(id) => console.log('access flashcard', id)}
            />
          );
        return (
          <ExamCard
            key={item.id}
            exam={item as any}
            onAccess={(id) => console.log('access exam', id)}
          />
        );
      })}
      {loading &&
        Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`sk-${i}`} />
        ))}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SocialExplorePage = () => {
  const { t } = useTranslation();

  const [sections, setSections] = useState<Record<SectionType, SectionState>>({
    NOTE: { ...DEFAULT_SECTION },
    FLASHCARD: { ...DEFAULT_SECTION },
    EXAM: { ...DEFAULT_SECTION },
  });

  // Track active fetch (abort stale requests)
  const abortRefs = useRef<Partial<Record<SectionType, AbortController>>>({});

  const fetchSection = useCallback(
    async (type: SectionType, page: number, query: string, append = false) => {
      // Abort previous fetch for this section
      abortRefs.current[type]?.abort();
      const controller = new AbortController();
      abortRefs.current[type] = controller;

      setSections((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: true, error: null },
      }));

      try {
        const section = SECTIONS.find((s) => s.type === type)!;
        const res = await section.fetchFn({ q: query, page, size: PAGE_SIZE });
        const { data, metadata } = res.data;

        setSections((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            items: append ? [...prev[type].items, ...data] : data,
            meta: metadata,
            loading: false,
            page,
          },
        }));
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        setSections((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            loading: false,
            error: 'Failed to fetch.',
          },
        }));
      }
    },
    [],
  );

  // Initial fetch for all sections
  useEffect(() => {
    (['NOTE', 'FLASHCARD', 'EXAM'] as SectionType[]).forEach((type) => {
      fetchSection(type, 1, '');
    });
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(abortRefs.current).forEach((c) => c?.abort());
    };
  }, [fetchSection]);

  const handleQueryChange = (type: SectionType, q: string) => {
    setSections((prev) => ({
      ...prev,
      [type]: { ...prev[type], query: q },
    }));
  };

  const handleSearch = (type: SectionType) => {
    const q = sections[type].query;
    fetchSection(type, 1, q, false);
  };

  const handleLoadMore = (type: SectionType) => {
    const { page, query } = sections[type];
    fetchSection(type, page + 1, query, true);
  };

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] px-4 py-8 md:px-8'>
      {/* Page header */}
      <div className='mb-10'>
        <h1
          style={{ fontFamily: 'var(--font-display)' }}
          className='text-[28px] font-bold text-[var(--pl-text)] tracking-[-0.02em] mb-1'
        >
          {t('social.explore', 'Explore')}
        </h1>
        <p className='text-[13.5px] text-[var(--pl-text-muted)]'>
          {t(
            'social.exploreDesc',
            'Discover notes, flashcards, and exams shared by the community.',
          )}
        </p>
      </div>

      {/* Sections */}
      <div className='flex flex-col gap-12'>
        {SECTIONS.map(({ type, labelKey, icon }) => (
          <section key={type}>
            <SectionHeader
              icon={icon}
              label={t(labelKey, type)}
              count={sections[type].meta?.totalItems}
              sectionType={type}
              sectionState={sections[type]}
              onQueryChange={handleQueryChange}
              onSearch={handleSearch}
            />
            <CardGrid type={type} state={sections[type]} />
            <LoadMore
              meta={sections[type].meta}
              loading={sections[type].loading}
              onLoadMore={() => handleLoadMore(type)}
            />
          </section>
        ))}
      </div>
    </div>
  );
};

export default SocialExplorePage;
