import type { ReviewBundleCard } from '@/services/types/review-bundle.types';

export function CardListViewer({ cards }: { cards: ReviewBundleCard[] }) {
  return (
    <div className='mb-8 space-y-3'>
      {cards.map((c, i) => (
        <div
          key={c.id ?? i}
          className='bg-[var(--pl-bg-elev)] border border-border rounded-xl'
        >
          <div className='p-4 flex items-start gap-4'>
            <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground/60 mt-0.5 w-5 flex-shrink-0 text-right'>
              {i + 1}
            </span>
            <div className='flex-1 min-w-0 max-w-45'>
              <p className='font-medium text-sm leading-snug'>{c.frontCard}</p>
            </div>
            <div className='w-px bg-border self-stretch mx-2' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm text-muted-foreground leading-snug'>
                {c.backCard}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
