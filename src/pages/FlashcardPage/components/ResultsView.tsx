import { useState } from 'react';
import {
  Brain,
  ClipboardList,
  Loader2,
  RotateCcw,
  BookOpen,
  Home,
  Trophy,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import KnowledgeAnalysisDialog from '@/components/analysis/KnowledgeAnalysisDialog';
import AnalysisHistoryDialog from '@/components/analysis/AnalysisHistoryDialog';
import { useTranslation } from 'react-i18next';

import type { ReviewLog } from '@/services/types/flashcard-session.types';
import type { Card as Flashcard } from '@/services/types/flashcard.types';

type ResultsViewProps = {
  setId?: number;
  flashcardId?: number;
  studiedCards: number;
  totalCards: number;
  flashcards?: Flashcard[];
  onHome: () => void;
  onContinue: () => void;
  onReset: () => void;
  onPracticeWithExam?: () => void;
  onMatching?: () => void;
  isPracticeWithExamLoading?: boolean;
  /** When false, mirror mobile and report all cards as known. */
  isProgressTrackingEnabled?: boolean;
  sessionResult?: {
    sessionId?: number;
    correctCount?: number;
    incorrectCount?: number;
    finishedAt?: string;
    logs?: ReviewLog[];
  };
};

const ResultsView = ({
  setId,
  flashcardId,
  studiedCards,
  totalCards,
  flashcards = [],
  onHome,
  onContinue,
  onReset,
  onPracticeWithExam,
  onMatching,
  isPracticeWithExamLoading,
  isProgressTrackingEnabled = true,
  sessionResult,
}: ResultsViewProps) => {
  const { t } = useTranslation();
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showAnalysisHistory, setShowAnalysisHistory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const sessionId = sessionResult?.sessionId;
  const canAnalyze =
    typeof setId === 'number' &&
    typeof flashcardId === 'number' &&
    typeof sessionId === 'number';
  const canViewHistory =
    typeof setId === 'number' && typeof flashcardId === 'number';

  const rawCorrect = sessionResult?.correctCount ?? 0;
  const rawIncorrect = sessionResult?.incorrectCount ?? 0;

  // Spec: when progress tracking is disabled, report knownCards = totalCards
  const knownCards = isProgressTrackingEnabled ? rawCorrect : totalCards;
  const learningCards = isProgressTrackingEnabled ? rawIncorrect : 0;
  const remainingCards = isProgressTrackingEnabled
    ? Math.max(0, totalCards - knownCards - learningCards)
    : 0;

  const rawPct = totalCards > 0 ? (knownCards / totalCards) * 100 : 0;
  const pct = Number.isFinite(rawPct) ? Math.max(0, Math.min(100, rawPct)) : 0;
  const isPerfect = pct === 100;

  const finishedAt = sessionResult?.finishedAt
    ? new Date(sessionResult.finishedAt).toLocaleString()
    : undefined;
  const logs = sessionResult?.logs ?? [];

  const findCardTitle = (cardId: number) => {
    const found = flashcards.find((c) => c.id === cardId);
    return found ? found.frontCard : String(cardId);
  };

  const heroTitle = isPerfect
    ? t('flashcard.results.heroTitlePerfect')
    : pct >= 80
      ? t('flashcard.results.heroTitleGreat')
      : t('flashcard.results.heroTitleKeepGoing');

  const heroSubtitle = isPerfect
    ? t('flashcard.results.heroSubtitlePerfect', { count: knownCards })
    : isProgressTrackingEnabled
      ? t('flashcard.results.heroSubtitleProgress', {
          known: knownCards,
          total: totalCards,
        })
      : t('flashcard.results.heroSubtitleNoTracking', {
          studied: studiedCards,
          total: totalCards,
        });

  // SVG ring geometry
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className='max-w-4xl mx-auto px-6 py-10 space-y-5'>
      {/* ── Hero ── */}
      <div className='relative rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden p-10 text-center'>
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background: isPerfect
              ? 'radial-gradient(circle at 50% 40%, rgba(34,197,94,0.14), transparent 60%)'
              : pct >= 80
                ? 'radial-gradient(circle at 50% 40%, rgba(59,130,246,0.12), transparent 60%)'
                : 'radial-gradient(circle at 50% 40%, rgba(239,68,68,0.10), transparent 60%)',
          }}
        />
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
                stroke={
                  isPerfect ? '#22c55e' : pct >= 80 ? '#3b82f6' : '#ef4444'
                }
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform='rotate(-90 110 110)'
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    isPerfect
                      ? 'rgba(34,197,94,0.55)'
                      : pct >= 80
                        ? 'rgba(59,130,246,0.45)'
                        : 'rgba(239,68,68,0.45)'
                  })`,
                  transition: 'stroke-dasharray 600ms ease',
                }}
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <span className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.2em] text-muted-foreground mb-1'>
                {t('flashcard.results.knownLabel')}
              </span>
              <span className='font-[family-name:var(--font-display)] text-6xl font-medium leading-none'>
                {Math.round(pct)}
                <span className='text-2xl text-muted-foreground'>%</span>
              </span>
              <div className='flex items-center gap-1.5 mt-2'>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPerfect
                      ? 'bg-[var(--pl-accent)]'
                      : pct >= 80
                        ? 'bg-[var(--pl-success)]'
                        : 'bg-[var(--pl-danger)]'
                  }`}
                />
                <span className='text-xs text-muted-foreground'>
                  {knownCards} / {totalCards} {t('flashcard.results.cardsUnit')}
                </span>
              </div>
            </div>
          </div>

          <div className='flex gap-3 justify-center flex-wrap'>
            <Button onClick={onContinue} className='gap-2'>
              <RotateCcw className='w-4 h-4' />
              {t('flashcard.results.continueStudying')}
            </Button>
            {onPracticeWithExam && (
              <Button
                onClick={onPracticeWithExam}
                disabled={isPracticeWithExamLoading}
                className='gap-2'
              >
                {isPracticeWithExamLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <BookOpen className='w-4 h-4' />
                )}
                {t('flashcard.results.practiceWithTest')}
              </Button>
            )}
            {onMatching && (
              <Button onClick={onMatching} className='gap-2'>
                <Trophy className='w-4 h-4' />
                {t('flashcard.results.matchingMode')}
              </Button>
            )}
            {canAnalyze && (
              <Button onClick={() => setShowAnalysis(true)} className='gap-2'>
                <Brain className='w-4 h-4' />
                {t('flashcard.results.analyzeKnowledge')}
              </Button>
            )}
            {canViewHistory && (
              <Button
                variant='outline'
                onClick={() => setShowAnalysisHistory(true)}
                className='gap-2 text-muted-foreground'
              >
                <ClipboardList className='w-4 h-4' />
                {t('analysis.history.action', {
                  defaultValue: 'View past analyses',
                })}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      {isProgressTrackingEnabled && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Known */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-[var(--pl-accent-soft)] flex items-center justify-center'>
                <CheckCircle2 className='w-4 h-4 text-[var(--pl-accent)]' />
              </div>
              <span className='inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'>
                {Math.round(
                  totalCards > 0 ? (knownCards / totalCards) * 100 : 0,
                )}
                %
              </span>
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              {t('flashcard.results.knownLabel')}
            </p>
            <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
              {knownCards}{' '}
              <span className='text-base text-muted-foreground'>
                {t('flashcard.results.cardsUnit')}
              </span>
            </p>
            <p className='text-xs text-muted-foreground'>
              {t('flashcard.results.masteredThisSession')}
            </p>
          </div>

          {/* Learning */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-[var(--pl-danger-soft)] flex items-center justify-center'>
                <AlertCircle className='w-4 h-4 text-[var(--pl-danger)]' />
              </div>
              {learningCards > 0 && (
                <span className='inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'>
                  {t('flashcard.results.needsReview')}
                </span>
              )}
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              {t('flashcard.results.learningLabel')}
            </p>
            <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
              {learningCards}{' '}
              <span className='text-base text-muted-foreground'>
                {t('flashcard.results.cardsUnit')}
              </span>
            </p>
            <p className='text-xs text-muted-foreground'>
              {learningCards === 0
                ? t('flashcard.results.noneToReview')
                : t('flashcard.results.cardsToRevisit', {
                    count: learningCards,
                  })}
            </p>
          </div>

          {/* Remaining */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-[var(--pl-bg-sunken)] flex items-center justify-center'>
                <Clock className='w-4 h-4 text-muted-foreground' />
              </div>
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              {t('flashcard.results.remainingLabel')}
            </p>
            <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
              {remainingCards}{' '}
              <span className='text-base text-muted-foreground'>
                {t('flashcard.results.cardsUnit')}
              </span>
            </p>
            <p className='text-xs text-muted-foreground'>
              {remainingCards === 0
                ? t('flashcard.results.allCardsReviewed')
                : t('flashcard.results.notYetSeen', { count: remainingCards })}
            </p>
          </div>
        </div>
      )}

      {/* ── Review logs ── */}
      {logs.length > 0 && (
        <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-0.5'>
                {t('flashcard.results.reviewLogs')}
              </p>
              <p className='font-medium'>
                {t('flashcard.results.entriesCount', { count: logs.length })}
              </p>
            </div>
            {finishedAt && (
              <span className='text-xs text-muted-foreground'>
                {t('flashcard.results.finishedAt', { time: finishedAt })}
              </span>
            )}
          </div>

          {showLogs && (
            <div className='space-y-2 max-h-64 overflow-auto mb-3'>
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between p-3 rounded-xl bg-[var(--pl-bg-hover)]'
                >
                  <span className='text-sm font-medium truncate flex-1 mr-4'>
                    {findCardTitle(log.cardId)}
                  </span>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='text-xs text-muted-foreground'>
                      {new Date(log.reviewedAt).toLocaleTimeString()}
                    </span>
                    {log.known ? (
                      <span className='inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'>
                        <CheckCircle2 className='w-3 h-3' />
                        {t('flashcard.results.logKnown')}
                      </span>
                    ) : (
                      <span className='inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'>
                        <AlertCircle className='w-3 h-3' />
                        {t('flashcard.results.logUnknown')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowLogs((v) => !v)}
            className='text-xs text-muted-foreground hover:text-foreground transition-colors'
          >
            {showLogs
              ? t('flashcard.results.hideLogs')
              : t('flashcard.results.showAllLogs')}
          </button>
        </div>
      )}

      {/* ── Footer actions ── */}
      <div className='flex gap-3 justify-center flex-wrap pt-2'>
        <Button
          variant='outline'
          onClick={onHome}
          className='gap-2 text-muted-foreground'
        >
          <Home className='w-4 h-4' />
          {t('flashcard.results.backToFlashcard')}
        </Button>
        <Button
          variant='outline'
          onClick={onReset}
          className='gap-2 text-muted-foreground'
        >
          <RotateCcw className='w-4 h-4' />
          {t('flashcard.results.resetProgress')}
        </Button>
      </div>

      {canAnalyze && showAnalysis && (
        <KnowledgeAnalysisDialog
          open={showAnalysis}
          onOpenChange={setShowAnalysis}
          target={{
            kind: 'flashcard',
            setId: setId!,
            flashcardId: flashcardId!,
            sessionId: sessionId!,
          }}
        />
      )}

      {canViewHistory && showAnalysisHistory && (
        <AnalysisHistoryDialog
          open={showAnalysisHistory}
          onOpenChange={setShowAnalysisHistory}
          target={{
            kind: 'flashcard',
            setId: setId!,
            flashcardId: flashcardId!,
          }}
        />
      )}
    </div>
  );
};

export default ResultsView;
