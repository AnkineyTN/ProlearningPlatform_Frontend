import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Lock,
  CheckCircle2,
  BookOpen,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { RoadmapChapter } from '@/services/types/roadmap.types';

import { TopicRow } from './TopicRow';

export const ChapterBlock = ({
  chapter,
  roadmapId,
  roadmapSetId,
  index,
}: {
  chapter: RoadmapChapter;
  roadmapId: number;
  roadmapSetId: number | null;
  index: number;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(
    chapter.status === 'IN_PROGRESS' || chapter.status === 'COMPLETED',
  );

  const locked = chapter.status === 'LOCKED';
  const done = chapter.status === 'COMPLETED';

  const iconWrapClass = done
    ? 'bg-[oklch(0.7_0.18_150/0.2)] text-[oklch(0.7_0.18_150)]'
    : locked
      ? 'bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]'
      : 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]';

  return (
    <div
      className={`rounded-[12px] overflow-hidden bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] ${
        locked ? 'opacity-70' : ''
      }`}
    >
      <Button
        variant='ghost'
        onClick={() => setOpen(!open)}
        className='w-full flex items-center gap-4 p-4 text-left bg-transparent hover:bg-transparent h-auto justify-start rounded-none'
      >
        <div
          className={`w-10 h-10 rounded-[10px] grid place-items-center shrink-0 ${iconWrapClass}`}
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
            <span className='text-[10.5px] uppercase tracking-[0.14em] px-2 py-[2px] rounded-full bg-[var(--pl-bg)] text-[var(--pl-text-faint)] font-[var(--font-mono-pl)]'>
              {t('roadmap.detail.chapter', { n: index + 1 })}
            </span>
            <span className='text-[10.5px] text-[var(--pl-text-faint)]'>
              {t('roadmap.detail.topicsCount', {
                completed: chapter.completedTopics,
                total: chapter.totalTopics,
              })}
            </span>
            {chapter.progressPercent > 0 && !done && (
              <span className='text-[10.5px] font-[var(--font-mono-pl)] text-[var(--pl-accent-strong)]'>
                {chapter.progressPercent}%
              </span>
            )}
          </div>
          <h3 className='text-[15.5px] font-medium truncate text-[var(--pl-text)]'>
            {chapter.title}
          </h3>
          {chapter.objective && (
            <p className='text-[12.5px] mt-0.5 line-clamp-1 text-[var(--pl-text-muted)]'>
              {chapter.objective}
            </p>
          )}
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform text-[var(--pl-text-faint)] ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </Button>

      {open && !locked && (
        <div className='px-4 py-4 flex flex-col gap-2 border-t border-[var(--pl-border)]'>
          {chapter.topics
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((topic) => (
              <TopicRow
                key={topic.id}
                topic={topic}
                roadmapId={roadmapId}
                roadmapSetId={roadmapSetId}
                disabled={locked}
              />
            ))}
        </div>
      )}

      {open && locked && (
        <div className='px-4 py-4 text-[12.5px] flex items-center gap-2 border-t border-[var(--pl-border)] text-[var(--pl-text-faint)]'>
          <Lock size={12} />
          {t('roadmap.detail.lockedHint')}
        </div>
      )}
    </div>
  );
};
