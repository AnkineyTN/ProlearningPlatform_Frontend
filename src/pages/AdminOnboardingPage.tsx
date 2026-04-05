import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  extractSubmissionsList,
  onboardingAPI,
} from '@/services/endpoints/onboarding';
import type { OnboardingSubmissionRecord } from '@/services/types/onboarding.types';

const PAGE_SIZE = 20;

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

const AdminOnboardingPage = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const submissionsQuery = useQuery({
    queryKey: ['admin', 'onboarding', 'submissions', page],
    queryFn: async () => {
      const res = await onboardingAPI.getAdminSubmissions({
        page,
        size: PAGE_SIZE,
        sort: 'updatedAt,DESC',
      });
      return extractSubmissionsList(res.data.data);
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ['admin', 'onboarding', 'analytics'],
    queryFn: async () => {
      const res = await onboardingAPI.getAdminAnalytics();
      return res.data.data;
    },
  });

  const rows = submissionsQuery.data ?? [];
  const analytics = analyticsQuery.data;

  const refresh = () => {
    void submissionsQuery.refetch();
    void analyticsQuery.refetch();
  };

  const formatDate = (iso: string) => {
    try {
      const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
      return new Date(iso).toLocaleString(locale);
    } catch {
      return iso;
    }
  };

  const na = t('adminOnboarding.notAvailable');

  const expandedRow =
    expandedId != null ? rows.find((r) => r.id === expandedId) : undefined;

  const submissionSummary = (row: OnboardingSubmissionRecord) => {
    const d = row.data;
    if (!d) return na;
    return [
      d.language,
      d.education,
      d.hearAppFrom,
      d.accountType === 'PRO'
        ? t('adminOnboarding.planPremium')
        : t('adminOnboarding.planFree'),
    ].join(' · ');
  };

  const premiumBarData = analytics
    ? [
        { type: 'PRO', count: analytics.premium.proCount },
        { type: 'FREE', count: analytics.premium.freeCount },
      ]
    : [];

  return (
    <div className='min-h-screen bg-background text-foreground p-6 md:p-10'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <Link
              to='/dashboard'
              className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2'
            >
              <ArrowLeft className='w-4 h-4' />
              {t('adminOnboarding.backToDashboard')}
            </Link>
            <h1 className='text-2xl font-bold tracking-tight'>
              {t('adminOnboarding.title')}
            </h1>
            <p className='text-muted-foreground text-sm mt-1'>
              {t('adminOnboarding.description')}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={refresh}
            disabled={submissionsQuery.isFetching || analyticsQuery.isFetching}
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            {t('adminOnboarding.refresh')}
          </Button>
        </div>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            {t('adminOnboarding.analyticsTitle')}
          </h2>
          {analyticsQuery.isError && (
            <p className='text-sm text-destructive'>
              {t('adminOnboarding.analyticsLoadError')}
            </p>
          )}
          {analyticsQuery.isLoading && (
            <p className='text-sm text-muted-foreground'>
              {t('onboarding.loading')}
            </p>
          )}
          {analytics && (
            <div className='flex flex-col gap-4'>
              <Card className='p-6 border border-ring'>
                <p className='text-sm text-muted-foreground mb-1'>
                  {t('adminOnboarding.totalRegistered')}
                </p>
                <p className='text-3xl font-bold tabular-nums'>
                  {analytics.totalRegisteredUsers}
                </p>
              </Card>

              <div className='flex gap-4 w-full'>
                <Card className='p-6 border border-ring w-full'>
                  <h3 className='text-sm font-medium mb-4'>
                    {t('adminOnboarding.analyticsEducation')}
                  </h3>
                  {analytics.education.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>{na}</p>
                  ) : (
                    <div className='h-[280px] w-full min-w-0'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={analytics.education}
                            dataKey='count'
                            nameKey='label'
                            cx='50%'
                            cy='50%'
                            outerRadius={100}
                            paddingAngle={1}
                          >
                            {analytics.education.map((_, i) => (
                              <Cell
                                key={`edu-${i}`}
                                fill={PIE_COLORS[i % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, _n, item) => {
                              const p = (item.payload as { percent?: number })
                                ?.percent;
                              const pct =
                                p != null ? ` (${p.toFixed(1)}%)` : '';
                              return [
                                `${value}${pct}`,
                                t('adminOnboarding.chartCount'),
                              ];
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                <Card className='p-6 border border-ring w-full'>
                  <h3 className='text-sm font-medium mb-4'>
                    {t('adminOnboarding.analyticsPremium')}
                  </h3>
                  <div className='h-[220px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart data={premiumBarData}>
                        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                        <XAxis dataKey='type' tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          formatter={(v: number) => [
                            v,
                            t('adminOnboarding.chartCount'),
                          ]}
                        />
                        <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                          {premiumBarData.map((entry) => (
                            <Cell
                              key={entry.type}
                              fill={
                                entry.type === 'PRO' ? '#a855f7' : '#64748b'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    PRO {analytics.premium.proPercent.toFixed(1)}% ·{' '}
                    {t('adminOnboarding.chartCount')}: PRO{' '}
                    {analytics.premium.proCount}, FREE{' '}
                    {analytics.premium.freeCount}
                  </p>
                </Card>
              </div>

              <Card className='p-6 border border-ring'>
                <h3 className='text-sm font-medium mb-4'>
                  {t('adminOnboarding.analyticsHearAppFrom')}
                </h3>
                {analytics.hearAppFrom.length === 0 ? (
                  <p className='text-sm text-muted-foreground'>{na}</p>
                ) : (
                  <div className='h-[320px] w-full min-w-0'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        layout='vertical'
                        data={analytics.hearAppFrom}
                        margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
                        <XAxis type='number' tick={{ fontSize: 11 }} />
                        <YAxis
                          dataKey='label'
                          type='category'
                          width={120}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
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
                        <Bar
                          dataKey='count'
                          fill='#6366f1'
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>
          )}
        </section>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>
            {t('adminOnboarding.submissionsTitle')}
          </h2>
          {submissionsQuery.isError && (
            <p className='text-sm text-destructive'>
              {t('adminOnboarding.loadError')}
            </p>
          )}
          <Card className='p-0 overflow-hidden border border-ring'>
            {submissionsQuery.isLoading ? (
              <div className='p-12 text-center text-muted-foreground text-sm'>
                {t('onboarding.loading')}
              </div>
            ) : rows.length === 0 ? (
              <div className='p-12 text-center text-muted-foreground text-sm'>
                {t('adminOnboarding.empty')}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10' />
                    <TableHead>{t('adminOnboarding.colId')}</TableHead>
                    <TableHead>{t('adminOnboarding.colTime')}</TableHead>
                    <TableHead>{t('adminOnboarding.colUserId')}</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      {t('adminOnboarding.colSummary')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const open = expandedId === row.id;
                    return (
                      <TableRow key={row.id} className='align-top'>
                        <TableCell className='py-3'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => setExpandedId(open ? null : row.id)}
                            aria-expanded={open}
                            aria-label={
                              open
                                ? t('adminOnboarding.collapseRow')
                                : t('adminOnboarding.expandRow')
                            }
                          >
                            {open ? (
                              <ChevronDown className='w-4 h-4' />
                            ) : (
                              <ChevronRight className='w-4 h-4' />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className='py-3 font-mono text-sm'>
                          {row.id}
                        </TableCell>
                        <TableCell className='py-3 whitespace-nowrap text-xs md:text-sm'>
                          {formatDate(row.submittedAt)}
                        </TableCell>
                        <TableCell className='py-3 font-mono text-sm'>
                          {row.userId}
                        </TableCell>
                        <TableCell className='hidden md:table-cell py-3 text-muted-foreground text-sm max-w-[320px] truncate'>
                          {submissionSummary(row)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 0 || submissionsQuery.isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t('adminOnboarding.prevPage')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={rows.length < PAGE_SIZE || submissionsQuery.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('adminOnboarding.nextPage')}
            </Button>
          </div>
        </section>

        {expandedRow != null && (
          <Card className='p-6 border border-ring space-y-4'>
            <h2 className='font-semibold'>
              {t('adminOnboarding.detailJsonTitle')}
            </h2>
            <pre className='text-xs bg-card-secondary rounded-lg p-4 overflow-x-auto border border-ring'>
              {JSON.stringify(expandedRow, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminOnboardingPage;
