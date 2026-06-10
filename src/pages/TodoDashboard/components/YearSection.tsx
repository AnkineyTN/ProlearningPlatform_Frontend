import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Goal } from '@/services/types/todo.types';
import { Button } from '@/components/ui/button';

interface YearSectionProps {
  goals: Goal[];
  onEditGoal: (g: Goal) => void;
  onNewGoal: () => void;
}

const MonthCell = ({
  monthIndex,
  year,
  goals,
  onEditGoal,
}: {
  monthIndex: number;
  year: number;
  goals: Goal[];
  onEditGoal: (g: Goal) => void;
}) => {
  const { t, i18n } = useTranslation();
  const monthLabel = new Date(year, monthIndex, 1)
    .toLocaleDateString(i18n.language, { month: 'short' })
    .toUpperCase();
  const isCurrent =
    new Date().getFullYear() === year && new Date().getMonth() === monthIndex;

  return (
    <div
      className={`rounded-[12px] p-3 border bg-[var(--pl-bg-elev)] min-h-[140px] flex flex-col ${isCurrent ? 'border-[var(--pl-accent-border)]' : 'border-[var(--pl-border)]'}`}
    >
      <div className='flex items-baseline justify-between mb-2'>
        <div
          className='text-[10.5px] tracking-[0.18em]'
          style={{
            color: isCurrent
              ? 'var(--pl-accent-strong)'
              : 'var(--pl-text-faint)',
          }}
        >
          {monthLabel}
        </div>
        <span className='text-[10px] font-mono-pl text-[var(--pl-text-faint)]'>
          {goals.length > 0 ? goals.length : ''}
        </span>
      </div>

      {goals.length === 0 ? (
        <div className='flex-1 grid place-items-center text-[10.5px] italic text-[var(--pl-text-faint)] opacity-60'>
          —
        </div>
      ) : (
        <div className='flex flex-col gap-1.5'>
          {goals.map((g) => {
            const accent = g.color ?? '#6366f1';
            return (
              <Button
                key={g.id}
                variant='ghost'
                onClick={() => onEditGoal(g)}
                className='h-auto w-full justify-start rounded-[6px] px-1.5 py-1 text-left'
                title={t('todo.year.progressHint', { progress: g.progress })}
              >
                <span
                  className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                  style={{ background: accent }}
                />
                <span className='text-[11.5px] truncate text-[var(--pl-text)]'>
                  {g.title}
                </span>
                <span
                  className='ml-auto text-[10px] font-mono-pl flex-shrink-0'
                  style={{ color: accent }}
                >
                  {g.progress}%
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const YearSection = ({ goals, onEditGoal, onNewGoal }: YearSectionProps) => {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(() => new Date().getFullYear());

  const goalsByMonth = useMemo(() => {
    const buckets: Goal[][] = Array.from({ length: 12 }, () => []);
    goals.forEach((g) => {
      if (!g.targetDate) return;
      const d = new Date(g.targetDate);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()].push(g);
      }
    });
    return buckets;
  }, [goals, year]);

  const undatedGoals = useMemo(
    () => goals.filter((g) => !g.targetDate),
    [goals],
  );
  const totalScheduled = goalsByMonth.reduce((s, b) => s + b.length, 0);

  return (
    <section className='mb-7'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-baseline gap-3'>
          <h2 className='text-[22px] font-display tracking-tight m-0 text-[var(--pl-text)]'>
            {t('todo.year.title')}
          </h2>
          <span className='text-[12px] text-[var(--pl-text-muted)]'>
            {t('todo.year.subtitle', { count: totalScheduled })}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button variant='outline' size='sm' onClick={onNewGoal}>
            <Plus className='w-3 h-3' />
            {t('todo.overall.newGoal')}
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <div className='text-[13px] font-mono-pl px-3 py-1 min-w-[70px] text-center text-[var(--pl-text)]'>
            {year}
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3'>
        {goalsByMonth.map((bucket, idx) => (
          <MonthCell
            key={idx}
            monthIndex={idx}
            year={year}
            goals={bucket}
            onEditGoal={onEditGoal}
          />
        ))}
      </div>

      {undatedGoals.length > 0 && (
        <div className='mt-4 rounded-[12px] p-4 border border-dashed border-[var(--pl-border)] bg-[var(--pl-bg-elev)]'>
          <div className='text-[10.5px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('todo.year.undatedHeader', { count: undatedGoals.length })}
          </div>
          <div className='flex flex-wrap gap-2'>
            {undatedGoals.map((g) => {
              const accent = g.color ?? '#6366f1';
              return (
                <button
                  key={g.id}
                  onClick={() => onEditGoal(g)}
                  className='inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] hover:opacity-80'
                  style={{
                    borderColor: `color-mix(in oklch, ${accent} 35%, transparent)`,
                    background: `color-mix(in oklch, ${accent} 8%, transparent)`,
                    color: accent,
                  }}
                >
                  <span
                    className='w-1.5 h-1.5 rounded-full'
                    style={{ background: accent }}
                  />
                  {g.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default YearSection;
