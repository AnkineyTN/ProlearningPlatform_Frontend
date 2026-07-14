import { ArrowRight, CalendarRange, Inbox, Info, Layers, Loader2, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useReviewBundles } from '@/hooks/useReviewBundles';
import { cn } from '@/lib/utils';

function formatPeriod(from: string, to: string, locale: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  return `${fmt(from)} – ${fmt(to)}`;
}

function StatCard({
  kicker,
  value,
  unit,
  hint,
  icon,
}: {
  kicker: string;
  value: string;
  unit: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-5 pt-[18px] pb-5 overflow-hidden'>
      <div className='flex justify-between items-start'>
        <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
          {kicker}
        </div>
        {icon && <span className='text-[var(--pl-accent)]'>{icon}</span>}
      </div>
      <div className='flex items-baseline gap-[6px] mt-1'>
        <span className='text-[40px] font-semibold tracking-[-0.03em] leading-none text-[var(--pl-text)]'>
          {value}
        </span>
        <span className='text-[13px] text-[var(--pl-text-muted)] tabular-nums'>
          {unit}
        </span>
      </div>
      {hint && (
        <div className='mt-[10px] text-[11px] text-[var(--pl-text-faint)]'>
          {hint}
        </div>
      )}
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden'>
      {children}
    </section>
  );
}

function PanelHead({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className='px-6 pt-[18px] pb-[14px] flex items-end justify-between gap-3'>
      <div>
        {kicker && (
          <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'>
            {kicker}
          </div>
        )}
        {title && (
          <div className='text-[18px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'>
            {title}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

export default function ReviewBundlesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useReviewBundles();

  const bundles = useMemo(() => data?.data ?? [], [data]);

  const totalBundles = bundles.length;
  const totalCards = bundles.reduce((acc, b) => acc + (b.cardCount ?? 0), 0);
  const uniqueSets = new Set(bundles.map((b) => b.setId)).size;

  const sortedBundles = useMemo(
    () =>
      [...bundles].sort(
        (a, b) =>
          new Date(b.periodTo).getTime() - new Date(a.periodTo).getTime(),
      ),
    [bundles],
  );

  return (
    <div className='min-h-screen pt-8 px-10'>
      {/* Page header */}
      <div className='flex justify-between items-start mb-7'>
        <div>
          <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('reviewBundles.breadcrumb')}
          </div>
          <h1
            className='text-[44px] tracking-tight leading-[1.05] m-0 mb-1.5 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('reviewBundles.title')}
          </h1>
        </div>
      </div>

      {/* Info banner */}
      <div
        className='mb-4 flex items-start gap-3 rounded-[14px] border px-4 py-3 text-[13px]'
        style={{
          background: 'var(--pl-accent-soft)',
          borderColor: 'var(--pl-accent-border)',
          color: 'var(--pl-accent-strong)',
        }}
      >
        <Info size={16} className='mt-0.5 shrink-0' />
        <span>
          {t('reviewBundles.infoBanner', {
            defaultValue:
              'Each bundle contains the cards you answered incorrectly in a week. Review, save flashcards, or create a test from them.',
          })}
        </span>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-3 gap-[14px] mb-4'>
        <StatCard
          kicker={t('reviewBundles.stats.bundles')}
          value={String(totalBundles)}
          unit={t('reviewBundles.stats.bundlesUnit')}
          hint={t('reviewBundles.stats.bundlesHint')}
          icon={<Inbox size={18} />}
        />
        <StatCard
          kicker={t('reviewBundles.stats.cards')}
          value={String(totalCards)}
          unit={t('reviewBundles.stats.cardsUnit')}
          hint={t('reviewBundles.stats.cardsHint')}
          icon={<Sparkles size={18} />}
        />
        <StatCard
          kicker={t('reviewBundles.stats.sets')}
          value={String(uniqueSets)}
          unit={t('reviewBundles.stats.setsUnit')}
          hint={t('reviewBundles.stats.setsHint')}
          icon={<Layers size={18} />}
        />
      </div>

      {/* Bundle list */}
      <Panel>
        <PanelHead
          kicker={t('reviewBundles.list.kicker')}
          title={t('reviewBundles.list.title')}
          right={
            <span className='tabular-nums text-[12px] text-[var(--pl-text-muted)]'>
              {totalBundles > 0
                ? t('reviewBundles.list.count', { count: totalBundles })
                : null}
            </span>
          }
        />

        {/* Loading */}
        {isLoading && (
          <div className='flex justify-center items-center min-h-[260px]'>
            <Loader2 className='w-6 h-6 animate-spin text-[var(--pl-text-faint)]' />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className='px-6 py-12 text-center text-[13px] text-[var(--pl-danger,oklch(0.65_0.2_25))]'>
            {t('reviewBundles.error')}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && bundles.length === 0 && (
          <div className='flex flex-col items-center justify-center min-h-[260px] text-center gap-3 px-6 pb-8'>
            <div className='w-14 h-14 rounded-full grid place-items-center bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)]'>
              <Inbox size={22} />
            </div>
            <p className='text-[14px] font-medium text-[var(--pl-text)] m-0'>
              {t('reviewBundles.empty.title')}
            </p>
            <p className='text-[12.5px] text-[var(--pl-text-faint)] m-0 max-w-md'>
              {t('reviewBundles.empty.hint')}
            </p>
          </div>
        )}

        {/* Bundle rows */}
        {!isLoading && !isError && bundles.length > 0 && (
          <div className='px-3 pt-1 pb-4'>
            {sortedBundles.map((bundle) => (
              <button
                key={bundle.id}
                onClick={() => navigate(`/review-bundles/${bundle.id}`)}
                className={cn(
                  'group w-full flex items-center gap-[14px] px-[14px] py-3 rounded-lg text-left',
                  'bg-transparent border-0 cursor-pointer transition-[background] duration-150',
                  'hover:bg-[var(--pl-bg-hover)]',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-[10px] shrink-0 grid place-items-center',
                    'bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)]',
                    'text-[var(--pl-accent-strong)]',
                  )}
                >
                  <Inbox size={16} />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='text-[14px] font-semibold text-[var(--pl-text)] overflow-hidden text-ellipsis whitespace-nowrap'>
                    {t('reviewBundles.item.title', { id: bundle.id })}
                  </div>
                  <div className='flex items-center gap-1.5 mt-0.5 text-[12px] text-[var(--pl-text-muted)]'>
                    <CalendarRange size={12} className='shrink-0' />
                    <span>
                      {formatPeriod(
                        bundle.periodFrom,
                        bundle.periodTo,
                        i18n.language,
                      )}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    'shrink-0 inline-flex items-center gap-1 tabular-nums',
                    'text-[11.5px] font-semibold uppercase tracking-[0.08em]',
                    'px-2.5 py-1 rounded-full',
                    'bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)]',
                    'text-[var(--pl-accent-strong)]',
                  )}
                >
                  {t('reviewBundles.item.cardCount', {
                    count: bundle.cardCount,
                  })}
                </span>

                <ArrowRight
                  size={14}
                  className='text-[var(--pl-text-faint)] shrink-0 transition-transform duration-150 group-hover:translate-x-0.5'
                />
              </button>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
