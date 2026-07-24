import { ArrowRight, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { type Set } from '@/components/cards/SetCard';
import { Panel, PanelHead } from './Panel';

type Props = {
  sets: Set[];
};

export function RecentSetsPanel({ sets }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Panel>
      <PanelHead
        kicker={t('dashboard.recentSets.kicker')}
        title={t('dashboard.recentSets.title')}
        right={
          <button
            onClick={() => navigate('/sets')}
            className='flex items-center gap-1 text-[12.5px] text-[var(--pl-text-muted)] bg-transparent border-0 cursor-pointer'
          >
            {t('dashboard.viewAll')} <ArrowRight size={11} />
          </button>
        }
      />
      <div className='px-3 pt-1 pb-4'>
        {sets.length === 0 && (
          <div className='px-[14px] py-4 flex items-center justify-between'>
            <p className='text-[13px] text-[var(--pl-text-faint)]'>
              {t('dashboard.recentSets.empty')}
            </p>
            <button
              onClick={() => navigate('/sets')}
              className='text-[12.5px] text-[var(--pl-accent-strong)] bg-transparent border-0 cursor-pointer hover:underline'
            >
              {t('dashboard.recentSets.createFirst')}
            </button>
          </div>
        )}
        {sets.map((s, i) => (
          <button
            key={s.id ?? i}
            onClick={() => navigate(`/sets/${s.id}`)}
            className='w-full flex items-center gap-[14px] px-[14px] py-3 rounded-lg text-left bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]'
          >
            <div className='w-10 h-10 rounded-[10px] shrink-0 bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] grid place-items-center'>
              <BookOpen size={16} />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='text-[14px] font-semibold text-[var(--pl-text)] overflow-hidden text-ellipsis whitespace-nowrap'>
                {s.title}
              </div>
              {s.description && (
                <div className='text-[12px] text-[var(--pl-text-muted)] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap cursor-default'>
                  {s.description}
                </div>
              )}
            </div>
            <div className='flex gap-[14px] text-[11.5px] text-[var(--pl-text-faint)] shrink-0 tabular-nums'>
              <span>
                {t('dashboard.recentSets.notesCount', { count: s.numNotes })}
              </span>
              <span>
                {t('dashboard.recentSets.cardsCount', {
                  count: s.numFlashcards ?? 0,
                })}
              </span>
              <span>{s.updated_at}</span>
            </div>
            <ArrowRight
              size={13}
              className='text-[var(--pl-text-faint)] shrink-0'
            />
          </button>
        ))}
      </div>
    </Panel>
  );
}
