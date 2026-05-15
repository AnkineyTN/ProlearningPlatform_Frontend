import { useTranslation } from 'react-i18next';
import { Users, GraduationCap, Crown, Radio } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PIE_COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
  '#ec4899',
  '#84cc16',
  '#64748b',
];

type AnalyticsSectionProps = {
  analytics:
    | {
        totalRegisteredUsers: number;
        education: { label: string; count: number; percent?: number }[];
        premium: { proCount: number; freeCount: number; proPercent: number };
        hearAppFrom: { label: string; count: number; percent?: number }[];
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
};

const AnalyticsSection = ({
  analytics,
  isLoading,
  isError,
}: AnalyticsSectionProps) => {
  const { t } = useTranslation();
  const na = t('adminOnboarding.notAvailable');

  const premiumBarData = analytics
    ? [
        { type: 'PRO', count: analytics.premium.proCount },
        { type: 'FREE', count: analytics.premium.freeCount },
      ]
    : [];

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center'>
          <Radio className='w-4 h-4 text-indigo-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            INSIGHTS
          </p>
          <h2 className='font-semibold leading-tight'>
            {t('adminOnboarding.analyticsTitle')}
          </h2>
        </div>
      </div>

      {isError && (
        <p className='text-sm text-destructive px-1'>
          {t('adminOnboarding.analyticsLoadError')}
        </p>
      )}
      {isLoading && (
        <p className='text-sm text-muted-foreground px-1'>
          {t('onboarding.loading')}
        </p>
      )}

      {analytics && (
        <div className='space-y-4'>
          {/* Summary stat */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center'>
                <Users className='w-4 h-4 text-indigo-500' />
              </div>
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              TOTAL REGISTERED
            </p>
            <p className='font-[family-name:var(--font-display)] text-5xl font-medium leading-none mb-1'>
              {analytics.totalRegisteredUsers.toLocaleString()}
            </p>
            <p className='text-xs text-muted-foreground'>
              {t('adminOnboarding.totalRegistered')}
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Education pie chart */}
            <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-6'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                  <GraduationCap className='w-4 h-4 text-amber-500' />
                </div>
                <div>
                  <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    BREAKDOWN
                  </p>
                  <p className='font-medium text-sm leading-tight'>
                    {t('adminOnboarding.analyticsEducation')}
                  </p>
                </div>
              </div>
              {analytics.education.length === 0 ? (
                <p className='text-sm text-muted-foreground'>{na}</p>
              ) : (
                <div className='h-[260px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={analytics.education}
                        dataKey='count'
                        nameKey='label'
                        cx='50%'
                        cy='50%'
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {analytics.education.map((_, i) => (
                          <Cell
                            key={`edu-${i}`}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--pl-bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          fontSize: 12,
                        }}
                        formatter={(value: number, _n, item) => {
                          const p = (item.payload as { percent?: number })
                            ?.percent;
                          const pct = p != null ? ` (${p.toFixed(1)}%)` : '';
                          return [
                            `${value}${pct}`,
                            t('adminOnboarding.chartCount'),
                          ];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Premium bar chart */}
            <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-6'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center'>
                  <Crown className='w-4 h-4 text-purple-500' />
                </div>
                <div>
                  <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    BREAKDOWN
                  </p>
                  <p className='font-medium text-sm leading-tight'>
                    {t('adminOnboarding.analyticsPremium')}
                  </p>
                </div>
              </div>
              <div className='h-[200px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={premiumBarData} barCategoryGap='40%'>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      opacity={0.15}
                      vertical={false}
                    />
                    <XAxis
                      dataKey='type'
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--pl-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [
                        v,
                        t('adminOnboarding.chartCount'),
                      ]}
                    />
                    <Bar dataKey='count' radius={[6, 6, 0, 0]}>
                      {premiumBarData.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={entry.type === 'PRO' ? '#a855f7' : '#64748b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className='text-xs text-muted-foreground mt-3'>
                <span className='inline-flex items-center gap-1 text-purple-500 font-medium'>
                  PRO {analytics.premium.proPercent.toFixed(1)}%
                </span>
                {' · '}PRO {analytics.premium.proCount} · FREE{' '}
                {analytics.premium.freeCount}
              </p>
            </div>
          </div>

          {/* Hear app from horizontal bar chart */}
          {analytics.hearAppFrom.length > 0 && (
            <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-6'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center'>
                  <Radio className='w-4 h-4 text-cyan-500' />
                </div>
                <div>
                  <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    ACQUISITION
                  </p>
                  <p className='font-medium text-sm leading-tight'>
                    {t('adminOnboarding.analyticsHearAppFrom')}
                  </p>
                </div>
              </div>
              <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    layout='vertical'
                    data={analytics.hearAppFrom}
                    margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      opacity={0.15}
                      horizontal={false}
                    />
                    <XAxis
                      type='number'
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey='label'
                      type='category'
                      width={120}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--pl-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        fontSize: 12,
                      }}
                      formatter={(value: number, _n, item) => {
                        const p = (item.payload as { percent?: number })
                          ?.percent;
                        const pct = p != null ? ` (${p.toFixed(1)}%)` : '';
                        return [
                          `${value}${pct}`,
                          t('adminOnboarding.chartCount'),
                        ];
                      }}
                    />
                    <Bar dataKey='count' fill='#6366f1' radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AnalyticsSection;
