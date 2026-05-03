import { cn } from '@/lib/utils';

export function StatCard({
  kicker,
  value,
  unit,
  hint,
  trend,
  trendDir,
  icon,
  progress,
}: {
  kicker: string;
  value: string;
  unit: string;
  hint?: string;
  trend?: string;
  trendDir?: 'up' | 'down';
  icon?: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-5 pt-[18px] pb-5 overflow-hidden'>
      <div className='flex justify-between items-start'>
        <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
          {kicker}
        </div>
        {icon && <span className='text-[var(--pl-accent)]'>{icon}</span>}
      </div>
      <div className='flex items-baseline gap-[6px] mt-[14px]'>
        <span className='text-[40px] font-semibold tracking-[-0.03em] leading-none text-[var(--pl-text)]'>
          {value}
        </span>
        <span className='text-[13px] text-[var(--pl-text-muted)] tabular-nums'>
          {unit}
        </span>
      </div>
      {progress !== undefined && (
        <div className='mt-3 h-[3px] bg-[var(--pl-border)] rounded-full overflow-hidden'>
          <div
            className='h-full bg-[var(--pl-accent)]'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className='mt-[10px] flex justify-between text-[11px] text-[var(--pl-text-faint)]'>
        <span>{hint}</span>
        {trend && (
          <span
            className={cn(
              'tabular-nums',
              trendDir === 'up'
                ? 'text-[var(--pl-success,oklch(0.72_0.15_155))]'
                : 'text-[var(--pl-danger,oklch(0.65_0.2_25))]',
            )}
          >
            {trendDir === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
