import { useTranslation } from 'react-i18next';

export const ProgressBar = ({
  completed,
  total,
  percent,
  completedFlag,
}: {
  completed: number;
  total: number;
  percent: number;
  completedFlag: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className='rounded-[12px] p-4 flex items-center gap-4 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
      <div className='flex-1'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-[11px] uppercase tracking-[0.14em] text-[var(--pl-text-faint)]'>
            {t('roadmap.detail.progressLabel')}
          </span>
          <span
            className={`text-[12.5px] font-medium font-mono-pl ${
              completedFlag
                ? 'text-[oklch(0.7_0.18_150)]'
                : 'text-[var(--pl-accent-strong)]'
            }`}
          >
            {completed}/{total} · {percent}%
          </span>
        </div>
        <div className='h-2 w-full rounded-full overflow-hidden bg-[var(--pl-bg-hover)]'>
          <div
            className={`h-full rounded-full transition-all ${
              completedFlag
                ? 'bg-gradient-to-r from-[oklch(0.7_0.18_150)] to-[oklch(0.75_0.16_130)]'
                : 'bg-[var(--pl-accent)]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
