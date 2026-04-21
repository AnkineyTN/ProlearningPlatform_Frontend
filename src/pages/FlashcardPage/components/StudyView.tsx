import { ArrowLeft } from 'lucide-react';
import FlipFlashcard from './FlipFlashcard';

type StudyViewProps = {
  flashcards: Array<{
    frontCard: string;
    backCard: string;
    imageUrl?: string | null;
  }>;
  currentCardIndex: number;
  isFlipped: boolean;
  onBack: () => void;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onCardAnswer: (isCorrect: boolean) => void;
  sessionProgress?: {
    completedCount: number;
    progressPercent: number;
  };
};

const StudyView = ({
  flashcards,
  currentCardIndex,
  isFlipped,
  onBack,
  onFlip,
  onPrevious,
  onNext,
  onShuffle,
  onCardAnswer,
}: StudyViewProps) => {
  return (
    <div
      className='flex flex-col min-h-screen'
      style={{ background: 'var(--pl-bg)' }}
    >
      {/* Header */}
      <div
        className='flex items-center px-10 py-[18px]'
        style={{ borderBottom: '1px solid var(--pl-border)' }}
      >
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          <ArrowLeft size={13} />
          Back to deck
        </button>
      </div>

      <FlipFlashcard
        isFlipped={isFlipped}
        flashcards={flashcards}
        currentCardIndex={currentCardIndex}
        onFlip={onFlip}
        onPrevious={onPrevious}
        onNext={onNext}
        onShuffle={onShuffle}
        onCardAnswer={onCardAnswer}
      />
    </div>
  );
};

export default StudyView;
