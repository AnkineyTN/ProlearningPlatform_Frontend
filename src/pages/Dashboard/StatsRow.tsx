import { Flame, Target, Timer, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';
import type { StreakData, ActivitySummary } from '@/services/types/activityLog.types';

type Props = {
  streak?: StreakData;
  summary?: ActivitySummary;
  setsCount: number;
};

export function StatsRow({ streak, summary, setsCount }: Props) {
  const weekMinutes = summary?.totalMinutes ?? 0;
  const weekHours = (weekMinutes / 60).toFixed(1);

  return (
    <div className='grid grid-cols-4 gap-[14px] mb-6'>
      <StatCard
        kicker='Current streak'
        value={streak ? String(streak.currentStreak) : '—'}
        unit='days'
        hint={streak?.studiedToday ? 'Studied today ✓' : 'Not studied yet'}
        trend={
          streak && streak.longestStreak > 0
            ? `Best ${streak.longestStreak}d`
            : undefined
        }
        trendDir='up'
        icon={<Flame size={20} />}
      />
      <StatCard
        kicker='Focus this week'
        value={weekHours}
        unit='h'
        hint={`${summary?.totalSessions ?? 0} sessions`}
        icon={<Timer size={18} />}
      />
      <StatCard
        kicker='Active sets'
        value={String(setsCount || 0)}
        unit='sets'
        hint='Tap to explore'
        icon={<Target size={18} />}
      />
      <StatCard
        kicker='Avg exam score'
        value={
          summary?.avgExamScore != null
            ? String(Math.round(summary.avgExamScore))
            : '—'
        }
        unit='%'
        hint='Last 7 days'
        icon={<TrendingUp size={18} />}
      />
    </div>
  );
}
