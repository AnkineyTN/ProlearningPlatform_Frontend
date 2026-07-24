import { useTranslation } from 'react-i18next';
import { Flame, Target, Timer, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import type {
  StreakData,
  ActivitySummary,
} from '@/services/types/activityLog.types';

type Props = {
  streak?: StreakData;
  summary?: ActivitySummary;
  setsCount: number;
};

export function StatsRow({ streak, summary, setsCount }: Props) {
  const { t } = useTranslation();
  const weekMinutes = summary?.totalMinutes ?? 0;
  const weekHours = (weekMinutes / 60).toFixed(1);

  return (
    <div className='grid grid-cols-4 gap-6 mb-6'>
      <StatCard
        kicker={t('dashboard.stats.streak.kicker')}
        value={streak ? String(streak.currentStreak) : '—'}
        unit={t('dashboard.stats.streak.unit')}
        hint={
          streak?.studiedToday
            ? t('dashboard.stats.streak.studiedToday')
            : t('dashboard.stats.streak.notStudiedYet')
        }
        trend={
          streak && streak.longestStreak > 0
            ? t('dashboard.stats.streak.best', { count: streak.longestStreak })
            : undefined
        }
        trendDir='up'
        icon={<Flame size={20} />}
      />
      <StatCard
        kicker={t('dashboard.stats.focus.kicker')}
        value={weekHours}
        unit={t('dashboard.stats.focus.unit')}
        hint={t('dashboard.stats.focus.sessions', {
          count: summary?.totalSessions ?? 0,
        })}
        icon={<Timer size={18} />}
      />
      <StatCard
        kicker={t('dashboard.stats.activeSets.kicker')}
        value={String(setsCount || 0)}
        unit={t('dashboard.stats.activeSets.unit')}
        hint={t('dashboard.stats.activeSets.hint')}
        icon={<Target size={18} />}
      />
      <StatCard
        kicker={t('dashboard.stats.examScore.kicker')}
        value={
          summary?.avgExamScore != null
            ? String(Math.round(summary.avgExamScore))
            : '—'
        }
        unit='%'
        hint={t('dashboard.stats.examScore.hint')}
        icon={<TrendingUp size={18} />}
      />
    </div>
  );
}
