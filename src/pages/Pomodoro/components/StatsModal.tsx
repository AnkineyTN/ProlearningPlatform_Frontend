import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Target, Timer, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useWeeklyStats } from '@/hooks/usePomodoro';

interface Props {
  open: boolean;
  onClose: () => void;
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

const StatsModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation();

  const { startDate, timezone } = useMemo(() => {
    const monday = getMondayOfWeek();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return { startDate: formatDate(monday), timezone: tz };
  }, []);

  const { data, isLoading } = useWeeklyStats(open ? startDate : '', timezone);

  const maxFocus = data
    ? Math.max(1, ...data.dailyBreakdown.map((d) => d.focusMinutes))
    : 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('pomodoro.stats.title')}</DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className='text-center py-12 text-[var(--pl-text-faint)]'>
            {t('common.loading')}
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <StatCard
                icon={<Timer size={16} />}
                label={t('pomodoro.stats.focusMinutes')}
                value={data.totalFocusMinutes.toString()}
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
              <div className='flex items-end gap-2 h-40'>
                {data.dailyBreakdown.map((d) => {
                  const heightPct = (d.focusMinutes / maxFocus) * 100;
                  const dayLabel = new Date(d.date).toLocaleDateString(
                    undefined,
                    { weekday: 'short' },
                  );
                  return (
                    <div
                      key={d.date}
                      className='flex-1 flex flex-col items-center gap-1'
                      title={`${d.date}: ${d.focusMinutes} min · ${d.completedSessions}/${d.sessions}`}
                    >
                      <div className='text-[10px] text-[var(--pl-text-faint)]'>
                        {d.focusMinutes > 0 ? d.focusMinutes : ''}
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

            {data.bestDay && data.bestDay.focusMinutes > 0 && (
              <div className='mt-2 text-xs text-[var(--pl-text-muted)]'>
                {t('pomodoro.stats.bestDay', {
                  date: data.bestDay.date,
                  minutes: data.bestDay.focusMinutes,
                })}
              </div>
            )}
          </>
        )}
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
