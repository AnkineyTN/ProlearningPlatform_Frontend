import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchingCard } from './useMatchingGame';

interface MatchingGameBoardProps {
  cards: MatchingCard[];
  matchedPairs: Set<number>;
  totalPairs: number;
  timer: number;
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
          {/* Timer */}
          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <Clock className='w-4 h-4 text-muted-foreground' />
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-text-selected'>
              {formatTime(timer)}
            </span>
          </div>

          {/* Score */}
          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-text-info'>
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
      <div className='grid grid-cols-3 gap-3 mb-8'>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => onCardClick(card.id)}
            className={getCardStyle(card)}
          >
            <p className='text-sm font-medium leading-snug'>{card.content}</p>
          </div>
        ))}
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
