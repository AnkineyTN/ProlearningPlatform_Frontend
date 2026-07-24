import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = parseGlobalSearchItems(searchPayload?.data);

  return (
    <div className='mb-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[12px] p-4 animate-in fade-in-0 slide-in-from-top-2 duration-200'>
      <div className='text-[13px] font-semibold text-[var(--pl-text)] mb-[10px]'>
        {t('dashboard.search.results')}
      </div>
      {loading && (
        <p className='text-[13px] text-[var(--pl-text-faint)]'>
          {t('dashboard.search.searching')}
        </p>
      )}
      {error && (
        <p className='text-[13px] text-[var(--pl-danger,#e55)]'>
          {t('dashboard.search.failed')}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <p className='text-[13px] text-[var(--pl-text-faint)]'>
          {t('dashboard.search.noMatches')}
        </p>
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
                    {t('dashboard.open')}
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
