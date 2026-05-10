import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchingEmptyStateProps {
  hasCards: boolean;
  onStart: () => void;
  onBack: () => void;
}

const MatchingEmptyState = ({
  hasCards,
  onStart,
  onBack,
}: MatchingEmptyStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 text-center'>
      <div className='w-20 h-20 rounded-2xl bg-[var(--pl-bg)] border border-border flex items-center justify-center mb-6'>
        <div className='grid grid-cols-2 gap-1'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='w-4 h-4 rounded bg-border' />
          ))}
        </div>
      </div>
      <h2 className='font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight mb-2'>
        Matching Game
      </h2>
      <p className='text-muted-foreground mb-8 max-w-xs'>
        {hasCards
          ? 'Match terms with their definitions as fast as you can.'
          : 'No flashcards available to play.'}
      </p>
      <div className='flex gap-3'>
        {hasCards && (
          <Button onClick={onStart} className='px-6'>
            Start Game
          </Button>
        )}
        <Button variant='outline' onClick={onBack} className='gap-2 px-6'>
          <ArrowLeft className='w-4 h-4' />
          Back
        </Button>
      </div>
    </div>
  );
};

export default MatchingEmptyState;
