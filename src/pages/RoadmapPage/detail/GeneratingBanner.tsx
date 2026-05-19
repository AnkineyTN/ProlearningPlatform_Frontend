import { useTranslation } from 'react-i18next';
import { Loader2, AlertTriangle } from 'lucide-react';

export const GeneratingBanner = ({
  count,
  hasSlow,
}: {
  count: number;
  hasSlow: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className='rounded-[12px] px-4 py-3 mb-4 flex items-start gap-3 bg-[var(--pl-accent-soft)] border border-[var(--pl-border)]'>
      <div className='w-8 h-8 rounded-[8px] grid place-items-center shrink-0 bg-[var(--pl-bg-elev)] text-[var(--pl-accent-strong)]'>
        <Loader2 size={14} className='animate-spin' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-[13px] font-medium text-[var(--pl-text)]'>
          {t('roadmap.detail.generatingBanner.title', { count })}
        </p>
        <p className='text-[12px] mt-0.5 text-[var(--pl-text-muted)]'>
          {t('roadmap.detail.generatingBanner.subtitle')}
        </p>
        {hasSlow && (
          <p className='text-[11.5px] mt-2 flex items-start gap-1.5 text-[oklch(0.65_0.2_25)]'>
            <AlertTriangle size={12} className='shrink-0 mt-[1px]' />
            <span>{t('roadmap.detail.generatingBanner.slowWarning')}</span>
          </p>
        )}
      </div>
    </div>
  );
};
