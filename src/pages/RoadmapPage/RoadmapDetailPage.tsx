import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  PlayCircle,
  Loader2,
  RefreshCw,
  Trophy,
  BookOpen,
  Sparkles,
  Circle,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { toast } from 'react-toastify';

import {
  useCompleteTopic,
  useRoadmap,
  useStartTopic,
} from '@/hooks/useRoadmap';
import type {
  RoadmapChapter,
  RoadmapTopic,
} from '@/services/types/roadmap.types';

const RoadmapDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const roadmapId = Number(id);
  const navigate = useNavigate();

  const { data: roadmap, isLoading, refetch } = useRoadmap(roadmapId);

  if (isLoading || !roadmap) {
    return (
      <div
        className='min-h-screen grid place-items-center'
        style={{ background: 'var(--pl-bg)' }}
      >
        <Loader2
          size={22}
          className='animate-spin text-[var(--pl-text-faint)]'
        />
      </div>
    );
  }

  const isCompleted = roadmap.status === 'COMPLETED';

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      <div className='px-10 pt-8 pb-0'>
        <button
          onClick={() => navigate('/roadmaps')}
          className='flex items-center gap-2 text-[12.5px] mb-4'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          <ArrowLeft size={13} /> {t('roadmap.backToList')}
        </button>

        {isCompleted && <CompletedBanner />}

        <div className='flex items-end justify-between mb-6 gap-6'>
          <div className='flex-1 min-w-0'>
            <div
              className='flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.16em]'
              style={{ color: 'var(--pl-text-faint)' }}
            >
              <span>{roadmap.status}</span>
              {roadmap.estimatedTotalHours > 0 && (
                <>
                  <span>·</span>
                  <span className='flex items-center gap-1'>
                    <Clock size={11} />
                    {t('roadmap.detail.estimatedHours', {
                      count: roadmap.estimatedTotalHours,
                    })}
                  </span>
                </>
              )}
            </div>
            <h1
              className='text-[38px] font-[400] leading-tight mb-3'
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--pl-text)',
              }}
            >
              {roadmap.title}
            </h1>
            <p
              className='text-[13.5px] max-w-[640px]'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {roadmap.overview}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className='flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] shrink-0'
            style={{
              background: 'var(--pl-bg-elev)',
              color: 'var(--pl-text-muted)',
              border: '1px solid var(--pl-border)',
            }}
          >
            <RefreshCw size={12} /> {t('roadmap.refresh')}
          </button>
        </div>

        <ProgressBar
          completed={roadmap.completedTopics}
          total={roadmap.totalTopics}
          percent={roadmap.progressPercent}
          completedFlag={isCompleted}
        />

        <div
          className='mt-7'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
      </div>

      <div className='px-10 pt-7 pb-16 flex flex-col gap-3'>
        {roadmap.chapters
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((chapter, idx) => (
            <ChapterBlock
              key={chapter.id}
              chapter={chapter}
              roadmapId={roadmap.id}
              index={idx}
            />
          ))}
      </div>
    </div>
  );
};

