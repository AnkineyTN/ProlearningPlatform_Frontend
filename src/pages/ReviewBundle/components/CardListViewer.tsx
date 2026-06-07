import { useTranslation } from 'react-i18next';
import type { ReviewBundleCard } from '@/services/types/review-bundle.types';

export function CardListViewer({ cards }: { cards: ReviewBundleCard[] }) {
  const { t } = useTranslation();

  return (
    <div className='mb-8 space-y-3'>
      {cards.map((c, i) => (
        <div
          key={c.id ?? i}
          className='border border-border rounded-xl p-4 bg-[var(--pl-bg)]'
        >
          <div className='text-[11px] uppercase tracking-wider text-muted-foreground mb-1'>
            {t('reviewBundles.detail.list.frontLabel', { index: i + 1 })}
          </div>
          <div className='text-base font-medium mb-3'>{c.frontCard}</div>
          <div className='border-t border-border pt-3'>
            <div className='text-[11px] uppercase tracking-wider text-muted-foreground mb-1'>
              {t('reviewBundles.detail.list.backLabel')}
            </div>
            <div className='text-base'>{c.backCard}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
