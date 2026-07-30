import { ArrowLeft } from 'lucide-react';

import FlipFlashcard from './FlipFlashcard';

type StudyViewProps = {
  title: string;
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
  onCardAnswer: (isCorrect: boolean) => void;
  sessionProgress?: {
    completedCount: number;
    progressPercent: number;
  };
  /** Surfaced when the server returns studyMode === "REVIEW". */
  reviewBannerMessage?: string;
};

const StudyView = ({
  title,
  flashcards,
  currentCardIndex,
  isFlipped,
  onBack,
  onFlip,
  onPrevious,
  onCardAnswer,
  reviewBannerMessage,
}: StudyViewProps) => {
  return (
    <div
      className='flex flex-col min-h-screen'
      style={{ background: 'var(--pl-bg)' }}
    >
      <div
        className='sticky top-0 z-10 flex items-center px-10 py-4'
        style={{
          borderBottom: '1px solid var(--pl-border)',
          background: 'var(--pl-bg)',
        }}
      >
        <div className='flex items-center gap-4'>
          <button
            onClick={onBack}
            className='flex cursor-pointer items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
            style={{ color: 'var(--pl-text-muted)' }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div
            className='h-[18px] w-px'
            style={{ background: 'var(--pl-border)' }}
          />
          <span
            className='text-[11px] uppercase tracking-[0.14em]'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            {title}
          </span>
        </div>
      </div>

      <FlipFlashcard
        isFlipped={isFlipped}
        flashcards={flashcards}
        currentCardIndex={currentCardIndex}
        onFlip={onFlip}
        onPrevious={onPrevious}
        onCardAnswer={onCardAnswer}
        reviewBannerMessage={reviewBannerMessage}
      />
    </div>
  );
};

export default StudyView;
