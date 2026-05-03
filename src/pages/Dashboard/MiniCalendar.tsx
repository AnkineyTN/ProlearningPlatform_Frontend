import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHeatmap } from '@/hooks/useActivityLog';
import { Panel, PanelHead } from './Panel';

export function MiniCalendar() {
  const now = new Date();
  const [current, setCurrent] = useState(now);
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = now.getDate();
  const sameMonth = now.getFullYear() === year && now.getMonth() === month;

  const monthName = current.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const monthsBack = useMemo(() => {
    const diff = (nowYear - year) * 12 + (nowMonth - month);
    return Math.max(1, diff + 1);
  }, [nowYear, nowMonth, year, month]);

  const { data: heatmap } = useHeatmap(monthsBack);

  const studyDays = useMemo(() => {
    const set = new Set<number>();
    (heatmap ?? []).forEach((d) => {
      if (!d.date || d.totalMinutes <= 0) return;
      const [y, m, day] = d.date.split('-').map(Number);
      if (y === year && m === month + 1) set.add(day);
    });
    return set;
  }, [heatmap, year, month]);

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));
  const goToday = () => setCurrent(new Date());

  return (
    <Panel>
      <PanelHead
        title={`${monthName} ${year}`}
        right={
          <div className='flex gap-2 items-center'>
            {!sameMonth && (
              <Button variant='ghost' onClick={goToday} size='sm'>
                Today
              </Button>
            )}
            <Button variant='ghost' onClick={prev} size='sm'>
              <ChevronLeft size={12} />
            </Button>
            <Button variant='ghost' onClick={next} size='sm'>
              <ChevronRight size={12} />
            </Button>
          </div>
        }
      />
      <div className='px-5 pt-1 pb-[18px]'>
        <div className='grid grid-cols-7 gap-2 text-sm text-foreground text-center mb-2'>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-2'>
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={'e' + i} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isToday = sameMonth && d === today;
            const hasActivity = studyDays.has(d);
            return (
              <button
                key={d}
                className={cn(
                  'aspect-square rounded-[6px] grid place-items-center text-[11px] relative border-0 cursor-pointer',
                  isToday
                    ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] font-semibold'
                    : hasActivity
                      ? 'bg-transparent text-[var(--pl-text)]'
                      : 'bg-transparent text-[var(--pl-text-faint)]',
                )}
              >
                {d}
                {!isToday && hasActivity && (
                  <span className='absolute bottom-[3px] w-[3px] h-[3px] rounded-full bg-[var(--pl-accent)]' />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
