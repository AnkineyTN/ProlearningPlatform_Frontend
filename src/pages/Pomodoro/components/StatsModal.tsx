import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWeeklyStats } from '@/hooks/usePomodoro';
import { formatStatDuration, type StatsTimeFormat } from '../useUiPrefs';

interface Props {
  open: boolean;
  onClose: () => void;
  timeFormat: StatsTimeFormat;
}

const formatDate = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Get this week's Monday (ISO week start) in the user's local time.
const getMondayOfWeek = (now = new Date()) => {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay(); // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

const StatsModal = ({ open, onClose, timeFormat }: Props) => {
  const { t, i18n } = useTranslation();
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (open) setWeekOffset(0);
  }, [open]);

  const { startDate, rangeLabel } = useMemo(() => {
    const monday = getMondayOfWeek();
    monday.setDate(monday.getDate() + weekOffset * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const lang = i18n.language;
    return {
      startDate: formatDate(monday),
      rangeLabel: `${monday.toLocaleDateString(lang, fmt)} – ${sunday.toLocaleDateString(lang, fmt)}`,
    };
  }, [weekOffset, i18n.language]);

  const { data, isLoading } = useWeeklyStats(open ? startDate : '', 'UTC');

  const hasData =
    !!data &&
    data.dailyBreakdown.some((d) => d.sessions > 0 || d.focusMinutes > 0);

  const maxFocus = data
    ? Math.max(1, ...data.dailyBreakdown.map((d) => d.focusMinutes))
    : 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('pomodoro.stats.title')}</DialogTitle>
        </DialogHeader>

        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            size='icon'
            className='size-7 rounded-full'
            onClick={() => setWeekOffset((w) => w - 1)}
            title={t('pomodoro.stats.prevWeek')}
          >
            <ChevronLeft size={14} />
          </Button>
          <div className='text-sm font-medium text-[var(--pl-text)]'>
            {weekOffset === 0 ? t('pomodoro.stats.thisWeek') : rangeLabel}
            {weekOffset === 0 && (
              <span className='ms-2 text-xs text-[var(--pl-text-faint)]'>
                {rangeLabel}
              </span>
            )}
          </div>
          <Button
            variant='outline'
            size='icon'
            className='size-7 rounded-full'
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset >= 0}
            title={t('pomodoro.stats.nextWeek')}
          >
            <ChevronRight size={14} />
          </Button>
        </div>

        <div className='min-h-[330px] flex flex-col'>
          {isLoading || !data ? (
            <div className='flex-1 flex items-center justify-center text-[var(--pl-text-faint)]'>
              {t('common.loading')}
            </div>
          ) : !hasData ? (
            <div className='flex-1 flex flex-col items-center justify-center text-center'>
              <div className='w-16 h-16 rounded-[20px] grid place-items-center mb-4 bg-[var(--pl-accent-soft)]'>
                <BarChart3 size={28} className='text-[var(--pl-accent)]' />
              </div>
              <p className='text-sm font-medium text-[var(--pl-text)] mb-1'>
                {t('pomodoro.stats.noData')}
              </p>
              <p className='text-xs text-[var(--pl-text-muted)] max-w-[320px]'>
                {t('pomodoro.stats.noDataHint')}
              </p>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                <StatCard
                  icon={<Timer size={16} />}
                  label={t('pomodoro.stats.focusMinutes')}
                  value={formatStatDuration(data.totalFocusMinutes, timeFormat)}
                />
                <StatCard
                  icon={<Target size={16} />}
                  label={t('pomodoro.stats.sessions')}
                  value={data.totalSessions.toString()}
                />
                <StatCard
                  icon={<TrendingUp size={16} />}
                  label={t('pomodoro.stats.completion')}
                  value={`${Math.round(data.completionRate * 100)}%`}
                />
                <StatCard
                  icon={<Flame size={16} />}
                  label={t('pomodoro.stats.streak')}
                  value={data.currentStreak.toString()}
                />
              </div>

              <div className='mt-2'>
                <div className='text-xs uppercase tracking-wide text-[var(--pl-text-faint)] mb-2'>
                  {t('pomodoro.stats.daily')}
                </div>
                <div className='flex gap-2 h-40'>
                  {data.dailyBreakdown.map((d) => {
                    const heightPct = (d.focusMinutes / maxFocus) * 100;
                    const dayLabel = new Date(d.date).toLocaleDateString(
                      undefined,
                      { weekday: 'short' },
                    );
                    const focusLabel = formatStatDuration(
                      d.focusMinutes,
                      timeFormat,
                    );
                    return (
                      <div
                        key={d.date}
                        className='flex-1 flex flex-col items-center gap-1'
                        title={`${d.date}: ${focusLabel} · ${d.completedSessions}/${d.sessions}`}
                      >
                        <div className='min-h-[14px] text-[10px] text-[var(--pl-text-faint)] whitespace-nowrap'>
                          {d.focusMinutes > 0 ? focusLabel : ''}
                        </div>
                        <div className='w-full flex-1 bg-[var(--pl-bg-sunken)] rounded-md flex items-end overflow-hidden'>
                          <div
                            className='w-full bg-[var(--pl-accent)] rounded-md transition-all'
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <div className='text-[10px] text-[var(--pl-text-muted)]'>
                          {dayLabel}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='mt-2 min-h-[16px] text-xs text-[var(--pl-text-muted)]'>
                {data.bestDay &&
                  data.bestDay.focusMinutes > 0 &&
                  t('pomodoro.stats.bestDay', {
                    date: data.bestDay.date,
                    time: formatStatDuration(
                      data.bestDay.focusMinutes,
                      timeFormat,
                    ),
                  })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className='rounded-lg border border-[var(--pl-border)] p-3 bg-[var(--pl-bg-sunken)]'>
    <div className='flex items-center gap-1.5 text-[var(--pl-text-faint)] text-xs'>
      {icon}
      <span>{label}</span>
    </div>
    <div className='text-2xl font-semibold mt-1 text-[var(--pl-text)]'>
      {value}
    </div>
  </div>
);

export default StatsModal;
