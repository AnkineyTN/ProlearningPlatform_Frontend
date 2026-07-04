import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TopicAccuracy } from '@/services/types/knowledge-analysis.types';
import { bandColors, bandFor } from './utils';

interface TopicAccuracySectionProps {
  topics: TopicAccuracy[];
}

export default function TopicAccuracySection({
  topics,
}: TopicAccuracySectionProps) {
  const { t } = useTranslation();
  if (topics.length === 0) return null;

  return (
    <section>
      <div className='flex items-center gap-2 mb-3'>
        <BarChart3 className='w-4 h-4 text-[var(--pl-accent)]' />
        <h3 className='text-sm font-semibold'>
          {t('analysis.sections.topics', { defaultValue: 'Topic accuracy' })}
        </h3>
      </div>
      <ul className='space-y-2.5'>
        {topics.map((topic) => {
          const colors = bandColors(bandFor(topic.accuracy));
          const pct = Math.round(topic.accuracy * 100);
          return (
            <li key={topic.topic} className='space-y-1'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-sm font-medium truncate min-w-0'>
                  {topic.topic}
                </span>
                <span
                  className={`text-xs font-semibold shrink-0 ${colors.text}`}
                >
                  {pct}%
                </span>
              </div>
              <div className='h-1.5 rounded-full bg-[var(--pl-bg-sunken)] overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
