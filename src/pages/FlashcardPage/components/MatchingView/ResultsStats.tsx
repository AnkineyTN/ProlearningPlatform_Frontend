import { Clock, Layers, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import type { GameHistoryItem } from '@/services/types/flashcard.types';

interface TimeBadge {
  text: string;
  kind: 'down' | 'up';
}

interface MatchingResultsStatsProps {
  totalTimeMs: number;
  totalPairs: number;
  wrongPicks: number;
  accuracy: number;
  isPerfect: boolean;
  matchesPerMin: number;
  flashcardTitle?: string;
  lastRun: GameHistoryItem | null;
  timeBadge: TimeBadge | null;
  formatTime: (ms: number) => string;
  formatSeconds: (seconds: number) => string;
}

const MatchingResultsStats = ({
  totalTimeMs,
  totalPairs,
  wrongPicks,
  accuracy,
  isPerfect,
  matchesPerMin,
  flashcardTitle,
  lastRun,
  timeBadge,
  formatTime,
  formatSeconds,
}: MatchingResultsStatsProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      {/* TIME */}
      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-9 h-9 rounded-lg bg-[var(--pl-accent-soft)] flex items-center justify-center'>
            <Clock className='w-4 h-4 text-[var(--pl-accent)]' />
          </div>
          {timeBadge && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
                timeBadge.kind === 'down'
                  ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
                  : 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'
              }`}
            >
              {timeBadge.kind === 'down' ? (
                <TrendingDown className='w-3 h-3' />
              ) : (
                <TrendingUp className='w-3 h-3' />
              )}
              {timeBadge.text}
            </span>
          )}
        </div>
        <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
          TIME
        </p>
        <p className='font-[family-name:var(--font-mono-pl)] text-3xl font-medium mb-1'>
          {formatTime(totalTimeMs)}
        </p>
        <p className='text-xs text-muted-foreground'>
          {lastRun
            ? `vs last run · ${formatSeconds(lastRun.durationSeconds)}`
            : 'first run'}
        </p>
      </div>

      {/* CARDS REVIEWED */}
      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-9 h-9 rounded-lg bg-[var(--pl-bg-sunken)] flex items-center justify-center'>
            <Layers className='w-4 h-4 text-muted-foreground' />
          </div>
        </div>
        <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
          CARDS REVIEWED
        </p>
        <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
          {totalPairs}{' '}
          <span className='text-base text-muted-foreground'>cards</span>
        </p>
        <p className='text-xs text-muted-foreground truncate'>
          {flashcardTitle ? `${flashcardTitle} · ` : ''}
          {isPerfect
            ? 'all matched'
            : `${wrongPicks} mistake${wrongPicks === 1 ? '' : 's'}`}
        </p>
      </div>

      {/* MATCHES / MIN */}
      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
        <div className='flex items-center justify-between mb-4'>
          <div className='w-9 h-9 rounded-lg bg-[var(--pl-bg-sunken)] flex items-center justify-center'>
            <Zap className='w-4 h-4 text-muted-foreground' />
          </div>
          <span
            className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
              isPerfect
                ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
                : 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'
            }`}
          >
            {isPerfect ? (
              <TrendingDown className='w-3 h-3' />
            ) : (
              <TrendingUp className='w-3 h-3' />
            )}
            {accuracy}% acc
          </span>
        </div>
        <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
          MATCHES / MIN
        </p>
        <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
          {matchesPerMin}
        </p>
        <p className='text-xs text-muted-foreground'>
          {wrongPicks > 0
            ? `${wrongPicks} wrong pick${wrongPicks === 1 ? '' : 's'}`
            : 'flawless run'}
        </p>
      </div>
    </div>
  );
};

export default MatchingResultsStats;
