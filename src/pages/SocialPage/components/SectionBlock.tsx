/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import NoteCard from '@/components/cards/NoteCard';
import FlashcardCard from '@/components/cards/FlashCard';
import ExamCard from '@/components/cards/ExamCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getTimeAgo, formatDate } from '@/lib/utils';
import { socialAPI } from '@/services/endpoints/social';
import type { SocialItemType } from '@/services/types/social.types';
import type { SectionType, SectionState, SortType } from '../types';

// ─── SkeletonCard ──────────────────────────────────────────────────────────────

export const SkeletonCard = () => (
  <div className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] p-[18px] flex flex-col gap-3'>
    <div className='flex justify-between'>
      <Skeleton className='w-9 h-9 rounded-[9px]' />
      <Skeleton className='w-7 h-7 rounded-[6px]' />
    </div>
    <Skeleton className='h-4 w-3/4' />
    <Skeleton className='h-3 w-full' />
    <Skeleton className='h-3 w-5/6' />
    <div className='mt-auto pt-3 border-t border-[var(--pl-border)] flex justify-between'>
      <Skeleton className='h-3 w-16' />
      <Skeleton className='h-3 w-12' />
    </div>
  </div>
);

// ─── SectionBlock ──────────────────────────────────────────────────────────────

type Props = {
  type: SectionType;
  label: string;
  icon: React.ElementType;
  state: SectionState;
  sort: SortType;
  onLoadMore: () => void;
};

const SectionBlock = ({
  type,
  label,
  icon: Icon,
  state,
  sort,
  onLoadMore,
}: Props) => {
  const { t } = useTranslation();
  const { items, loading, error, meta } = state;
  const noDesc = t('list.noDescription');

  const trackView = (id: number) => {
    socialAPI.postViewLog(type as SocialItemType, id).catch(() => {});
  };

  const sorted = useMemo(() => {
    const arr = [...items];
    if (sort === 'recent')
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (sort === 'liked')
      arr.sort((a, b) => ((b as any).likes ?? 0) - ((a as any).likes ?? 0));
    return arr;
  }, [items, sort]);

  return (
    <section>
      {/* Header */}
      <div className='flex items-center gap-2 mb-5'>
        <div
          style={{
            background:
              'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.12)',
            color:
              'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h))',
          }}
          className='w-8 h-8 rounded-[8px] grid place-items-center shrink-0'
        >
          <Icon size={15} />
        </div>
        <h2 className='text-[16px] font-semibold text-[var(--pl-text)] tracking-[-0.01em]'>
          {label}
        </h2>
        {meta && (
          <span className='ml-1 px-2 py-[2px] rounded-full bg-[var(--pl-bg-hover)] text-[11px] font-medium text-[var(--pl-text-muted)]'>
            {meta.totalItems}
          </span>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className='py-8 text-center text-[13px] text-[oklch(0.65_0.2_25)]'>
          {t('social.failedToLoad')}
        </div>
      ) : !loading && sorted.length === 0 ? (
        <div className='py-8 text-center text-[13px] text-[var(--pl-text-faint)]'>
          {t('social.noResults')}
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {sorted.map((item) => {
            const desc = item.description || noDesc;
            const timeAgo = getTimeAgo(item.createdAt);
            const createdAt = formatDate(item.createdAt);

            if (type === 'NOTE')
              return (
                <NoteCard
                  key={item.id}
                  note={{
                    id: item.id,
                    title: item.title,
                    description: desc,
                    privacy: 'PUBLIC',
                    timeAgo,
                    created_at: createdAt,
                  }}
                  onAccess={(id) => trackView(Number(id))}
                />
              );

            if (type === 'FLASHCARD')
              return (
                <FlashcardCard
                  key={item.id}
                  flashcard={{
                    id: item.id,
                    title: item.title,
                    description: desc,
                    privacy: 'PUBLIC',
                    time: timeAgo,
                    created_at: createdAt,
                  }}
                  onAccess={(id) => trackView(Number(id))}
                />
              );

            return (
              <ExamCard
                key={item.id}
                exam={{
                  id: item.id,
                  title: item.title,
                  description: desc,
                  privacy: 'PUBLIC',
                  createdAt: item.createdAt,
                  numQuestions: item.numQuestions ?? undefined,
                  duration: item.duration ?? undefined,
                }}
                onAccess={(id) => trackView(Number(id))}
              />
            );
          })}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
        </div>
      )}

      {/* Load more */}
      {meta && meta.currentPage < meta.totalPages && !error && (
        <div className='flex justify-center mt-5'>
          <Button
            variant='outline'
            size='sm'
            onClick={onLoadMore}
            disabled={loading}
            className='rounded-full gap-2 text-[12.5px] text-[var(--pl-text-muted)] hover:border-[var(--pl-accent-border)] hover:text-[var(--pl-text)]'
          >
            {t('social.loadMore')} <ChevronDown size={12} />
          </Button>
        </div>
      )}
    </section>
  );
};

export default SectionBlock;
