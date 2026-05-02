import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ReviewLog } from "@/services/types/flashcard-session.types";
import type { Card as Flashcard } from "@/services/types/flashcard.types";

type ResultsViewProps = {
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
  const rawCorrect = sessionResult?.correctCount ?? 0;
  const rawIncorrect = sessionResult?.incorrectCount ?? 0;

  // Spec: when progress tracking is disabled, the result screen reports
  // knownCards = totalCards, learningCards = 0, remainingCards = 0.
  const knownCards = isProgressTrackingEnabled ? rawCorrect : totalCards;
  const learningCards = isProgressTrackingEnabled ? rawIncorrect : 0;
  const remainingCards = isProgressTrackingEnabled
    ? Math.max(0, totalCards - knownCards - learningCards)
    : 0;

  // Circular progress = knownCards / totalCards * 100 (clamped 0-100, NaN-guarded).
  const rawPct = totalCards > 0 ? (knownCards / totalCards) * 100 : 0;
  const pct = Number.isFinite(rawPct) ? Math.max(0, Math.min(100, rawPct)) : 0;

  const finishedAt = sessionResult?.finishedAt
    ? new Date(sessionResult.finishedAt).toLocaleString()
    : undefined;
  const logs = sessionResult?.logs ?? [];

  const findCardTitle = (cardId: number) => {
    const found = flashcards.find((c) => c.id === cardId);
    return found ? found.frontCard : String(cardId);
  };

  // Geometry for the SVG ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      <div className='min-h-[70vh] flex items-center justify-center'>
        <Card className='max-w-2xl w-full'>
          <CardContent className='p-8 text-center'>
            <div className='mb-6 flex flex-col items-center'>
              <div className='relative mb-4'>
                <svg width={140} height={140} viewBox='0 0 140 140'>
                  <circle
                    cx={70}
                    cy={70}
                    r={radius}
                    fill='none'
                    strokeWidth={10}
                    style={{ stroke: 'var(--pl-border)' }}
                  />
                  <circle
                    cx={70}
                    cy={70}
                    r={radius}
                    fill='none'
                    strokeWidth={10}
                    strokeLinecap='round'
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    transform='rotate(-90 70 70)'
                    style={{ stroke: 'var(--pl-accent)' }}
                  />
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <div className='text-3xl font-semibold'>{Math.round(pct)}%</div>
                  <div className='text-xs text-muted-foreground mt-0.5'>
                    {knownCards} / {totalCards}
                  </div>
                </div>
              </div>
              <h2 className='text-2xl font-bold mb-1'>Great job!</h2>
              <p className='text-muted-foreground'>
                You've completed this study session
              </p>
              {totalCards !== studiedCards && (
                <p className='text-sm text-muted-foreground mt-1'>
                  Studied {studiedCards} of {totalCards} cards
                </p>
              )}
            </div>

            <div
              className={`grid ${isProgressTrackingEnabled ? 'grid-cols-3' : 'grid-cols-1'} gap-4 mb-6`}
            >
              <div className='p-4 bg-muted rounded-lg'>
                <div className='text-3xl font-bold mb-1'>{knownCards}</div>
                <div className='text-sm text-muted-foreground'>Known</div>
              </div>
              {isProgressTrackingEnabled && (
                <>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-3xl font-bold text-destructive mb-1'>
                      {learningCards}
                    </div>
                    <div className='text-sm text-muted-foreground'>Learning</div>
                  </div>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-3xl font-bold mb-1'>{remainingCards}</div>
                    <div className='text-sm text-muted-foreground'>Remaining</div>
                  </div>
                </>
              )}
            </div>

            {finishedAt && (
              <p className='text-xs text-muted-foreground mb-4'>
                Finished at {finishedAt}
              </p>
            )}

            {logs.length > 0 && (
              <div className='text-left mb-4'>
                <h3 className='font-medium mb-2'>Review Logs</h3>
                <div className='space-y-2 max-h-48 overflow-auto'>
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className='p-3 bg-background/50 rounded flex items-center justify-between'
                    >
                      <div className='flex-1'>
                        <div className='font-medium'>
                          {findCardTitle(log.cardId)}
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          {new Date(log.reviewedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className='ml-4'>
                        {log.known ? (
                          <span className='text-green-600'>Known</span>
                        ) : (
                          <span className='text-destructive'>Unknown</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='default'
                size='lg'
                className='cursor-pointer'
                onClick={onContinue}
              >
                Continue Studying
              </Button>
              {onPracticeWithExam && (
                <Button
                  variant='outline'
                  size='lg'
                  className='cursor-pointer'
                  disabled={isPracticeWithExamLoading}
                  onClick={onPracticeWithExam}
                >
                  {isPracticeWithExamLoading && (
                    <Loader2 className='size-4 animate-spin mr-2' />
                  )}
                  Practice with Test
                </Button>
              )}
              {onMatching && (
                <Button
                  variant='outline'
                  size='lg'
                  className='cursor-pointer'
                  onClick={onMatching}
                >
                  Study in Matching Mode
                </Button>
              )}
              <Button
                variant='ghost'
                size='lg'
                className='cursor-pointer'
                onClick={onHome}
              >
                Back to Flashcard
              </Button>
              <Button
                variant='ghost'
                size='lg'
                className='cursor-pointer col-span-2 text-muted-foreground'
                onClick={onReset}
              >
                Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsView;
