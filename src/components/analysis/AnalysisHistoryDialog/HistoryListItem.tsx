import { useTranslation } from 'react-i18next';
import type { KnowledgeAnalysis } from '@/services/types/knowledge-analysis.types';
import { bandColors, bandFor } from '../KnowledgeAnalysisDialog/utils';

interface HistoryListItemProps {
  analysis: KnowledgeAnalysis;
  isLatest: boolean;
  isActive: boolean;
  onSelect: () => void;
}

function averageAccuracy(analysis: KnowledgeAnalysis): number | null {
  const topics = analysis.topicAccuracies;
  if (!topics || topics.length === 0) return null;
  const sum = topics.reduce((acc, tItem) => acc + tItem.accuracy, 0);
  return sum / topics.length;
}

export default function HistoryListItem({
  analysis,
  isLatest,
  isActive,
  onSelect,
}: HistoryListItemProps) {
  const { t, i18n } = useTranslation();
  const avg = averageAccuracy(analysis);
  const created = new Date(analysis.createdAt);
  const dateLabel = Number.isNaN(created.getTime())
    ? analysis.createdAt
    : created.toLocaleString(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  return (
    <button
      type='button'
      onClick={onSelect}
      className={`w-full text-left rounded-[14px] border px-3 py-2.5 transition-colors ${
        isActive
          ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft-2)]'
          : 'border-[var(--pl-border)] bg-[var(--pl-bg)] hover:bg-[var(--pl-bg-hover)]'
      }`}
    >
      <div className='flex items-center justify-between gap-2 mb-1'>
        <span className='text-[12px] font-medium text-[var(--pl-text)] truncate'>
          {dateLabel}
        </span>
        {isLatest && (
          <span className='inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)] shrink-0'>
            {t('analysis.history.latest', { defaultValue: 'Latest' })}
          </span>
        )}
      </div>
      <div className='flex items-center gap-2 text-[11px] text-[var(--pl-text-muted)]'>
        <span>
          {t('analysis.history.topicCount', {
            defaultValue: '{{count}} topics',
            count: analysis.topicAccuracies?.length ?? 0,
          })}
        </span>
        {avg != null && (
          <>
            <span className='text-[var(--pl-text-faint)]'>·</span>
            <span className={`font-semibold ${bandColors(bandFor(avg)).text}`}>
              {Math.round(avg * 100)}%
            </span>
          </>
        )}
      </div>
    </button>
  );
}
