import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, RefreshCw, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRoadmap } from '@/hooks/useRoadmap';

import { ProgressBar } from './detail/ProgressBar';
import { CompletedBanner } from './detail/CompletedBanner';
import { ChapterBlock } from './detail/ChapterBlock';
import { GeneratingBanner } from './detail/GeneratingBanner';
import {
  GeneratingContext,
  SLOW_GENERATING_THRESHOLD_SEC,
  useGeneratingTracker,
} from './detail/useGeneratingElapsed';

const RoadmapDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const roadmapId = Number(id);
  const navigate = useNavigate();

  const { data: roadmap, isLoading, refetch } = useRoadmap(roadmapId);
  const elapsedMap = useGeneratingTracker(roadmap);
  const generatingCount = elapsedMap.size;
  const hasSlow = Array.from(elapsedMap.values()).some(
    (s) => s >= SLOW_GENERATING_THRESHOLD_SEC,
  );

  if (isLoading || !roadmap) {
    return (
      <div className='min-h-screen grid place-items-center bg-[var(--pl-bg)]'>
        <Loader2
          size={22}
          className='animate-spin text-[var(--pl-text-faint)]'
        />
      </div>
    );
  }

  const isCompleted = roadmap.status === 'COMPLETED';

  return (
    <GeneratingContext.Provider value={elapsedMap}>
    <div className='min-h-screen bg-[var(--pl-bg)]'>
      <div className='px-10 pt-8 pb-0'>
        <Button
          variant='ghost'
          onClick={() => navigate('/roadmaps')}
          className='gap-2 text-[12.5px] mb-4 text-[var(--pl-text-muted)] h-auto p-0 hover:bg-transparent hover:text-[var(--pl-text)]'
        >
          <ArrowLeft size={13} /> {t('roadmap.backToList')}
        </Button>

        {isCompleted && <CompletedBanner />}
        {generatingCount > 0 && (
          <GeneratingBanner count={generatingCount} hasSlow={hasSlow} />
        )}

        <div className='flex items-end justify-between mb-6 gap-6'>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.16em] text-[var(--pl-text-faint)]'>
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
            <h1 className='text-[38px] leading-tight mb-3 tracking-[-0.03em] font-[var(--font-display)] text-[var(--pl-text)]'>
              {roadmap.title}
            </h1>
            <p className='text-[13.5px] max-w-[640px] text-[var(--pl-text-muted)]'>
              {roadmap.overview}
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => refetch()}
            className='gap-2 px-4 py-2 rounded-full text-[12.5px] shrink-0 h-auto bg-[var(--pl-bg-elev)] text-[var(--pl-text-muted)] border-[var(--pl-border)]'
          >
            <RefreshCw size={12} /> {t('roadmap.refresh')}
          </Button>
        </div>

        <ProgressBar
          completed={roadmap.completedTopics}
          total={roadmap.totalTopics}
          percent={roadmap.progressPercent}
          completedFlag={isCompleted}
        />

        <div className='mt-7 border-b border-[var(--pl-border)]' />
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
    </GeneratingContext.Provider>
  );
};

export default RoadmapDetailPage;
