import { ArrowUpDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListSortOption } from '@/components/lists/ResourceFiltersBar';
import type { RoadmapStatus } from '@/services/types/roadmap.types';

export type RoadmapStatusFilter = '' | RoadmapStatus;

const ALL_SENTINEL = '__all__';

type Props = {
  status: RoadmapStatusFilter;
  onStatusChange: (v: RoadmapStatusFilter) => void;
  sort: ListSortOption;
  onSortChange: (v: ListSortOption) => void;
  onClearFilters?: () => void;
};

export default function RoadmapFilterBar({
  status,
  onStatusChange,
  sort,
  onSortChange,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();
  const hasActiveFilters = status !== 'ACTIVE' || sort !== 'id,DESC';

  const statusOptions: { value: RoadmapStatusFilter; label: string }[] = [
    {
      value: 'ACTIVE',
      label: t('roadmap.list.filter.statusActive'),
    },
    {
      value: 'COMPLETED',
      label: t('roadmap.list.filter.statusCompleted'),
    },
    {
      value: 'ABANDONED',
      label: t('roadmap.list.filter.statusAbandoned'),
    },
    {
      value: '',
      label: t('roadmap.list.filter.statusAll'),
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
    <div className='flex items-center gap-2 flex-wrap'>
      {/* Status filter */}
      <Select
        value={status === '' ? ALL_SENTINEL : status}
        onValueChange={(v) =>
          onStatusChange((v === ALL_SENTINEL ? '' : v) as RoadmapStatusFilter)
        }
      >
        <SelectTrigger
          size='sm'
          className='min-w-[130px] bg-[var(--pl-bg-elev)] border-[var(--pl-border)] rounded-lg text-[12.5px] text-[var(--pl-text-muted)] focus-visible:border-[var(--pl-accent-border)] focus-visible:ring-0'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((o) => (
            <SelectItem key={o.value} value={o.value === '' ? ALL_SENTINEL : o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={(v) => onSortChange(v as ListSortOption)}>
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
          {t('roadmap.list.filter.clear')}
        </button>
      )}
    </div>
  );
}
