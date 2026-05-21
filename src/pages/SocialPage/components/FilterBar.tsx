import {
  BookOpen,
  Brain,
  ClipboardList,
  ChevronDown,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { FilterType, SortType } from '../types';

type Props = {
  filter: FilterType;
  setFilter: (f: FilterType) => void;
  sort: SortType;
  setSort: (s: SortType) => void;
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  counts: {
    NOTE: number | null;
    FLASHCARD: number | null;
    EXAM: number | null;
  };
};

const SORTS: { id: SortType; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'recent', label: 'Recent' },
  { id: 'liked', label: 'Most liked' },
];

const FilterBar = ({
  filter,
  setFilter,
  sort,
  setSort,
  query,
  setQuery,
  onSearch,
  counts,
}: Props) => {
  const { t } = useTranslation();

  const allCount =
    counts.NOTE !== null && counts.FLASHCARD !== null && counts.EXAM !== null
      ? counts.NOTE + counts.FLASHCARD + counts.EXAM
      : null;

  const tabs: {
    id: FilterType;
    label: string;
    count: number | null;
    icon: React.ElementType;
  }[] = [
    { id: 'all', label: 'All', count: allCount, icon: TrendingUp },
    {
      id: 'NOTE',
      label: t('social.notes', 'Notes'),
      count: counts.NOTE,
      icon: BookOpen,
    },
    {
      id: 'FLASHCARD',
      label: t('social.flashcards', 'Flashcards'),
      count: counts.FLASHCARD,
      icon: Brain,
    },
    {
      id: 'EXAM',
      label: t('social.exams', 'Exams'),
      count: counts.EXAM,
      icon: ClipboardList,
    },
  ];

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className='flex flex-col gap-3 pb-4 mb-6 border-b border-[var(--pl-border)]'>
      <div className='flex items-center justify-between gap-3 flex-wrap'>
        {/* Type tabs */}
        <div className='flex gap-1 flex-wrap'>
          {tabs.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] transition-all'
                style={
                  active
                    ? {
                        background:
                          'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.12)',
                        color: 'var(--pl-accent)',
                        fontWeight: 500,
                      }
                    : { color: 'var(--pl-text-muted)' }
                }
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    style={{ fontFamily: 'var(--font-mono-pl)' }}
                    className='text-[10.5px] opacity-75'
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + sort */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full min-w-[200px] focus-within:border-[var(--pl-accent-border)] transition-colors'>
            <Search
              size={13}
              className='text-[var(--pl-text-faint)] shrink-0'
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder='Search the community'
              className='flex-1 text-[12.5px] bg-transparent text-[var(--pl-text)] placeholder:text-[var(--pl-text-faint)] outline-none'
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  onSearch();
                }}
                className='text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] transition-colors'
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className='flex items-center gap-1.5 px-3 py-1.5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full text-[12.5px] text-[var(--pl-text)]'>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortType)}
              className='bg-transparent text-[12.5px] text-[var(--pl-text)] outline-none appearance-none cursor-pointer pr-4'
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className='text-[var(--pl-text-faint)] -ml-4 pointer-events-none shrink-0'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
