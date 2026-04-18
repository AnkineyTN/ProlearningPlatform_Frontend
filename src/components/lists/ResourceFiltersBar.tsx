import { ArrowUpDown } from 'lucide-react';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ListPrivacyFilter = '' | 'PUBLIC' | 'PRIVATE';
export type ListCreateMethodFilter = '' | 'MANUAL' | 'AI' | 'REVIEW';
export type ListSortOption = 'id,DESC' | 'id,ASC' | 'title,ASC' | 'title,DESC';

type ResourceFiltersBarProps = {
  /** When false, search field is omitted (e.g. set list uses header search). */
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  privacy: ListPrivacyFilter;
  onPrivacyChange: (value: ListPrivacyFilter) => void;
  /** Optional createMethod filter. Pass handler to show this filter. */
  createMethod?: ListCreateMethodFilter;
  onCreateMethodChange?: (value: ListCreateMethodFilter) => void;
  /** Sort option. Pass handler to make sort functional. */
  sort?: ListSortOption;
  onSortChange?: (value: ListSortOption) => void;
  className?: string;
};

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

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 ${className}`}
    >
      {showSearch && (
        <div className='relative w-85'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={
              searchPlaceholder ??
              t('list.filter.searchPlaceholder', { defaultValue: 'Search…' })
            }
            className='bg-card pl-9'
          />
        </div>
      )}

      <Select
        value={privacy || 'all'}
        onValueChange={(v) =>
          onPrivacyChange(v === 'all' ? '' : (v as 'PUBLIC' | 'PRIVATE'))
        }
      >
        <SelectTrigger className='w-full sm:w-[140px]'>
          <SelectValue
            placeholder={t('list.filter.privacy', { defaultValue: 'Privacy' })}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>
            {t('list.filter.privacyAll', { defaultValue: 'All' })}
          </SelectItem>
          <SelectItem value='PUBLIC'>
            {t('list.filter.public', { defaultValue: 'Public' })}
          </SelectItem>
          <SelectItem value='PRIVATE'>
            {t('list.filter.private', { defaultValue: 'Private' })}
          </SelectItem>
        </SelectContent>
      </Select>

      {onCreateMethodChange !== undefined && (
        <Select
          value={createMethod || 'all'}
          onValueChange={(v) =>
            onCreateMethodChange(v === 'all' ? '' : (v as ListCreateMethodFilter))
          }
        >
          <SelectTrigger className='w-full sm:w-[140px]'>
            <SelectValue placeholder='Method' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All methods</SelectItem>
            <SelectItem value='MANUAL'>Manual</SelectItem>
            <SelectItem value='AI'>AI</SelectItem>
            <SelectItem value='REVIEW'>Review</SelectItem>
          </SelectContent>
        </Select>
      )}

      {onSortChange !== undefined && (
        <Select
          value={sort || 'id,DESC'}
          onValueChange={(v) => onSortChange(v as ListSortOption)}
        >
          <SelectTrigger className='w-full sm:w-[150px]'>
            <ArrowUpDown className='mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            <SelectValue placeholder='Sort' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='id,DESC'>Newest first</SelectItem>
            <SelectItem value='id,ASC'>Oldest first</SelectItem>
            <SelectItem value='title,ASC'>Title A → Z</SelectItem>
            <SelectItem value='title,DESC'>Title Z → A</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
