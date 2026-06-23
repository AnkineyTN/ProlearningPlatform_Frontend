import { useEffect, useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { ReviewBundleCard } from '@/services/types/review-bundle.types';

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd
    className='text-[10px] px-[6px] py-[2px] rounded bg-[var(--pl-bg-hover)] border border-[var(--pl-border)]'
    style={{ fontFamily: 'var(--font-mono-pl)' }}
  >
    {children}
  </kbd>
);

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

  // Stable callback refs — avoids stale closures in the keyboard effect
  const onFlipRef = useRef(onFlip);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  useEffect(() => {
    onFlipRef.current = onFlip;
    onPrevRef.current = onPrev;
    onNextRef.current = onNext;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          onFlipRef.current();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevRef.current();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextRef.current();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cardNumber = String(index + 1).padStart(2, '0');
  const progress = ((index + 1) / total) * 100;

  return (
    <div className='mb-8'>
      {/* Progress bar */}
      <div className='px-2'>
        <div
          className='flex justify-between text-xs mb-2 text-[var(--pl-text-faint)]'
          style={{ fontFamily: 'var(--font-mono-pl)' }}
        >
          <span>
            {cardNumber} / {total}
          </span>
        </div>
        <div className='h-[2px] rounded-full overflow-hidden bg-[var(--pl-border)]'>
          <div
            className='h-full rounded-full transition-all duration-300 bg-[var(--pl-accent)]'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className='flex items-center justify-center py-8 gap-7'>
        <Button
          onClick={onPrev}
          disabled={index === 0}
          variant='outline'
          size='icon'
          className='shrink-0 text-[var(--pl-text-muted)]'
        >
          <ChevronLeft className='size-6' />
        </Button>

        <div className='flex-1 max-w-[720px]'>
          <div className='relative h-[440px] [perspective:1800px]'>
            <div
              onClick={onFlip}
              className='relative h-[440px] cursor-pointer select-none [transform-style:preserve-3d]'
              style={{
                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: flipped ? 'rotateY(180deg)' : 'none',
              }}
            >
              {/* Front face */}
              <div
                className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-[0_30px_80px_oklch(0_0_0_/_0.1)]'
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className='flex justify-between items-start'>
                  <span className='text-[11px] uppercase tracking-[0.16em] text-[var(--pl-text-faint)]'>
                    {t('reviewBundles.detail.card.front')} ·{' '}
                    {t('reviewBundles.detail.card.tapToReveal')}
                  </span>
                </div>

                <div className='flex-1 flex items-center justify-center text-center py-5'>
                  <div>
                    <div
                      className='text-[13px] mb-4 text-[var(--pl-text-faint)]'
                      style={{ fontFamily: 'var(--font-mono-pl)' }}
                    >
                      Q·{cardNumber}
                    </div>
                    <div
                      className='text-[32px] font-[400] leading-[1.25] tracking-[-0.02em] text-[var(--pl-text)]'
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      {card.frontCard}
                    </div>
                  </div>
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-[5px] text-[11px] text-[var(--pl-text-faint)]'>
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                    <span className='ml-1'>{t('reviewBundles.detail.card.navigate')}</span>
                  </div>
                  <div className='flex items-center gap-2 text-[11.5px] text-[var(--pl-text-faint)]'>
                    <span>{t('reviewBundles.detail.card.press')}</span>
                    <Kbd>Space</Kbd>
                    <span>{t('reviewBundles.detail.card.toFlip')}</span>
                  </div>
                </div>
              </div>

              {/* Back face */}
              <div
                className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col bg-[var(--pl-bg-elev)] border border-[var(--pl-accent-border)] shadow-[0_30px_80px_oklch(0_0_0_/_0.1)]'
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className='text-[11px] uppercase tracking-[0.16em] mb-5 text-[var(--pl-accent-strong)]'>
                  {t('reviewBundles.detail.card.back')}
                </div>
                <div className='flex-1 flex items-center justify-center overflow-auto text-center'>
                  <div
                    className='text-[26px] font-[400] leading-[1.35] tracking-[-0.01em] text-[var(--pl-text)]'
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {card.backCard}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          disabled={index >= total - 1}
          variant='outline'
          size='icon'
          className='shrink-0 text-[var(--pl-text-muted)]'
        >
          <ChevronRight className='size-6' />
        </Button>
      </div>
    </div>
  );
}
