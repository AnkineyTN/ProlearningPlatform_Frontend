import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { SessionType } from '@/services/types/pomodoro.types';

interface Props {
  pomodoroCount: number;
  interval: number;
  type: SessionType;
  running: boolean;
  variant?: 'overlay' | 'panel';
  className?: string;
}

const CycleDots = ({
  pomodoroCount,
  interval,
  type,
  running,
  variant = 'overlay',
  className,
}: Props) => {
  const { t } = useTranslation();
  const pos = pomodoroCount % interval;
  const filled =
    type === 'LONG_BREAK' && pomodoroCount > 0 && pos === 0 ? interval : pos;
  const current =
    type === 'POMODORO' ? Math.min(filled + 1, interval) : Math.max(filled, 1);

  const colors =
    variant === 'overlay'
      ? {
          done: 'bg-white',
          active: 'bg-white/40 ring-1 ring-white/80',
          idle: 'bg-white/20',
        }
      : {
          done: 'bg-[var(--pl-accent)]',
          active: 'bg-[var(--pl-accent)]/30 ring-1 ring-[var(--pl-accent)]',
          idle: 'bg-[var(--pl-border-strong)]',
        };

  return (
    <div
      className={cn('flex items-center justify-center gap-1.5', className)}
      title={t('pomodoro.cycleTooltip', { current, total: interval })}
    >
      {Array.from({ length: interval }).map((_, i) => {
        const isDone = i < filled;
        const isActive = i === filled && type === 'POMODORO';
        return (
          <span
            key={i}
            className={cn(
              'rounded-full transition-all',
              variant === 'overlay' ? 'w-2 h-2' : 'w-1.5 h-1.5',
              isDone ? colors.done : isActive ? colors.active : colors.idle,
              isActive && running && 'animate-pulse',
            )}
          />
        );
      })}
    </div>
  );
};

export default CycleDots;
