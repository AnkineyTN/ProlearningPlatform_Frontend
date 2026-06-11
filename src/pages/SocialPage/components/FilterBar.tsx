import { BookOpen, Brain, ClipboardList, Search, TrendingUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
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

  const SORTS: { id: SortType; label: string }[] = [
    { id: 'newest', label: t('social.sortNewest') },
    { id: 'oldest', label: t('social.sortOldest') },
    { id: 'az', label: t('social.sortAZ') },
    { id: 'za', label: t('social.sortZA') },
  ];

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
    { id: 'all', label: t('social.filterAll'), count: allCount, icon: TrendingUp },
    { id: 'NOTE', label: t('social.notes'), count: counts.NOTE, icon: BookOpen },
    { id: 'FLASHCARD', label: t('social.flashcards'), count: counts.FLASHCARD, icon: Brain },
    { id: 'EXAM', label: t('social.exams'), count: counts.EXAM, icon: ClipboardList },
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
              <Button
                key={tab.id}
                variant='ghost'
                onClick={() => setFilter(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] h-auto',
                  active
                    ? 'text-[var(--pl-accent)] font-medium bg-[var(--pl-accent-soft)]'
                    : 'text-[var(--pl-text-muted)]',
                )}
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
              </Button>
            );
          })}
        </div>

        {/* Search + sort */}
        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2 px-3 py-1.5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full min-w-[200px] focus-within:border-[var(--pl-accent-border)] transition-colors'>
            <Search size={13} className='text-[var(--pl-text-faint)] shrink-0' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t('social.searchPlaceholder')}
              className='flex-1 text-[12.5px] bg-transparent text-[var(--pl-text)] placeholder:text-[var(--pl-text-faint)] outline-none'
            />
            {query && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => { setQuery(''); onSearch(); }}
                className='size-4 text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] hover:bg-transparent'
              >
                <X size={12} />
              </Button>
            )}
          </div>

          <Button
            onClick={onSearch}
            className='rounded-full h-auto px-3.5 py-1.5 text-[12.5px] gap-1.5'
          >
            <Search size={13} />
            {t('social.searchButton')}
          </Button>

          <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
            <SelectTrigger
              size='sm'
              className='rounded-full border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[12.5px] text-[var(--pl-text)] h-auto py-1.5'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
