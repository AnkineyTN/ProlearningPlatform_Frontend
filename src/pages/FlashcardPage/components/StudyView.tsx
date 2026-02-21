import { Button } from "@/components/ui/button";

import FlipFlashcard from "./FlipFlashcard";

type Props = {
  flashcards: Array<{
    frontCard: string;
    backCard: string;
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
}

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
}: StudyViewProps) {
  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='flex flex-col'>
        <div className='flex items-center justify-between mb-4'>
          <Button variant='ghost' onClick={onBack} className='cursor-pointer'>
            ← Back
          </Button>
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
    </div>
  );
}

export default StudyView;
