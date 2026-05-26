import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminStatsAPI } from '@/services/endpoints/adminStats';
import { onboardingAPI } from '@/services/endpoints/onboarding';
import AdminTopBar from '../../components/TopBar';

const fmtNum = (n: number) => n.toLocaleString('en-US');
const fmtShort = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
};

const KpiTile = ({
  kicker,
  value,
  unit,
  hint,
  accent,
  trend,
  trendDir,
}: {
  kicker: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: string;
  trend?: string;
  trendDir?: 'up' | 'down';
}) => (
  <div className='relative overflow-hidden rounded-[14px] border border-border bg-[var(--pl-bg-elev)] p-[18px_20px]'>
    {accent && (
      <span
        className='absolute top-0 left-0 h-[2px] w-9'
        style={{ background: accent }}
      />
    )}
    <div className='text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground'>
      {kicker}
    </div>
    <div className='flex items-baseline gap-1.5 mt-3.5'>
      <span className='font-[family-name:var(--font-display)] text-[38px] font-normal tracking-tight leading-none'>
        {value}
      </span>
      {unit && (
        <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground'>
          {unit}
        </span>
      )}
    </div>
    <div className='mt-3 flex justify-between items-center text-[11px] text-muted-foreground'>
      <span>{hint}</span>
      {trend && (
        <span
          className='font-[family-name:var(--font-mono-pl)]'
          style={{
            color:
              trendDir === 'up' ? 'oklch(0.72 0.15 155)' : 'oklch(0.65 0.2 25)',
          }}
        >
          {trendDir === 'up' ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  </div>
);

const SectionHead = ({
  kicker,
  title,
  right,
  className = '',
}: {
  kicker: string;
  title: string;
  right?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-baseline justify-between pb-1 border-b border-border ${className}`}
  >
    <div className='flex items-baseline gap-3.5'>
      <span className='text-[10.5px] tracking-[0.18em] uppercase text-muted-foreground'>
        {kicker}
      </span>
      <span className='font-[family-name:var(--font-display)] text-[22px] font-medium tracking-tight'>
        {title}
      </span>
    </div>
    {right}
  </div>
);

const Panel = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`bg-[var(--pl-bg-elev)] border border-border rounded-[14px] overflow-hidden ${className}`}
  >
    {children}
  </section>
);

const PanelHead = ({
  kicker,
  title,
  sub,
  right,
}: {
  kicker?: string;
  title?: string;
  sub?: string;
  right?: React.ReactNode;
}) => (
  <div className='px-6 pt-[18px] pb-3.5 flex items-end justify-between gap-3 border-b border-border'>
    <div>
      {kicker && (
        <div className='text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1'>
          {kicker}
        </div>
      )}
      {title && (
        <div className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight'>
          {title}
        </div>
      )}
      {sub && (
        <div className='text-[12.5px] text-muted-foreground mt-1'>{sub}</div>
      )}
    </div>
    {right}
  </div>
);

const BarChart = ({
  data,
  h = 200,
}: {
  data: { label: string; count: number }[];
  h?: number;
}) => {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className='px-6 pt-2 pb-[22px]'>
      <div
        className='grid gap-[18px] items-end'
        style={{
          gridTemplateColumns: `repeat(${data.length}, 1fr)`,
          height: h,
        }}
      >
        {data.map((d, i) => {
          const pct = max > 0 ? d.count / max : 0;
          return (
            <div
              key={i}
              className='flex flex-col items-center gap-2 h-full justify-end'
            >
              <div className='font-[family-name:var(--font-mono-pl)] text-[11px] text-muted-foreground'>
                {fmtShort(d.count)}
              </div>
              <div
                className='w-full max-w-14 rounded-t transition-[height] duration-400 ease-out'
                style={{
                  height: `${pct * 100}%`,
                  background:
                    'linear-gradient(180deg, var(--pl-accent), var(--pl-accent-soft))',
                  borderTop: '2px solid var(--pl-accent)',
                }}
              />
            </div>
          );
        })}
      </div>
      <div
        className='grid gap-[18px] mt-2.5 pt-2.5 border-t border-border'
        style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            className='text-[11.5px] text-muted-foreground text-center'
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const HBars = ({
  data,
}: {
  data: { label: string; count: number; percent?: number }[];
}) => {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className='px-6 pt-1 pb-[22px] flex flex-col gap-3'>
      {data.map((d, i) => (
        <div key={i}>
          <div className='flex justify-between items-baseline mb-1'>
            <span className='text-[12.5px]'>{d.label}</span>
            <span className='font-[family-name:var(--font-mono-pl)] text-[11px] text-muted-foreground'>
              {fmtNum(d.count)}
              {d.percent != null && (
                <span className='text-muted-foreground/60'>
                  {' '}
                  · {d.percent.toFixed(1)}%
                </span>
              )}
            </span>
          </div>
          <div className='h-1.5 bg-[var(--pl-bg-hover)] rounded-full overflow-hidden'>
            <div
              className='h-full bg-[var(--pl-accent)] rounded-full transition-[width] duration-500 ease-out'
              style={{ width: `${max > 0 ? (d.count / max) * 100 : 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const OverviewSection = () => {
  const { t } = useTranslation();

  const statsQuery = useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: async () => {
      const res = await adminStatsAPI.getPlatformStats();
      return res.data.data;
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ['admin', 'onboarding', 'analytics'],
    queryFn: async () => {
      const res = await onboardingAPI.getAdminAnalytics();
      return res.data.data;
    },
  });

  const stats = statsQuery.data;
  const analytics = analyticsQuery.data;
  const isLoading = statsQuery.isLoading || analyticsQuery.isLoading;

  return (
    <div className='flex-1 min-w-0'>
      <AdminTopBar
        kicker={t('adminDashboard.overviewKicker')}
        title={t('adminDashboard.overviewTitle')}
        subtitle={t('adminDashboard.overviewSubtitle')}
      />

      <div className='p-6 md:px-10 md:py-7 flex flex-col gap-[22px]'>
        {isLoading ? (
          <div className='py-20 text-center text-muted-foreground text-sm'>
            {t('onboarding.loading')}
          </div>
        ) : (
          <>
            {/* User base KPIs */}
            {stats && (
              <>
                <SectionHead
                  kicker={t('adminDashboard.sectionPeople')}
                  title={t('adminDashboard.sectionUserBase')}
                />
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
                  <KpiTile
                    kicker={t('adminDashboard.statTotalUsers')}
                    value={fmtNum(stats.totalUsers)}
                    hint={t('adminDashboard.filterAll')}
                    accent='var(--pl-accent)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statProUsers')}
                    value={fmtNum(stats.proUsers)}
                    unit={`${stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                    hint='Paying'
                    accent='oklch(0.72 0.17 55)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statFreeUsers')}
                    value={fmtNum(stats.freeUsers)}
                    unit={`${stats.totalUsers > 0 ? ((stats.freeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`}
                    hint='Free tier'
                    accent='oklch(0.7 0.05 240)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statBlockedUsers')}
                    value={fmtNum(stats.blockedUsers)}
                    hint={t('adminDashboard.blocked')}
                    accent='oklch(0.65 0.2 25)'
                  />
                </div>

                {/* Content KPIs */}
                <SectionHead
                  kicker={t('adminDashboard.sectionProduction')}
                  title={t('adminDashboard.sectionContentSessions')}
                  className='mt-3.5'
                />
                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                  <KpiTile
                    kicker={t('adminDashboard.statNotes')}
                    value={fmtShort(stats.totalNotes)}
                    hint={`${fmtNum(stats.totalNotes)} total`}
                    accent='oklch(0.7 0.1 200)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statFlashcards')}
                    value={fmtShort(stats.totalFlashcards)}
                    hint={`${fmtNum(stats.totalFlashcards)} total`}
                    accent='oklch(0.72 0.13 155)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statExams')}
                    value={fmtShort(stats.totalExams)}
                    hint={`${fmtNum(stats.totalExams)} total`}
                    accent='oklch(0.7 0.13 25)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statPomodoro')}
                    value={fmtShort(stats.totalPomodoroSessions)}
                    hint={`${fmtNum(stats.totalPomodoroSessions)} total`}
                    accent='oklch(0.75 0.16 55)'
                  />
                  <KpiTile
                    kicker={t('adminDashboard.statStudySessions')}
                    value={fmtShort(stats.totalStudySessions)}
                    hint={`${fmtNum(stats.totalStudySessions)} total`}
                    accent='oklch(0.7 0.12 285)'
                  />
                </div>
              </>
            )}

            {/* Charts */}
            {analytics && (
              <div className='grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 mt-2'>
                <Panel>
                  <PanelHead
                    kicker={t('adminOnboarding.analyticsEducation')}
                    title={t('adminOnboarding.analyticsEducation')}
                    sub='Self-declared at onboarding.'
                  />
                  <BarChart data={analytics.education ?? []} />
                </Panel>

                <Panel>
                  <PanelHead
                    kicker='Acquisition'
                    title={t('adminOnboarding.analyticsHearAppFrom')}
                    sub='Where new sign-ups came from.'
                  />
                  <HBars data={analytics.hearAppFrom ?? []} />
                </Panel>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OverviewSection;
