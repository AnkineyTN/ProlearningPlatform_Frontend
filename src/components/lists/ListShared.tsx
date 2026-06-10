import { ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

function buildPageWindows(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

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
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;

  const pages = buildPageWindows(current, total);

  return (
    <div className='flex justify-center items-center gap-1 pb-8'>
      <button
        onClick={() => onChange(current - 1)}
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

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className='w-8 h-8 grid place-items-center text-[12px] text-[var(--pl-text-faint)]'
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              'w-8 h-8 rounded-lg grid place-items-center text-[12.5px] tabular-nums border transition-[background,color] duration-150 cursor-pointer',
              p === current
                ? 'bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] font-medium'
                : 'bg-[var(--pl-bg-elev)] border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]',
            )}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        onClick={() => onChange(current + 1)}
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
