import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Map as MapIcon,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Loader2,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useRoadmaps, useDeleteRoadmap } from '@/hooks/useRoadmap';
import type { Roadmap } from '@/services/types/roadmap.types';
import { getTimeAgo } from '@/lib/utils';

const RoadmapsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: roadmaps, isLoading } = useRoadmaps();
  const deleteRoadmap = useDeleteRoadmap();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await deleteRoadmap.mutateAsync(id);
      toast.success(t('roadmap.delete.success'));
      setConfirmDelete(null);
    } catch {
      toast.error(t('roadmap.delete.error'));
    }
  };

  const items = roadmaps ?? [];

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      <div className='px-10 pt-8 pb-0'>
        <div className='flex items-end justify-between mb-6'>
          <div>
            <p
              className='text-[11px] uppercase tracking-[0.16em] mb-2'
              style={{ color: 'var(--pl-text-faint)' }}
            >
              {t('roadmap.subtitle')}
            </p>
            <h1
              className='text-[42px] font-[400] leading-none'
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--pl-text)',
              }}
            >
              {t('roadmap.title')}
            </h1>
            <p
              className='text-[13px] mt-3 max-w-[560px]'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {t('roadmap.tagline')}
            </p>
          </div>
          <button
            onClick={() => navigate('/roadmaps/new')}
            className='flex items-center gap-2 px-5 py-[10px] rounded-full text-[13px] font-[500] transition-opacity'
            style={{
              background: 'var(--pl-accent)',
              color: 'var(--pl-accent-fg)',
            }}
          >
            <Plus size={13} strokeWidth={2} />
            {t('roadmap.createNew')}
          </button>
        </div>

        <div
          className='mt-4'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
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
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]'>
            {items.map((r) => (
              <RoadmapCard
                key={r.id}
                roadmap={r}
                onOpen={() => navigate(`/roadmaps/${r.id}`)}
                onAskDelete={() => setConfirmDelete(r.id)}
              />
            ))}
          </div>
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
  );
};

const RoadmapCard = ({
  roadmap,
  onOpen,
  onAskDelete,
}: {
  roadmap: Roadmap;
  onOpen: () => void;
  onAskDelete: () => void;
}) => {
  const { t } = useTranslation();
  const isDone = roadmap.status === 'COMPLETED';
  const totalChapters = roadmap.chapters?.length ?? 0;
  return (
    <div
      className='group relative rounded-[14px] overflow-hidden cursor-pointer transition-all'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
      }}
      onClick={onOpen}
    >
      <div className='p-5'>
        <div className='flex items-start justify-between gap-3 mb-3'>
          <div className='flex items-center gap-2'>
            <div
              className='w-9 h-9 rounded-[9px] grid place-items-center'
              style={{
                background: 'var(--pl-accent-soft)',
                color: 'var(--pl-accent-strong)',
              }}
            >
              {isDone ? <CheckCircle2 size={16} /> : <MapIcon size={16} />}
            </div>
            {roadmap.estimatedTotalHours > 0 && (
              <span
                className='flex items-center gap-1 text-[10.5px] uppercase tracking-[0.12em] px-2 py-[3px] rounded-full'
                style={{
                  background: 'var(--pl-bg-hover)',
                  color: 'var(--pl-text-faint)',
                  fontFamily: 'var(--font-mono-pl)',
                }}
              >
                <Clock size={10} />
                {t('roadmap.hours', { count: roadmap.estimatedTotalHours })}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAskDelete();
            }}
            className='opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
            title={t('roadmap.card.deleteTitle')}
          >
            <Trash2 size={13} style={{ color: 'var(--pl-text-faint)' }} />
          </button>
        </div>

        <h3
          className='text-[16px] font-[500] mb-1 line-clamp-2'
          style={{ color: 'var(--pl-text)' }}
        >
          {roadmap.title}
        </h3>
        <p
          className='text-[12.5px] mb-4 line-clamp-2'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          {roadmap.overview}
        </p>

        <div className='flex items-center gap-3 text-[11.5px] mb-4'>
          <span
            className='flex items-center gap-1'
            style={{ color: 'var(--pl-text-muted)' }}
          >
            <Layers size={11} />
            {t('roadmap.card.chaptersTopics', {
              chapters: totalChapters,
              topics: roadmap.totalTopics,
            })}
          </span>
        </div>

        <div className='flex items-center justify-between mb-1'>
          <span
            className='text-[10.5px] uppercase tracking-[0.14em]'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            {t('roadmap.card.progress')}
          </span>
          <span
            className='text-[11.5px] font-medium'
            style={{
              fontFamily: 'var(--font-mono-pl)',
              color: isDone ? 'oklch(0.7 0.18 150)' : 'var(--pl-accent-strong)',
            }}
          >
            {roadmap.progressPercent}%
          </span>
        </div>
        <div
          className='h-1.5 w-full rounded-full overflow-hidden'
          style={{ background: 'var(--pl-bg-hover)' }}
        >
          <div
            className='h-full rounded-full transition-all'
            style={{
              width: `${roadmap.progressPercent}%`,
              background: isDone ? 'oklch(0.7 0.18 150)' : 'var(--pl-accent)',
            }}
          />
        </div>

        <div
          className='mt-4 pt-3 flex items-center justify-between text-[10.5px]'
          style={{
            borderTop: '1px solid var(--pl-border)',
            color: 'var(--pl-text-faint)',
          }}
        >
          <span>
            {t('roadmap.card.created', { time: getTimeAgo(roadmap.createdAt) })}
          </span>
          <span>
            {t('roadmap.card.done', {
              completed: roadmap.completedTopics,
              total: roadmap.totalTopics,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onCreate }: { onCreate: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col items-center justify-center py-24 text-center'>
      <div
        className='w-20 h-20 rounded-[20px] grid place-items-center mb-5'
        style={{
          background: 'var(--pl-accent-soft)',
          color: 'var(--pl-accent-strong)',
        }}
      >
        <Sparkles size={36} />
      </div>
      <h3
        className='text-[20px] font-[500] mb-2'
        style={{ color: 'var(--pl-text)' }}
      >
        {t('roadmap.list.emptyTitle')}
      </h3>
      <p
        className='text-[13px] mb-6 max-w-[440px]'
        style={{ color: 'var(--pl-text-muted)' }}
      >
        {t('roadmap.list.emptyHint')}
      </p>
      <button
        onClick={onCreate}
        className='flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[500]'
        style={{
          background: 'var(--pl-accent)',
          color: 'var(--pl-accent-fg)',
        }}
      >
        <Sparkles size={14} />
        {t('roadmap.list.emptyCta')}
      </button>
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
      className='fixed inset-0 z-50 grid place-items-center p-4'
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className='rounded-[14px] p-6 max-w-[400px] w-full'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className='text-[16px] font-[500] mb-2'
          style={{ color: 'var(--pl-text)' }}
        >
          {t('roadmap.card.deleteTitle')}
        </h3>
        <p
          className='text-[13px] mb-5'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          {t('roadmap.delete.description')}
        </p>
        <div className='flex justify-end gap-2'>
          <button
            onClick={onCancel}
            className='px-4 py-2 rounded-full text-[12.5px]'
            style={{
              background: 'var(--pl-bg-hover)',
              color: 'var(--pl-text)',
            }}
          >
            {t('roadmap.delete.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className='px-4 py-2 rounded-full text-[12.5px] disabled:opacity-50'
            style={{
              background: 'oklch(0.65 0.2 25)',
              color: 'white',
            }}
          >
            {pending
              ? t('roadmap.delete.pending')
              : t('roadmap.delete.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapsListPage;
