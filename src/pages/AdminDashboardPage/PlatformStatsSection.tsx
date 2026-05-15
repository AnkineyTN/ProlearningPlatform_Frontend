import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  ShieldOff,
  Crown,
  FileText,
  Layers,
  ClipboardList,
  Timer,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import { adminStatsAPI } from '@/services/endpoints/adminStats';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
];

const MetricCard = ({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  sub?: string;
}) => (
  <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-4 flex items-center gap-4'>
    <div
      className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
    >
      <Icon className='w-5 h-5' />
    </div>
    <div>
      <p className='text-2xl font-bold leading-tight'>
        {value.toLocaleString()}
      </p>
      <p className='text-xs text-muted-foreground'>{label}</p>
      {sub && (
        <p className='text-[10px] text-muted-foreground/60 mt-0.5'>{sub}</p>
      )}
    </div>
  </div>
);

const PlatformStatsSection = () => {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'platform-stats'],
    queryFn: async () => {
      const res = await adminStatsAPI.getPlatformStats();
      return res.data.data;
    },
  });

  const contentChartData = data
    ? [
        { name: t('adminDashboard.statNotes'), value: data.totalNotes },
        {
          name: t('adminDashboard.statFlashcards'),
          value: data.totalFlashcards,
        },
        { name: t('adminDashboard.statExams'), value: data.totalExams },
        {
          name: t('adminDashboard.statPomodoro'),
          value: data.totalPomodoroSessions,
        },
        {
          name: t('adminDashboard.statStudySessions'),
          value: data.totalStudySessions,
        },
      ]
    : [];

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center'>
          <BarChart3 className='w-4 h-4 text-indigo-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            OVERVIEW
          </p>
          <h2 className='font-semibold leading-tight'>
            {t('adminDashboard.platformStatsTitle')}
          </h2>
        </div>
      </div>

      {isLoading ? (
        <div className='p-16 text-center text-muted-foreground text-sm'>
          {t('onboarding.loading')}
        </div>
      ) : isError || !data ? (
        <div className='p-8 text-center text-destructive text-sm'>
          {t('adminDashboard.statsLoadError')}
        </div>
      ) : (
        <div className='space-y-4'>
          <div>
            <p className='text-[11px] tracking-[0.15em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-2'>
              USERS
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <MetricCard
                icon={Users}
                label={t('adminDashboard.statTotalUsers')}
                value={data.totalUsers}
                color='bg-indigo-500/10 text-indigo-500'
              />
              <MetricCard
                icon={Crown}
                label={t('adminDashboard.statProUsers')}
                value={data.proUsers}
                color='bg-purple-500/10 text-purple-500'
                sub={`${data.totalUsers > 0 ? Math.round((data.proUsers / data.totalUsers) * 100) : 0}%`}
              />
              <MetricCard
                icon={Users}
                label={t('adminDashboard.statFreeUsers')}
                value={data.freeUsers}
                color='bg-green-500/10 text-green-500'
              />
              <MetricCard
                icon={ShieldOff}
                label={t('adminDashboard.statBlockedUsers')}
                value={data.blockedUsers}
                color='bg-red-500/10 text-red-500'
              />
            </div>
          </div>

          <div>
            <p className='text-[11px] tracking-[0.15em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-2'>
              CONTENT
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              <MetricCard
                icon={FileText}
                label={t('adminDashboard.statNotes')}
                value={data.totalNotes}
                color='bg-blue-500/10 text-blue-500'
              />
              <MetricCard
                icon={Layers}
                label={t('adminDashboard.statFlashcards')}
                value={data.totalFlashcards}
                color='bg-cyan-500/10 text-cyan-500'
              />
              <MetricCard
                icon={ClipboardList}
                label={t('adminDashboard.statExams')}
                value={data.totalExams}
                color='bg-amber-500/10 text-amber-500'
              />
              <MetricCard
                icon={Timer}
                label={t('adminDashboard.statPomodoro')}
                value={data.totalPomodoroSessions}
                color='bg-orange-500/10 text-orange-500'
              />
              <MetricCard
                icon={BookOpen}
                label={t('adminDashboard.statStudySessions')}
                value={data.totalStudySessions}
                color='bg-teal-500/10 text-teal-500'
              />
            </div>
          </div>

          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-4'>
            <p className='text-xs font-medium mb-3'>
              {t('adminDashboard.contentDistribution')}
            </p>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart
                data={contentChartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                  vertical={false}
                />
                <XAxis
                  dataKey='name'
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                />
                <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                  {contentChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlatformStatsSection;
