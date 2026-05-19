import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  PlayCircle,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useCompleteTopic, useStartTopic } from '@/hooks/useRoadmap';
import type { RoadmapTopic } from '@/services/types/roadmap.types';

import {
  SLOW_GENERATING_THRESHOLD_SEC,
  useTopicElapsed,
} from './useGeneratingElapsed';

export const TopicRow = ({
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
  const elapsedSec = useTopicElapsed(topic.id);
  const isSlow =
    topic.contentStatus === 'GENERATING' &&
    elapsedSec >= SLOW_GENERATING_THRESHOLD_SEC;

  const handleStart = async () => {
    try {
      const result = await startMutation.mutateAsync(topic.id);
      if (result.setId) {
        toast.success(t('roadmap.detail.toast.starting'));
      }
    } catch {
      toast.error(t('roadmap.detail.toast.startError'));
    }
  };

  const handleGoToSet = () => {
    if (topic.setId) navigate(`/sets/${topic.setId}/notes`);
  };

  const handlePeekGenerating = () => {
    if (!topic.setId) return;
    toast.info(t('roadmap.detail.toast.peekGenerating'));
    navigate(`/sets/${topic.setId}/notes`);
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
    <div className='flex items-center gap-3 px-3 py-2.5 rounded-[8px] bg-[var(--pl-bg)] border border-[var(--pl-border)]'>
      <Button
        variant='ghost'
        size='icon'
        onClick={handleComplete}
        disabled={checkboxDisabled}
        className='shrink-0 transition-colors h-auto w-auto p-0 bg-transparent hover:bg-transparent disabled:opacity-40'
        title={
          topic.completed
            ? t('roadmap.detail.actions.toggleCompleted')
            : t('roadmap.detail.actions.toggleNotCompleted')
        }
      >
        {topic.completed ? (
          <CheckCircle2 size={18} className='text-[oklch(0.7_0.18_150)]' />
        ) : (
          <Circle size={18} className='text-[var(--pl-text-faint)]' />
        )}
      </Button>

      <div className='flex-1 min-w-0'>
        <p
          className={`text-[13px] font-medium truncate text-[var(--pl-text)] ${
            topic.completed ? 'line-through opacity-70' : ''
          }`}
        >
          {topic.title}
        </p>
        <div className='flex items-center gap-3 mt-0.5 text-[11px] text-[var(--pl-text-faint)]'>
          {topic.description && (
            <span className='truncate'>{topic.description}</span>
          )}
          <ContentStatusChip status={topic.contentStatus} slow={isSlow} />
        </div>
      </div>

      <TopicAction
        topic={topic}
        disabled={disabled}
        starting={startMutation.isPending}
        onStart={handleStart}
        onGoToSet={handleGoToSet}
        onPeekGenerating={handlePeekGenerating}
      />
    </div>
  );
};

const ContentStatusChip = ({
  status,
  slow,
}: {
  status: RoadmapTopic['contentStatus'];
  slow: boolean;
}) => {
  const { t } = useTranslation();
  if (status === 'GENERATING') {
    if (slow) {
      return (
        <span className='flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] shrink-0 bg-[oklch(0.78_0.16_70/0.15)] text-[oklch(0.6_0.16_60)]'>
          <AlertTriangle size={9} /> {t('roadmap.detail.status.slowGenerating')}
        </span>
      );
    }
    return (
      <span className='flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] shrink-0 bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
        <Loader2 size={9} className='animate-spin' />{' '}
        {t('roadmap.detail.status.generating')}
      </span>
    );
  }
  if (status === 'FAILED')
    return (
      <span className='flex items-center gap-1 px-2 py-[1px] rounded-full text-[10px] shrink-0 bg-[oklch(0.65_0.2_25/0.15)] text-[oklch(0.65_0.2_25)]'>
        <AlertTriangle size={9} /> {t('roadmap.detail.status.failed')}
      </span>
    );
  if (status === 'READY')
    return (
      <span className='px-2 py-[1px] rounded-full text-[10px] shrink-0 bg-[oklch(0.7_0.18_150/0.15)] text-[oklch(0.7_0.18_150)]'>
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
  onPeekGenerating,
}: {
  topic: RoadmapTopic;
  disabled: boolean;
  starting: boolean;
  onStart: () => void;
  onGoToSet: () => void;
  onPeekGenerating: () => void;
}) => {
  const { t } = useTranslation();
  if (topic.contentStatus === 'IDLE') {
    return (
      <Button
        onClick={onStart}
        disabled={disabled || starting}
        className='shrink-0 gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] font-medium h-auto bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)]'
      >
        {starting ? (
          <Loader2 size={11} className='animate-spin' />
        ) : (
          <Sparkles size={11} />
        )}
        {t('roadmap.detail.actions.start')}
      </Button>
    );
  }
  if (topic.contentStatus === 'GENERATING') {
    return (
      <div className='shrink-0 flex items-center gap-1'>
        <span className='flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]'>
          <Loader2 size={11} className='animate-spin' />
          {t('roadmap.detail.actions.generating')}
        </span>
        {topic.setId && (
          <Button
            variant='ghost'
            onClick={onPeekGenerating}
            disabled={disabled}
            title={t('roadmap.detail.toast.peekGenerating')}
            className='gap-1 px-2 py-[6px] rounded-full text-[11.5px] h-auto text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]'
          >
            <Eye size={11} /> {t('roadmap.detail.actions.peek')}
          </Button>
        )}
      </div>
    );
  }
  if (topic.contentStatus === 'FAILED') {
    return (
      <Button
        onClick={onStart}
        disabled={disabled || starting}
        className='shrink-0 gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] h-auto bg-[oklch(0.65_0.2_25/0.15)] text-[oklch(0.65_0.2_25)] hover:bg-[oklch(0.65_0.2_25/0.25)]'
      >
        <RefreshCw size={11} /> {t('roadmap.detail.actions.retry')}
      </Button>
    );
  }
  return (
    <Button
      onClick={onGoToSet}
      disabled={!topic.setId}
      className='shrink-0 gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] font-medium h-auto bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] hover:bg-[var(--pl-accent-soft)]/80'
    >
      <PlayCircle size={11} /> {t('roadmap.detail.actions.study')}
      <ExternalLink size={9} />
    </Button>
  );
};