const ProgressBar = ({
  completed,
  total,
  percent,
  completedFlag,
}: {
  completed: number;
  total: number;
  percent: number;
  completedFlag: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className='rounded-[12px] p-4 flex items-center gap-4'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
      }}
    >
      <div className='flex-1'>
        <div className='flex items-center justify-between mb-2'>
          <span
            className='text-[11px] uppercase tracking-[0.14em]'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            {t('roadmap.detail.progressLabel')}
          </span>
          <span
            className='text-[12.5px] font-[500]'
            style={{
              fontFamily: 'var(--font-mono-pl)',
              color: completedFlag
                ? 'oklch(0.7 0.18 150)'
                : 'var(--pl-accent-strong)',
            }}
          >
            {completed}/{total} · {percent}%
          </span>
        </div>
        <div
          className='h-2 w-full rounded-full overflow-hidden'
          style={{ background: 'var(--pl-bg-hover)' }}
        >
          <div
            className='h-full rounded-full transition-all'
            style={{
              width: `${percent}%`,
              background: completedFlag
                ? 'linear-gradient(90deg, oklch(0.7 0.18 150), oklch(0.75 0.16 130))'
                : 'var(--pl-accent)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CompletedBanner = () => {
  const { t } = useTranslation();
  return (
    <div
      className='rounded-[14px] p-5 mb-5 flex items-center gap-4'
      style={{
        background:
          'linear-gradient(135deg, oklch(0.7 0.18 150 / 0.15), var(--pl-accent-soft))',
        border: '1px solid var(--pl-border)',
      }}
    >
      <div
        className='w-12 h-12 rounded-[12px] grid place-items-center shrink-0'
        style={{ background: 'oklch(0.7 0.18 150)', color: 'white' }}
      >
        <Trophy size={22} />
      </div>
      <div>
        <h3
          className='text-[16px] font-[500]'
          style={{ color: 'var(--pl-text)' }}
        >
          {t('roadmap.detail.completedBannerTitle')}
        </h3>
        <p
          className='text-[12.5px] mt-0.5'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          {t('roadmap.detail.completedBannerSubtitle')}
        </p>
      </div>
    </div>
  );
};

const ChapterBlock = ({
  chapter,
  roadmapId,
  index,
}: {
  chapter: RoadmapChapter;
  roadmapId: number;
  index: number;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(
    chapter.status === 'IN_PROGRESS' || chapter.status === 'COMPLETED',
  );

  const locked = chapter.status === 'LOCKED';
  const done = chapter.status === 'COMPLETED';

  const accent = useMemo(() => {
    if (done) return 'oklch(0.7 0.18 150)';
    if (locked) return 'var(--pl-text-faint)';
    return 'var(--pl-accent-strong)';
  }, [done, locked]);

  return (
    <div
      className='rounded-[12px] overflow-hidden'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
        opacity: locked ? 0.72 : 1,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className='w-full flex items-center gap-4 p-4 text-left bg-transparent'
      >
        <div
          className='w-10 h-10 rounded-[10px] grid place-items-center shrink-0'
          style={{
            background: done
              ? 'oklch(0.7 0.18 150 / 0.2)'
              : locked
                ? 'var(--pl-bg-hover)'
                : 'var(--pl-accent-soft)',
            color: accent,
          }}
        >
          {locked ? (
            <Lock size={16} />
          ) : done ? (
            <CheckCircle2 size={16} />
          ) : (
            <BookOpen size={16} />
          )}
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <span
              className='text-[10.5px] uppercase tracking-[0.14em] px-2 py-[2px] rounded-full'
              style={{
                background: 'var(--pl-bg)',
                color: 'var(--pl-text-faint)',
                fontFamily: 'var(--font-mono-pl)',
              }}
            >
              {t('roadmap.detail.chapter', { n: index + 1 })}
            </span>
            <span
              className='text-[10.5px]'
              style={{ color: 'var(--pl-text-faint)' }}
            >
              {t('roadmap.detail.topicsCount', {
                completed: chapter.completedTopics,
                total: chapter.totalTopics,
              })}
            </span>
            {chapter.progressPercent > 0 && !done && (
              <span
                className='text-[10.5px]'
                style={{
                  fontFamily: 'var(--font-mono-pl)',
                  color: 'var(--pl-accent-strong)',
                }}
              >
                {chapter.progressPercent}%
              </span>
            )}
          </div>
          <h3
            className='text-[15.5px] font-[500] truncate'
            style={{ color: 'var(--pl-text)' }}
          >
            {chapter.title}
          </h3>
          {chapter.objective && (
            <p
              className='text-[12.5px] mt-0.5 line-clamp-1'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {chapter.objective}
            </p>
          )}
        </div>
        <ChevronDown
          size={14}
          className='shrink-0 transition-transform'
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--pl-text-faint)',
          }}
        />
      </button>

      {open && !locked && (
        <div
          className='px-4 pb-4 flex flex-col gap-2'
          style={{ borderTop: '1px solid var(--pl-border)' }}
        >
          {chapter.topics
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                roadmapId={roadmapId}
                disabled={locked}
              />
            ))}
        </div>
      )}

      {open && locked && (
        <div
          className='px-4 py-4 text-[12.5px] flex items-center gap-2'
          style={{
            borderTop: '1px solid var(--pl-border)',
            color: 'var(--pl-text-faint)',
          }}
        >
          <Lock size={12} />
          {t('roadmap.detail.lockedHint')}
        </div>
      )}
    </div>
  );
};

