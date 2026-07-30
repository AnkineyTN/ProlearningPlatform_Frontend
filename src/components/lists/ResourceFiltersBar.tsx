import { Search, ArrowUpDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const ALL_SENTINEL = '__all__';

export type ListPrivacyFilter = '' | 'PUBLIC' | 'PRIVATE';
export type ListCreateMethodFilter = '' | 'MANUAL' | 'AI' | 'REVIEW';
export type ListSortOption = 'id,DESC' | 'id,ASC' | 'title,ASC' | 'title,DESC';

type ResourceFiltersBarProps = {
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  privacy: ListPrivacyFilter;
  onPrivacyChange: (value: ListPrivacyFilter) => void;
  createMethod?: ListCreateMethodFilter;
  onCreateMethodChange?: (value: ListCreateMethodFilter) => void;
  sort?: ListSortOption;
  onSortChange?: (value: ListSortOption) => void;
  onClear?: () => void;
  className?: string;
};

function PillSelect<T extends string>({
  value,
  onChange,
  options,
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <Select
      value={value === '' ? ALL_SENTINEL : value}
      onValueChange={(v) => onChange((v === ALL_SENTINEL ? '' : v) as T)}
    >
      <SelectTrigger
        size='sm'
        className='min-w-[120px] bg-[var(--pl-bg-elev)] border-[var(--pl-border)] rounded-lg text-[12.5px] text-[var(--pl-text-muted)] focus-visible:border-[var(--pl-accent-border)] focus-visible:ring-0'
      >
        <span className='flex items-center gap-1.5'>
          {icon}
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value === '' ? ALL_SENTINEL : o.value}
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ResourceFiltersBar({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  privacy,
  onPrivacyChange,
  createMethod,
  onCreateMethodChange,
  sort,
  onSortChange,
  onClear,
  className = '',
}: ResourceFiltersBarProps) {
  const hasActiveFilters =
    (searchValue?.length ?? 0) > 0 ||
    privacy !== '' ||
    (createMethod !== undefined && createMethod !== '') ||
    (sort !== undefined && sort !== 'id,DESC');
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

  const methodOptions: { value: ListCreateMethodFilter; label: string }[] = [
    {
      value: '',
      label: t('list.filter.methodAll', { defaultValue: 'All methods' }),
    },
    {
      value: 'MANUAL',
      label: t('list.filter.methodManual', { defaultValue: 'Manual' }),
    },
    {
      value: 'AI',
      label: t('list.filter.methodAI', { defaultValue: 'AI generated' }),
    },
    {
      value: 'REVIEW',
      label: t('list.filter.methodReview', { defaultValue: 'Review' }),
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
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap py-4 pb-[18px]',
        className,
      )}
    >
      {/* Search */}
      {showSearch && (
        <div className='flex items-center gap-2 px-3 py-[7px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-lg w-full sm:w-[240px] transition-[border-color] duration-150 focus-within:border-[var(--pl-accent-border)]'>
          <Search size={13} className='text-[var(--pl-text-faint)] shrink-0' />
          <input
            type='search'
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={
              searchPlaceholder ??
              t('list.filter.searchPlaceholder', { defaultValue: 'Search…' })
            }
            className='bg-transparent border-0 outline-none text-[12.5px] text-[var(--pl-text)] w-full font-[inherit]'
          />
        </div>
      )}

      {/* Divider */}
      <div className='hidden sm:block w-px h-5 bg-[var(--pl-border)] shrink-0 mx-0.5' />

      {/* Privacy filter */}
      <PillSelect
        value={privacy}
        onChange={onPrivacyChange}
        options={privacyOptions}
      />

      {/* Create method filter */}
      {onCreateMethodChange !== undefined && (
        <PillSelect
          value={createMethod ?? ''}
          onChange={onCreateMethodChange}
          options={methodOptions}
        />
      )}

      {/* Sort */}
      {onSortChange !== undefined && (
        <PillSelect
          value={sort ?? 'id,DESC'}
          onChange={onSortChange}
          options={sortOptions}
          icon={<ArrowUpDown size={11} />}
        />
      )}

      {/* Clear filters */}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] text-[var(--pl-text-muted)] hover:text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)] transition-colors duration-150 border border-[var(--pl-border)] bg-transparent cursor-pointer'
        >
          <X size={11} />
          Clear
        </button>
      )}
    </div>
  );
}
