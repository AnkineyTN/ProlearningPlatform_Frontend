import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ReviewBundleCard } from '@/services/types/review-bundle.types';

export function FlipCardViewer({
  card,
  index,
  total,
  flipped,
  onFlip,
  onPrev,
  onNext,
}: {
  card: ReviewBundleCard;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className='mb-8'>
      <div
        className='relative cursor-pointer select-none'
        style={{ perspective: '1000px' }}
        onClick={onFlip}
      >
        <div
          className='relative w-full min-h-[200px] transition-transform duration-500'
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className='absolute inset-0 flex flex-col items-center justify-center bg-[var(--pl-bg)] border border-border rounded-2xl p-8 text-center backface-hidden'
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className='text-xs text-muted-foreground mb-3 uppercase tracking-wider'>
              {t('reviewBundles.detail.card.front')}
            </p>
            <p className='text-lg font-medium'>{card.frontCard}</p>
            <p className='text-xs text-muted-foreground mt-4'>
              {t('reviewBundles.detail.card.tapToReveal')}
            </p>
          </div>
          <div
            className='absolute inset-0 flex flex-col items-center justify-center bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)] rounded-2xl p-8 text-center'
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className='text-xs text-muted-foreground mb-3 uppercase tracking-wider'>
              {t('reviewBundles.detail.card.back')}
            </p>
            <p className='text-lg font-medium'>{card.backCard}</p>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-center gap-4 mt-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onPrev}
          disabled={index === 0}
          className='cursor-pointer'
        >
          <ChevronLeft className='w-5 h-5' />
        </Button>
        <span className='text-sm text-muted-foreground'>
          {index + 1} / {total}
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={onNext}
          disabled={index >= total - 1}
          className='cursor-pointer'
        >
          <ChevronRight className='w-5 h-5' />
        </Button>
      </div>

      <div className='flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground'>
        <RotateCcw className='w-3 h-3' />
        <span>{t('reviewBundles.detail.card.tapToFlip')}</span>
      </div>
    </div>
  );
}
