import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Map as MapIcon,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Loader2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';

import { useRoadmaps, useDeleteRoadmap } from '@/hooks/useRoadmap';
import { useAuth } from '@/hooks/useAuth';
import type { RoadmapListItem } from '@/services/types/roadmap.types';
import type { ListSortOption } from '@/components/lists/ResourceFiltersBar';
import { getTimeAgo, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import ProGateOverlay from './ProGateOverlay';
import RoadmapFilterBar, { type RoadmapStatusFilter } from './RoadmapFilterBar';

const PAGE_SIZE = 9;

function buildPageWindows(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

const RoadmapsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] =
    useState<RoadmapStatusFilter>('ACTIVE');
  const [sortOption, setSortOption] = useState<ListSortOption>('id,DESC');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter, sortOption]);

  const { data: roadmapsRes, isLoading } = useRoadmaps({
    page: currentPage,
    size: PAGE_SIZE,
    sort: sortOption,
    status: statusFilter || undefined,
  });
  const deleteRoadmap = useDeleteRoadmap();

  const isPro = user?.accountType === 'PRO';

  const handleDelete = async (id: number) => {
    try {
      await deleteRoadmap.mutateAsync(id);
      toast.success(t('roadmap.delete.success'));
      setConfirmDelete(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, t('roadmap.delete.error')));
    }
  };

  const items = roadmapsRes?.data ?? [];
  const totalPages = roadmapsRes?.metadata?.totalPages || 1;

  return (
    <div className='relative min-h-screen bg-[var(--pl-bg)]'>
      <div className={!isPro ? 'blur-sm pointer-events-none select-none opacity-40' : ''}>
        <div className='px-10 pt-8 pb-0'>
          <div className='flex items-end justify-between mb-6'>
            <div>
              <p className='text-[11px] uppercase tracking-[0.16em] mb-2 text-[var(--pl-text-faint)]'>
                {t('roadmap.subtitle')}
              </p>
              <h1 className='text-[42px] leading-none tracking-[-0.03em] font-display text-[var(--pl-text)]'>
                {t('roadmap.title')}
              </h1>
              <p className='text-[13px] mt-3 max-w-[560px] text-[var(--pl-text-muted)]'>
                {t('roadmap.tagline')}
              </p>
            </div>
            <Button
              onClick={() => navigate('/roadmaps/new')}
              className='gap-2 px-5 py-[10px] rounded-full text-[13px] font-medium bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)] h-auto'
            >
              <Plus size={13} strokeWidth={2} />
              {t('roadmap.createNew')}
            </Button>
          </div>

          <RoadmapFilterBar
            status={statusFilter}
            onStatusChange={setStatusFilter}
            sort={sortOption}
            onSortChange={setSortOption}
            onClearFilters={() => {
              setStatusFilter('ACTIVE');
              setSortOption('id,DESC');
            }}
          />

          <div className='mt-4 border-b border-[var(--pl-border)]' />
        </div>

        <div className='px-10 pt-7 pb-16'>
          {isLoading ? (
            <div className='flex items-center justify-center py-20 text-[var(--pl-text-faint)]'>
              <Loader2 size={20} className='animate-spin mr-2' />
              {t('roadmap.list.loading')}
            </div>
          ) : items.length === 0 ? (
            <EmptyState onCreate={() => navigate('/roadmaps/new')} />
          ) : (
            <>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-8'>
                {items.map((r) => (
                  <RoadmapCard
                    key={r.id}
                    roadmap={r}
                    onOpen={() => navigate(`/roadmaps/${r.id}`)}
                    onAskDelete={() => setConfirmDelete(r.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-1'>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className={cn(
                      'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
                      currentPage === 0
                        ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
                        : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
                    )}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {buildPageWindows(currentPage, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span
                        key={`ellipsis-${i}`}
                        className='w-8 h-8 grid place-items-center text-[12px] text-[var(--pl-text-faint)]'
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={cn(
                          'w-8 h-8 rounded-lg grid place-items-center text-[12.5px] tabular-nums border transition-[background,color] duration-150 cursor-pointer',
                          p === currentPage
                            ? 'bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] font-medium'
                            : 'bg-[var(--pl-bg-elev)] border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]',
                        )}
                      >
                        {p + 1}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className={cn(
                      'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
                      currentPage >= totalPages - 1
                        ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
                        : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
                    )}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {confirmDelete !== null && (
          <ConfirmDeleteModal
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete)}
            pending={deleteRoadmap.isPending}
          />
        )}
      </div>

      {!isPro && <ProGateOverlay />}
    </div>
  );
};

const RoadmapCard = ({
  roadmap,
  onOpen,
  onAskDelete,
}: {
  roadmap: RoadmapListItem;
  onOpen: () => void;
  onAskDelete: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDone = roadmap.status === 'COMPLETED';
  const isAbandoned = roadmap.status === 'ABANDONED';
  return (
    <div
      className='group relative rounded-[14px] overflow-hidden cursor-pointer transition-all bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'
      onClick={onOpen}
    >
      <div className='p-5'>
        <div className='flex items-start justify-between gap-3 mb-3'>
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'w-9 h-9 rounded-[9px] grid place-items-center',
                isAbandoned
                  ? 'bg-[var(--pl-danger-soft)] text-[var(--pl-danger-text)]'
                  : 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]',
              )}
            >
              {isAbandoned ? (
                <XCircle size={16} />
              ) : isDone ? (
                <CheckCircle2 size={16} />
              ) : (
                <MapIcon size={16} />
              )}
            </div>
            {roadmap.estimatedTotalHours > 0 && (
              <span className='flex items-center gap-1 text-[10.5px] uppercase tracking-[0.12em] px-2 py-[3px] rounded-full bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)] font-mono-pl'>
                <Clock size={10} />
                {t('roadmap.hours', { count: roadmap.estimatedTotalHours })}
              </span>
            )}
          </div>
          {!isAbandoned && (
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation();
                onAskDelete();
              }}
              className='opacity-0 group-hover:opacity-100 transition-opacity h-auto w-auto p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
              title={t('roadmap.card.deleteTitle')}
            >
              <Trash2 size={13} className='text-[var(--pl-text-faint)]' />
            </Button>
          )}
        </div>

        <h3 className='text-[16px] font-medium mb-1 line-clamp-2 text-[var(--pl-text)]'>
          {roadmap.title}
        </h3>
        <p className='text-[12.5px] mb-4 line-clamp-2 text-[var(--pl-text-muted)]'>
          {roadmap.overview}
        </p>

        <div className='flex items-center gap-3 text-[11.5px] mb-4'>
          <span className='flex items-center gap-1 text-[var(--pl-text-muted)]'>
            <Layers size={11} />
            {t('roadmap.card.chaptersTopics', {
              chapters: roadmap.totalChapters,
              topics: roadmap.totalTopics,
            })}
          </span>
        </div>

        <div className='flex items-center justify-between mb-1'>
          <span className='text-[10.5px] uppercase tracking-[0.14em] text-[var(--pl-text-faint)]'>
            {t('roadmap.card.progress')}
          </span>
          <span
            className={`text-[11.5px] font-mono-pl ${
              isDone
                ? 'text-[oklch(0.7_0.18_150)]'
                : 'text-[var(--pl-accent-strong)]'
            }`}
          >
            {roadmap.progressPercent}%
          </span>
        </div>
        <div className='h-1.5 w-full rounded-full overflow-hidden bg-[var(--pl-bg-hover)]'>
          <div
            className={`h-full rounded-full transition-all ${
              isDone ? 'bg-[oklch(0.7_0.18_150)]' : 'bg-[var(--pl-accent)]'
            }`}
            style={{ width: `${roadmap.progressPercent}%` }}
          />
        </div>

        <div className='mt-4 pt-3 flex items-center justify-between text-[10.5px] border-t border-[var(--pl-border)] text-[var(--pl-text-faint)]'>
          <span>
            {t('roadmap.card.created', { time: getTimeAgo(roadmap.createdAt) })}
          </span>
          <div className='flex items-center gap-3'>
            {roadmap.setId && (
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sets/${roadmap.setId}/notes`);
                }}
                className='flex items-center gap-1 hover:text-[var(--pl-accent-strong)] transition-colors'
                title={t('roadmap.card.goToSet')}
              >
                <ExternalLink size={10} />
                {t('roadmap.card.goToSet')}
              </button>
            )}
            <span>
              {t('roadmap.card.done', {
                completed: roadmap.completedTopics,
                total: roadmap.totalTopics,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div className='w-20 h-20 rounded-[20px] grid place-items-center mb-5 bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
        <Sparkles size={36} />
      </div>
      <h3 className='text-[20px] font-medium mb-2 text-[var(--pl-text)]'>
        {t('roadmap.list.emptyTitle')}
      </h3>
      <p className='text-[13px] mb-6 max-w-[440px] text-[var(--pl-text-muted)]'>
        {t('roadmap.list.emptyHint')}
      </p>
      <Button
        onClick={onCreate}
        className='gap-2 px-6 py-3 rounded-full text-[13px] font-medium bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)] h-auto'
      >
        <Sparkles size={14} />
        {t('roadmap.list.emptyCta')}
      </Button>
    </div>
  );
};

const ConfirmDeleteModal = ({
  onCancel,
  onConfirm,
  pending,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  pending: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center p-4 bg-black/50'
      onClick={onCancel}
    >
      <div
        className='rounded-[14px] p-6 max-w-[400px] w-full bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className='text-[16px] font-medium mb-2 text-[var(--pl-text)]'>
          {t('roadmap.card.deleteTitle')}
        </h3>
        <p className='text-[13px] mb-5 text-[var(--pl-text-muted)]'>
          {t('roadmap.delete.description')}
        </p>
        <div className='flex justify-end gap-2'>
          <Button
            onClick={onCancel}
            className='px-4 py-2 rounded-full text-[12.5px] bg-[var(--pl-bg-hover)] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]/80 h-auto'
          >
            {t('roadmap.delete.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={pending}
            className='px-4 py-2 rounded-full text-[12.5px] bg-[oklch(0.65_0.2_25)] text-white hover:bg-[oklch(0.6_0.2_25)] h-auto'
          >
            {pending
              ? t('roadmap.delete.pending')
              : t('roadmap.delete.confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapsListPage;
