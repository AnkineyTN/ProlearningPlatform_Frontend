import { ArrowUpDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ListPrivacyFilter = '' | 'PUBLIC' | 'PRIVATE';

type ResourceFiltersBarProps = {
  /** When false, search field is omitted (e.g. set list uses header search). */
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  privacy: ListPrivacyFilter;
  onPrivacyChange: (value: ListPrivacyFilter) => void;
  className?: string;
};

/**
 * Search (q) + privacy filter + sort button (UI only; sort API disabled until backend fix).
 */
export function ResourceFiltersBar({
  showSearch = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  privacy,
  onPrivacyChange,
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
        <SelectTrigger className='w-full sm:w-[160px]'>
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
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='shrink-0'
        title={t('list.filter.sortSoon', {
          defaultValue: 'Sort (coming soon)',
        })}
        onClick={() =>
          toast.info(
            t('list.filter.sortDisabledMessage', {
              defaultValue: 'Sorting will be available in a future update.',
            }),
          )
        }
      >
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    </div>
  );
}
