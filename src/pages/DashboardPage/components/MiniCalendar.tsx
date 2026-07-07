import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHeatmap } from '@/hooks/useActivityLog';
import { Panel, PanelHead } from './Panel';

function formatStudyTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

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

  const studyMinutes = useMemo(() => {
    const map = new Map<number, number>();
    (heatmap ?? []).forEach((d) => {
      if (!d.date || d.totalMinutes <= 0) return;
      const [y, m, day] = d.date.split('-').map(Number);
      if (y === year && m === month + 1) map.set(day, d.totalMinutes);
    });
    return map;
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
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
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
            const minutes = studyMinutes.get(d);
            const hasActivity = minutes !== undefined;
            const cell = (
              <Button
                variant={isToday ? 'default' : 'ghost'}
                key={d}
                className={cn(
                  'rounded-3xl grid place-items-center text-[11px] relative border-0',
                  hasActivity
                    ? 'text-[var(--pl-text)]'
                    : 'text-[var(--pl-text-faint)]',
                  isToday && 'text-accent',
                )}
              >
                {d}
                {!isToday && hasActivity && (
                  <span className='absolute bottom-[3px] w-[3px] h-[3px] rounded-full bg-[var(--pl-accent)]' />
                )}
              </Button>
            );

            if (!hasActivity) return cell;

            return (
              <Tooltip key={d}>
                <TooltipTrigger asChild>{cell}</TooltipTrigger>
                <TooltipContent>
                  {formatStudyTime(minutes)} studied
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
