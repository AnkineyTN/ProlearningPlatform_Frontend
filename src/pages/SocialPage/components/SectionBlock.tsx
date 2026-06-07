/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { socialAPI } from '@/services/endpoints/social';
import type { SocialItemType, SocialNote } from '@/services/types/social.types';
import { PAGE_SIZE } from '../sectionConfig';
import type { SectionType, SectionState, SortType } from '../types';
import SocialResourceCard from './SocialResourceCard';

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
  onSeeAll?: () => void;
  infiniteScroll?: boolean;
};

const SectionBlock = ({
  type,
  label,
  icon: Icon,
  state,
  sort,
  onLoadMore,
  onSeeAll,
  infiniteScroll = false,
}: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, loading, error, meta } = state;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const canLoadMore = !!meta && meta.currentPage < meta.totalPages && !error;

  useEffect(() => {
    if (!infiniteScroll || !canLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) onLoadMore();
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [infiniteScroll, canLoadMore, loading, onLoadMore]);

  const trackView = (id: number) => {
    socialAPI.postViewLog(type as SocialItemType, id).catch(() => {});
  };

  const openItem = (item: SocialNote) => {
    trackView(item.id);
    if (type === 'NOTE') navigate(`/sets/${item.setId}/notes/${item.id}`);
    else if (type === 'FLASHCARD')
      navigate(`/sets/${item.setId}/flashcards/${item.id}`);
    else navigate(`/sets/${item.setId}/exams/${item.id}`);
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
    return infiniteScroll ? arr : arr.slice(0, PAGE_SIZE);
  }, [items, sort, infiniteScroll]);

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
        {onSeeAll && (
          <Button
            variant='ghost'
            size='sm'
            onClick={onSeeAll}
            className='ml-auto gap-1 px-2.5 py-1 h-auto rounded-full text-[12.5px] text-[var(--pl-text-muted)] hover:text-[var(--pl-accent)] hover:bg-[var(--pl-bg-hover)]'
          >
            {t('social.seeAll')} <ChevronRight size={13} />
          </Button>
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
          {sorted.map((item) => (
            <SocialResourceCard
              key={item.id}
              item={{
                id: item.id,
                type: item.type,
                title: item.title,
                description: item.description,
                createdAt: item.createdAt,
                ownerName: item.ownerName,
                numQuestions: item.numQuestions,
                duration: item.duration,
              }}
              onAccess={() => openItem(item)}
            />
          ))}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {infiniteScroll && canLoadMore && (
        <div ref={sentinelRef} className='h-1' />
      )}

      {/* End of list */}
      {infiniteScroll && !canLoadMore && !loading && !error && sorted.length > 0 && (
        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-faint)]'>
          {t('social.endOfList')}
        </p>
      )}
    </section>
  );
};

export default SectionBlock;
