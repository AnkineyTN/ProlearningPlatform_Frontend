import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';

export const CompletedBanner = () => {
  const { t } = useTranslation();
  return (
    <div className='rounded-[14px] p-5 mb-5 flex items-center gap-4 bg-gradient-to-br from-[oklch(0.7_0.18_150/0.15)] to-[var(--pl-accent-soft)] border border-[var(--pl-border)]'>
      <div className='w-12 h-12 rounded-[12px] grid place-items-center shrink-0 bg-[oklch(0.7_0.18_150)] text-white'>
        <Trophy size={22} />
      </div>
      <div>
        <h3 className='text-[16px] font-medium text-[var(--pl-text)]'>
          {t('roadmap.detail.completedBannerTitle')}
        </h3>
        <p className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
          {t('roadmap.detail.completedBannerSubtitle')}
        </p>
      </div>
    </div>
  );
};
