import { ChevronDown, Search, ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

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
  className?: string;
};

function PillSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none py-[7px] pl-[10px] pr-8 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-lg text-[12.5px] text-[var(--pl-text-muted)] cursor-pointer outline-none font-[inherit] min-w-[120px] focus:border-[var(--pl-accent-border)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="absolute right-[9px] top-1/2 -translate-y-1/2 pointer-events-none text-[var(--pl-text-faint)] flex items-center">
        <ChevronDown size={12} />
      </span>
    </div>
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
  className = '',
}: ResourceFiltersBarProps) {
  const { t } = useTranslation();

  const privacyOptions: { value: ListPrivacyFilter; label: string }[] = [
    { value: '', label: t('list.filter.privacyAll', { defaultValue: 'All privacy' }) },
    { value: 'PUBLIC', label: t('list.filter.public', { defaultValue: 'Public' }) },
    { value: 'PRIVATE', label: t('list.filter.private', { defaultValue: 'Private' }) },
  ];

  const methodOptions: { value: ListCreateMethodFilter; label: string }[] = [
    { value: '', label: 'All methods' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'AI', label: 'AI generated' },
    { value: 'REVIEW', label: 'Review' },
  ];

  const sortOptions: { value: ListSortOption; label: string }[] = [
    { value: 'id,DESC', label: 'Newest first' },
    { value: 'id,ASC', label: 'Oldest first' },
    { value: 'title,ASC', label: 'Title A → Z' },
    { value: 'title,DESC', label: 'Title Z → A' },
  ];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap py-4 pb-[18px]", className)}>
      {/* Search */}
      {showSearch && (
        <div className="flex items-center gap-2 px-3 py-[7px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-lg w-[240px] transition-[border-color] duration-150 focus-within:border-[var(--pl-accent-border)]">
          <Search size={13} className="text-[var(--pl-text-faint)] shrink-0" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={
              searchPlaceholder ??
              t('list.filter.searchPlaceholder', { defaultValue: 'Search…' })
            }
            className="bg-transparent border-0 outline-none text-[12.5px] text-[var(--pl-text)] w-full font-[inherit]"
          />
        </div>
      )}

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--pl-border)] shrink-0 mx-0.5" />

      {/* Privacy filter */}
      <PillSelect value={privacy} onChange={onPrivacyChange} options={privacyOptions} />

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
    </div>
  );
}
