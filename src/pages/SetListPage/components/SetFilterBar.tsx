import { Search, ArrowUpDown, Grid2x2, List, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ListPrivacyFilter,
  ListSortOption,
} from '@/components/lists/ResourceFiltersBar';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'table';

const ALL_SENTINEL = '__all__';

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  privacy: ListPrivacyFilter;
  onPrivacyChange: (v: ListPrivacyFilter) => void;
  sort: ListSortOption;
  onSortChange: (v: ListSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onClearFilters?: () => void;
};

export default function SetFilterBar({
  search,
  onSearchChange,
  privacy,
  onPrivacyChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  onClearFilters,
}: Props) {
  const hasActiveFilters =
    search.length > 0 || privacy !== '' || sort !== 'id,DESC';
  const { t } = useTranslation();

  const privacyOptions: { value: ListPrivacyFilter; label: string }[] = [
    {
      value: '',
      label: t('list.filter.privacyAll', { defaultValue: 'All privacy' }),
    },
    {
      value: 'PUBLIC',
      label: t('list.filter.public', { defaultValue: 'Public' }),
    },
    {
      value: 'PRIVATE',
      label: t('list.filter.private', { defaultValue: 'Private' }),
    },
  ];

  const sortOptions: { value: ListSortOption; label: string }[] = [
    {
      value: 'id,DESC',
      label: t('list.filter.sortNewest', { defaultValue: 'Newest first' }),
    },
    {
      value: 'id,ASC',
      label: t('list.filter.sortOldest', { defaultValue: 'Oldest first' }),
    },
    {
      value: 'title,ASC',
      label: t('list.filter.sortTitleAsc', { defaultValue: 'Title A → Z' }),
    },
    {
      value: 'title,DESC',
      label: t('list.filter.sortTitleDesc', { defaultValue: 'Title Z → A' }),
    },
  ];

  return (
    <div className='flex items-center justify-between gap-2 mb-0'>
      {/* Search */}
      <div className='flex items-center gap-2'>
        <div
          className='flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] w-56'
          style={{
            background: 'var(--pl-bg-elev)',
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text-faint)',
          }}
        >
          <Search size={12} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('setlist.searchPlaceholder', {
              defaultValue: 'Search sets…',
            })}
            className='bg-transparent outline-none flex-1 text-[12.5px] h-3.5'
            style={{ color: 'var(--pl-text)' }}
          />
        </div>

        {/* Privacy filter */}
        <Select
          value={privacy === '' ? ALL_SENTINEL : privacy}
          onValueChange={(v) =>
            onPrivacyChange((v === ALL_SENTINEL ? '' : v) as ListPrivacyFilter)
          }
        >
          <SelectTrigger
            size='sm'
            className='min-w-[130px] bg-[var(--pl-bg-elev)] border-[var(--pl-border)] rounded-lg text-[12.5px] text-[var(--pl-text-muted)] focus-visible:border-[var(--pl-accent-border)] focus-visible:ring-0'
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {privacyOptions.map((o) => (
              <SelectItem
                key={o.value}
                value={o.value === '' ? ALL_SENTINEL : o.value}
              >
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={sort}
          onValueChange={(v) => onSortChange(v as ListSortOption)}
        >
          <SelectTrigger
            size='sm'
            className='min-w-[140px] bg-[var(--pl-bg-elev)] border-[var(--pl-border)] rounded-lg text-[12.5px] text-[var(--pl-text-muted)] focus-visible:border-[var(--pl-accent-border)] focus-visible:ring-0'
          >
            <span className='flex items-center gap-1.5'>
              <ArrowUpDown size={11} />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--pl-text-muted)] hover:text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)] transition-colors duration-150 border border-[var(--pl-border)] bg-transparent cursor-pointer'
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* View toggle */}
      <div
        className='flex rounded-lg overflow-hidden'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
        }}
      >
        <Button
          onClick={() => onViewModeChange('grid')}
          className='px-2 py-2 transition-all h-9 w-9'
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
        >
          <Grid2x2 className='size-4' />
        </Button>
        <Button
          onClick={() => onViewModeChange('table')}
          className='px-2 py-2 transition-all h-9 w-9'
          variant={viewMode === 'table' ? 'default' : 'ghost'}
        >
          <List className='size-4' />
        </Button>
      </div>
    </div>
  );
}
