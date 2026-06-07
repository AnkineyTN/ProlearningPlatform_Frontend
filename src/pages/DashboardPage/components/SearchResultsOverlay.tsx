import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  parseGlobalSearchItems,
  searchResultHref,
  searchResultTitle,
} from './searchHelpers';

type Props = {
  searchPayload: { data?: unknown } | undefined;
  loading: boolean;
  error: boolean;
};

export function SearchResultsOverlay({ searchPayload, loading, error }: Props) {
  const navigate = useNavigate();
  const items = parseGlobalSearchItems(searchPayload?.data);

  return (
    <div className='mb-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[12px] p-4'>
      <div className='text-[13px] font-semibold text-[var(--pl-text)] mb-[10px]'>
        Search results
      </div>
      {loading && (
        <p className='text-[13px] text-[var(--pl-text-faint)]'>Searching…</p>
      )}
      {error && (
        <p className='text-[13px] text-[var(--pl-danger,#e55)]'>
          Search failed. Try again.
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className='text-[13px] text-[var(--pl-text-faint)]'>No matches.</p>
      )}
      {!loading && items.length > 0 && (
        <ul className='list-none m-0 p-0'>
          {items.map((item, idx) => {
            const href = searchResultHref(item);
            const title = searchResultTitle(item);
            return (
              <li
                key={`${title}-${idx}`}
                className={cn(
                  'flex items-center justify-between py-2 text-[13px]',
                  idx > 0 && 'border-t border-t-[var(--pl-border)]',
                )}
              >
                <span className='text-[var(--pl-text)] font-medium'>
                  {title}
                </span>
                {href && (
                  <button
                    onClick={() => navigate(href)}
                    className='flex items-center gap-[5px] text-[12px] text-[var(--pl-accent-strong)] bg-transparent border-0 cursor-pointer'
                  >
                    <ExternalLink size={12} />
                    Open
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
