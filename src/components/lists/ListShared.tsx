import { ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({ label }: { label: string }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[320px] gap-3 text-[var(--pl-text-faint)]'>
      <FileX size={48} className='opacity-40' />
      <span className='text-[14px]'>{label}</span>
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[14px] mb-6'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='h-[180px] rounded-[14px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] animate-pulse opacity-60'
        />
      ))}
    </div>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[14px] mb-6'>
      {children}
    </div>
  );
}

export function Pagination({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (total <= 1) return null;

  return (
    <div className='flex justify-center items-center gap-3 pb-8'>
      <button
        onClick={onPrev}
        disabled={current === 0}
        className={cn(
          'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
          current === 0
            ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
            : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
        )}
      >
        <ChevronLeft size={14} />
      </button>

      <span className='text-[13px] tabular-nums text-[var(--pl-text-muted)]'>
        {current + 1}{' '}
        <span className='text-[var(--pl-text-faint)]'>/ {total}</span>
      </span>

      <button
        onClick={onNext}
        disabled={current >= total - 1}
        className={cn(
          'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
          current >= total - 1
            ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
            : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
        )}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
