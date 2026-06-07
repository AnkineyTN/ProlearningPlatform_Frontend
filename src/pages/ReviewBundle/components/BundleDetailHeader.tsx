import { ArrowLeft, LayoutList, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReviewBundleDetail } from '@/services/types/review-bundle.types';
import { formatPeriod } from '../utils';

type ViewMode = 'flip' | 'list';

export function BundleDetailHeader({
  bundle,
  hasCards,
  viewMode,
  onViewModeChange,
  onBack,
}: {
  bundle: ReviewBundleDetail;
  hasCards: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onBack: () => void;
}) {
  const { t, i18n } = useTranslation();

  return (
    <>
      <div className='flex items-center gap-3 mb-6'>
        <Button variant='ghost' size='sm' onClick={onBack} className='cursor-pointer'>
          <ArrowLeft className='w-4 h-4 mr-1' />
          {t('reviewBundles.detail.back')}
        </Button>
      </div>

      <div className='mb-6 flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-xl font-bold'>
            {t('reviewBundles.item.title', { id: bundle.id })}
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('reviewBundles.detail.period', {
              period: formatPeriod(bundle.periodFrom, bundle.periodTo, i18n.language),
            })}{' '}
            &middot;{' '}
            <span className='font-medium text-[var(--pl-accent)]'>
              {t('reviewBundles.item.cardCount', { count: bundle.cardCount })}
            </span>
          </p>
        </div>

        {hasCards && (
          <div className='inline-flex rounded-lg border border-border p-0.5 bg-[var(--pl-bg-elev)]'>
            <button
              type='button'
              onClick={() => onViewModeChange('flip')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
                viewMode === 'flip'
                  ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <RotateCcw className='w-3.5 h-3.5' />
              {t('reviewBundles.detail.viewMode.flip')}
            </button>
            <button
              type='button'
              onClick={() => onViewModeChange('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutList className='w-3.5 h-3.5' />
              {t('reviewBundles.detail.viewMode.list')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