const TopicRow = ({
  topic,
  roadmapId,
  disabled,
}: {
  topic: RoadmapTopic;
  roadmapId: number;
  disabled: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startMutation = useStartTopic(roadmapId);
  const completeMutation = useCompleteTopic(roadmapId);

  const handleStart = async () => {
    try {
      const result = await startMutation.mutateAsync(topic.id);
      if (result.setId) {
        toast.success(t('roadmap.detail.toast.starting'));
        navigate(`/sets/${result.setId}/notes`);
      }
    } catch {
      toast.error(t('roadmap.detail.toast.startError'));
    }
  };

  const handleGoToSet = () => {
    if (topic.setId) navigate(`/sets/${topic.setId}/notes`);
  };

  const handleComplete = async () => {
    if (topic.completed) return;
    try {
      const result = await completeMutation.mutateAsync(topic.id);
      const roadmapCompleted =
        result.chapterCompleted && result.nextUnlockedChapterId === null;
      if (result.chapterCompleted) {
        if (roadmapCompleted) {
          toast.success(t('roadmap.detail.toast.roadmapDone'));
        } else {
          toast.success(t('roadmap.detail.toast.chapterDone'));
        }
      } else {
        toast.success(t('roadmap.detail.toast.markedDone'));
      }
    } catch {
      toast.error(t('roadmap.detail.toast.toggleError'));
    }
  };

  const checkboxDisabled =
    disabled ||
    topic.completed ||
    completeMutation.isPending ||
    topic.contentStatus === 'IDLE';

  return (
    <div
      className='flex items-center gap-3 px-3 py-2.5 rounded-[8px]'
      style={{
        background: 'var(--pl-bg)',
        border: '1px solid var(--pl-border)',
      }}
    >
      <button
        onClick={handleComplete}
        disabled={checkboxDisabled}
        className='shrink-0 transition-colors disabled:opacity-40'
        title={
          topic.completed
            ? t('roadmap.detail.actions.toggleCompleted')
            : t('roadmap.detail.actions.toggleNotCompleted')
        }
      >
        {topic.completed ? (
          <CheckCircle2 size={18} style={{ color: 'oklch(0.7 0.18 150)' }} />
        ) : (
          <Circle size={18} style={{ color: 'var(--pl-text-faint)' }} />
        )}
      </button>

      <div className='flex-1 min-w-0'>
        <p
          className='text-[13px] font-[500] truncate'
          style={{
            color: 'var(--pl-text)',
            textDecoration: topic.completed ? 'line-through' : 'none',
            opacity: topic.completed ? 0.7 : 1,
          }}
        >
          {topic.title}
        </p>
        <div
          className='flex items-center gap-3 mt-0.5 text-[11px]'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          {topic.description && (
            <span className='truncate'>{topic.description}</span>
          )}
          <ContentStatusChip status={topic.contentStatus} />
        </div>
      </div>

      <TopicAction
        topic={topic}
        disabled={disabled}
        starting={startMutation.isPending}
        onStart={handleStart}
        onGoToSet={handleGoToSet}
      />
    </div>
  );
};

const ContentStatusChip = ({
  status,
}: {
  status: RoadmapTopic['contentStatus'];
}) => {
  const { t } = useTranslation();
  if (status === 'GENERATING')
    return (
      <span
        className='flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] shrink-0'
        style={{
          background: 'var(--pl-accent-soft)',
          color: 'var(--pl-accent-strong)',
        }}
      >
        <Loader2 size={9} className='animate-spin' />{' '}
        {t('roadmap.detail.status.generating')}
      </span>
    );
  if (status === 'FAILED')
    return (
      <span
        className='flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] shrink-0'
        style={{
          background: 'oklch(0.65 0.2 25 / 0.15)',
          color: 'oklch(0.65 0.2 25)',
        }}
      >
        <AlertTriangle size={9} /> {t('roadmap.detail.status.failed')}
      </span>
    );
  if (status === 'READY')
    return (
      <span
        className='px-2 py-[1px] rounded-full text-[10px] shrink-0'
        style={{
          background: 'oklch(0.7 0.18 150 / 0.15)',
          color: 'oklch(0.7 0.18 150)',
        }}
      >
        {t('roadmap.detail.status.ready')}
      </span>
    );
  return null;
};

const TopicAction = ({
  topic,
  disabled,
  starting,
  onStart,
  onGoToSet,
}: {
  topic: RoadmapTopic;
  disabled: boolean;
  starting: boolean;
  onStart: () => void;
  onGoToSet: () => void;
}) => {
  const { t } = useTranslation();
  if (topic.contentStatus === 'IDLE') {
    return (
      <button
        onClick={onStart}
        disabled={disabled || starting}
        className='shrink-0 flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] font-[500] disabled:opacity-60'
        style={{
          background: 'var(--pl-accent)',
          color: 'var(--pl-accent-fg)',
        }}
      >
        {starting ? (
          <Loader2 size={11} className='animate-spin' />
        ) : (
          <Sparkles size={11} />
        )}
        {t('roadmap.detail.actions.start')}
      </button>
    );
  }
  if (topic.contentStatus === 'GENERATING') {
    return (
      <button
        disabled
        className='shrink-0 flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] opacity-70'
        style={{
          background: 'var(--pl-bg-hover)',
          color: 'var(--pl-text-muted)',
        }}
      >
        <Loader2 size={11} className='animate-spin' />{' '}
        {t('roadmap.detail.actions.generating')}
      </button>
    );
  }
  if (topic.contentStatus === 'FAILED') {
    return (
      <button
        onClick={onStart}
        disabled={disabled || starting}
        className='shrink-0 flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px]'
        style={{
          background: 'oklch(0.65 0.2 25 / 0.15)',
          color: 'oklch(0.65 0.2 25)',
        }}
      >
        <RefreshCw size={11} /> {t('roadmap.detail.actions.retry')}
      </button>
    );
  }
  return (
    <button
      onClick={onGoToSet}
      disabled={!topic.setId}
      className='shrink-0 flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] font-[500]'
      style={{
        background: 'var(--pl-accent-soft)',
        color: 'var(--pl-accent-strong)',
      }}
    >
      <PlayCircle size={11} /> {t('roadmap.detail.actions.study')}
      <ExternalLink size={9} />
    </button>
  );
};

export default RoadmapDetailPage;
