import { Award, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExamResult } from '../../types';

interface ResultsSummaryCardProps {
  result: ExamResult;
  correctCount: number;
  totalNonEssay: number;
}

export default function ResultsSummaryCard({
  result,
  correctCount,
  totalNonEssay,
}: ResultsSummaryCardProps) {
  const { t } = useTranslation();

  const pct = Math.max(0, Math.min(100, result.percentage));
  const pctLabel = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  const isPerfect = pct === 100;

  const heroTitle = result.passed
    ? isPerfect
      ? t('exam.results.heroTitlePerfect')
      : t('exam.results.heroTitleCongrats')
    : pct >= 50
      ? t('exam.results.heroTitleGoodEffort')
      : t('exam.results.heroTitleKeepPracticing');

  const heroSubtitle = result.passed
    ? isPerfect
      ? t('exam.results.heroSubtitlePerfect')
      : t('exam.results.heroSubtitlePassed', { pct: pctLabel })
    : t('exam.results.heroSubtitleFailed', { pct: pctLabel });

  const ringColor = result.passed ? 'var(--pl-accent)' : 'var(--pl-danger)';
  const ringGlow = result.passed
    ? 'var(--pl-accent-soft)'
    : 'color-mix(in oklch, var(--pl-danger) 45%, transparent)';

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return t('exam.results.timeFormatted', { mins, secs });
  };

  const passedScoreClass = result.passed
    ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
    : 'bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]';

  const passedBadgeClass = result.passed
    ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
    : 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]';

  return (
    <div className='space-y-4'>
      {/* Hero */}
      <div
        className='relative rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden p-10 text-center'
        style={{
          background: result.passed
            ? 'radial-gradient(circle at 50% 40%, var(--pl-accent-soft), transparent 60%)'
            : 'radial-gradient(circle at 50% 40%, var(--pl-danger-soft), transparent 60%)',
        }}
      >
        <div className='relative'>
          <h2 className='font-[family-name:var(--font-display)] italic text-5xl font-normal tracking-tight mb-3'>
            {heroTitle}
          </h2>
          <p className='text-muted-foreground mb-8 max-w-md mx-auto text-sm'>
            {heroSubtitle}
          </p>

          <div className='inline-flex relative items-center justify-center mb-8'>
            <svg width='220' height='220' viewBox='0 0 220 220'>
              <circle
                cx='110'
                cy='110'
                r={radius}
                fill='none'
                strokeWidth='8'
                stroke='var(--pl-border)'
                opacity='0.3'
              />
              <circle
                cx='110'
                cy='110'
                r={radius}
                fill='none'
                strokeWidth='8'
                strokeLinecap='round'
                stroke={ringColor}
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform='rotate(-90 110 110)'
                style={{
                  filter: `drop-shadow(0 0 8px ${ringGlow})`,
                  transition: 'stroke-dasharray 600ms ease',
                }}
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <span className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.2em] text-muted-foreground mb-1'>
                {t('exam.results.score').toUpperCase()}
              </span>
              <span className='font-[family-name:var(--font-display)] text-7xl font-medium leading-none mb-2 ms-3'>
                {pctLabel}
                <span className='text-2xl text-muted-foreground'>%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Score */}
        <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${passedScoreClass}`}
            >
              <Award className='w-4 h-4' />
            </div>
            <span
              className={`inline-flex items-center text-[11px] px-2 py-1 rounded-full border ${passedBadgeClass}`}
            >
              {result.earnedScore}/{result.totalScore} {t('exam.common.points')}
            </span>
          </div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
            {t('exam.results.score').toUpperCase()}
          </p>
          <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
            {pctLabel}
            <span className='text-base text-muted-foreground'>%</span>
          </p>
          <p className='text-xs text-muted-foreground'>
            {result.passed
              ? t('exam.results.scoreAboveThreshold')
              : t('exam.results.scoreNotPassed')}
          </p>
        </div>

        {/* Correct */}
        <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--pl-accent-soft)]'>
              <CheckCircle2 className='w-4 h-4 text-[var(--pl-accent)]' />
            </div>
            {totalNonEssay > 0 && (
              <span className='inline-flex items-center text-[11px] px-2 py-1 rounded-full border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'>
                {Math.round((correctCount / totalNonEssay) * 100)}%
              </span>
            )}
          </div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
            {t('exam.results.correctLabel').toUpperCase()}
          </p>
          <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1 text-[var(--pl-accent-strong)]'>
            {correctCount}{' '}
            <span className='text-base text-muted-foreground'>
              / {totalNonEssay}
            </span>
          </p>
          <p className='text-xs text-muted-foreground'>
            {totalNonEssay - correctCount === 0
              ? t('exam.results.allCorrect')
              : t('exam.results.toReview', {
                  count: totalNonEssay - correctCount,
                })}
          </p>
        </div>

        {/* Time */}
        <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-9 h-9 rounded-lg bg-[var(--pl-bg-sunken)] flex items-center justify-center'>
              <Clock className='w-4 h-4 text-muted-foreground' />
            </div>
          </div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
            {t('exam.results.timeTaken').toUpperCase()}
          </p>
          <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
            {formatTime(result.timeTaken)}
          </p>
          <p className='text-xs text-muted-foreground'>
            {t('exam.results.totalDuration')}
          </p>
        </div>
      </div>
    </div>
  );
}
