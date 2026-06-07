import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContributingSource } from '@/services/types/knowledge-analysis.types';
import { formatDate, STALE_MS } from './utils';

interface ContributingSourcesProps {
  createdAt: string;
  sources: ContributingSource[];
}

export default function ContributingSources({
  createdAt,
  sources,
}: ContributingSourcesProps) {
  const { t } = useTranslation();
  const setAnalysisTime = new Date(createdAt).getTime();

  return (
    <section className='border-t border-border pt-4'>
      <h3 className='text-sm font-semibold mb-2'>
        {t('analysis.sections.contributingSources', {
          defaultValue: 'Contributing sources',
        })}
      </h3>
      <ul className='space-y-1.5'>
        {sources.map((src) => {
          const analyzedAt = new Date(src.analyzedAt).getTime();
          const stale =
            Number.isFinite(analyzedAt) &&
            Number.isFinite(setAnalysisTime) &&
            setAnalysisTime - analyzedAt > STALE_MS;
          return (
            <li
              key={`${src.sourceType}-${src.sourceId}-${src.analysisId}`}
              className='flex items-center justify-between gap-3 text-xs'
            >
              <span className='flex items-center gap-2'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full border border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {src.sourceType}
                </span>
                <span className='text-muted-foreground'>
                  #{src.sourceId} · {formatDate(src.analyzedAt)}
                </span>
              </span>
              {stale && (
                <span className='text-[var(--pl-warning-text)] flex items-center gap-1'>
                  <TriangleAlert className='w-3 h-3' />
                  {t('analysis.stale', { defaultValue: 'Outdated' })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
