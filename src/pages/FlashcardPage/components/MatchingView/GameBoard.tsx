import { Clock, ArrowLeft, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchingCard } from './useMatchingGame';

const CONFETTI_COLORS = [
  'var(--pl-accent)',
  'var(--pl-success)',
  'var(--pl-warning)',
  'var(--pl-danger)',
];

const ConfettiBurst = () => {
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360;
    const dist = 90 + Math.random() * 130;
    return {
      tx: Math.cos((angle * Math.PI) / 180) * dist,
      ty: Math.sin((angle * Math.PI) / 180) * dist,
      rot: Math.random() * 540 - 270,
      delay: Math.random() * 0.15,
      size: i % 3 === 0 ? 10 : 7,
      round: i % 2 === 0,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });

  return (
    <div className='absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10'>
      {pieces.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.round ? '50%' : '2px',
            backgroundColor: p.color,
            '--cx-tx': `${p.tx}px`,
            '--cx-ty': `${p.ty}px`,
            '--cx-rot': `${p.rot}deg`,
            animation: `confetti-burst 0.9s ease-out ${p.delay}s forwards`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

interface MatchingGameBoardProps {
  cards: MatchingCard[];
  matchedPairs: Set<number>;
  totalPairs: number;
  timer: number;
  streak: number;
  countdown: number | null;
  showConfetti: boolean;
  formatTime: (ms: number) => string;
  getCardStyle: (card: MatchingCard) => string;
  onCardClick: (cardId: string) => void;
  onBack: () => void;
}

const MatchingGameBoard = ({
  cards,
  matchedPairs,
  totalPairs,
  timer,
  streak,
  countdown,
  showConfetti,
  formatTime,
  getCardStyle,
  onCardClick,
  onBack,
}: MatchingGameBoardProps) => {
  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight'>
            Matching Game
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Match terms with their definitions
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {streak >= 2 && (
            <div className='flex items-center gap-1.5 bg-[var(--pl-warning-soft)] border border-[var(--pl-warning-border)] px-3 py-2 rounded-xl'>
              <Flame className='w-3.5 h-3.5 text-[var(--pl-warning-text)]' />
              <span className='font-[family-name:var(--font-mono-pl)] text-xs font-medium text-[var(--pl-warning-text)]'>
                {streak}x
              </span>
            </div>
          )}

          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <Clock className='w-4 h-4 text-muted-foreground' />
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-[var(--pl-accent)]'>
              {formatTime(timer)}
            </span>
          </div>

          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-[var(--pl-success)]'>
              {matchedPairs.size}
              <span className='text-muted-foreground text-sm'>
                /{totalPairs}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className='h-1 bg-border rounded-full overflow-hidden mb-8'>
        <div
          className='h-full bg-primary transition-all duration-300 rounded-full'
          style={{ width: `${(matchedPairs.size / totalPairs) * 100}%` }}
        />
      </div>

      {/* Cards Grid */}
      <div className='relative grid grid-cols-3 gap-3 mb-8'>
        {showConfetti && <ConfettiBurst />}

        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={`relative ${getCardStyle(card)}`}
          >
            <span
              className={`absolute top-2 left-2 w-1.5 h-1.5 rounded-full ${
                card.type === 'term'
                  ? 'bg-[var(--pl-accent)]'
                  : 'bg-[var(--pl-text-faint)]'
              }`}
            />
            <p className='text-sm font-medium leading-snug'>{card.content}</p>
          </div>
        ))}

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className='absolute inset-0 z-20 flex items-center justify-center bg-[var(--pl-bg)]/85 backdrop-blur-sm rounded-2xl'>
            <p
              key={countdown}
              className='font-[family-name:var(--font-display)] text-[110px] leading-none font-normal text-[var(--pl-accent)] animate-[countdown-pulse_1s_ease-in-out_forwards]'
            >
              {countdown === 0 ? 'Go!' : countdown}
            </p>
          </div>
        )}
      </div>

      {/* Exit */}
      <div className='flex justify-center'>
        <Button variant='outline' onClick={onBack} className='gap-2'>
          <ArrowLeft className='w-4 h-4' />
          Exit Game
        </Button>
      </div>
    </div>
  );
};

export default MatchingGameBoard;
