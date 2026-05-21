import { Search, ArrowUpDown, Grid2x2, List } from 'lucide-react';
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

type TabId = 'all' | 'completed' | 'in_progress';
type Tab = { id: TabId; label: string; count: number };
export type ViewMode = 'grid' | 'table';

const ALL_SENTINEL = '__all__';

type Props = {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  search: string;
  onSearchChange: (v: string) => void;
  privacy: ListPrivacyFilter;
  onPrivacyChange: (v: ListPrivacyFilter) => void;
  sort: ListSortOption;
  onSortChange: (v: ListSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
};

export default function SetFilterBar({
  tabs,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  privacy,
  onPrivacyChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
}: Props) {
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
    <div className='flex items-center gap-2 mb-0'>
      {/* Tabs */}
      <div className='flex items-center gap-1 mr-2'>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className='flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all'
              style={{
                background: active ? 'var(--pl-accent)' : 'var(--pl-bg-elev)',
                color: active ? 'var(--pl-accent-fg)' : 'var(--pl-text-muted)',
                border: active ? 'none' : '1px solid var(--pl-border)',
                fontWeight: active ? 500 : 400,
              }}
            >
              {tab.label}
              <span
                className='text-[10.5px] px-[6px] py-[1px] rounded-full'
                style={{
                  fontFamily: 'var(--font-mono-pl)',
                  background: active
                    ? 'rgba(255,255,255,0.2)'
                    : 'var(--pl-bg-hover)',
                  color: active
                    ? 'var(--pl-accent-fg)'
                    : 'var(--pl-text-faint)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className='flex-1' />

      {/* Search */}
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
          className='bg-transparent outline-none flex-1 text-[12.5px]'
          style={{ color: 'var(--pl-text)' }}
        />
      </div>

      {/* Privacy filter */}
      <Select
        value={privacy === '' ? ALL_SENTINEL : privacy}
        onValueChange={(v) =>
          onPrivacyChange(
            (v === ALL_SENTINEL ? '' : v) as ListPrivacyFilter,
          )
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

      {/* View toggle */}
      <div
        className='flex rounded-lg overflow-hidden'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
        }}
      >
        <button
          onClick={() => onViewModeChange('grid')}
          className='px-2 py-2 transition-all'
          style={{
            background:
              viewMode === 'grid' ? 'var(--pl-accent-soft)' : 'transparent',
            color:
              viewMode === 'grid'
                ? 'var(--pl-accent-strong)'
                : 'var(--pl-text-faint)',
          }}
        >
          <Grid2x2 className='size-4' />
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className='px-2 py-2 transition-all'
          style={{
            background:
              viewMode === 'table' ? 'var(--pl-accent-soft)' : 'transparent',
            color:
              viewMode === 'table'
                ? 'var(--pl-accent-strong)'
                : 'var(--pl-text-faint)',
          }}
        >
          <List className='size-4' />
        </button>
      </div>
    </div>
  );
}
