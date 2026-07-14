import { ChevronLeft, ChevronRight, Info, Settings, Shuffle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFlashcardStudySettings } from '@/hooks/useFlashcardStudySettings';

import FlashcardCard from './FlashcardCard';
import FlashcardRecallButtons from './FlashcardRecallButtons';
import FlashcardSettingsDialog from './FlashcardSettingsDialog';

type Props = {
  isFlipped: boolean;
  flashcards: Array<{
    frontCard: string;
    backCard: string;
    imageUrl?: string | null;
  }>;
  currentCardIndex: number;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onCardAnswer: (isCorrect: boolean) => void;
  reviewBannerMessage?: string;
};

const FlipFlashcard = ({
  isFlipped,
  flashcards,
  currentCardIndex,
  onFlip,
  onPrevious,
  onNext,
  onShuffle,
  onCardAnswer,
  reviewBannerMessage,
}: Props) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    isFrontCardTerm,
    isProgressTrackingEnabled,
    autoFlipDelay,
    matchingCardCount,
    setIsFrontCardTerm,
    setIsProgressTrackingEnabled,
    setAutoFlipDelay,
    setMatchingCardCount,
  } = useFlashcardStudySettings();

  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [flashColor, setFlashColor] = useState<'correct' | 'incorrect' | null>(
    null,
  );
  const dragStartRef = useRef(0);
  const didDragRef = useRef(false);

  // Stable callback refs — avoids stale closures in effects
  const onFlipRef = useRef(onFlip);
  const onPreviousRef = useRef(onPrevious);
  const onNextRef = useRef(onNext);
  const onCardAnswerRef = useRef(onCardAnswer);
  useEffect(() => {
    onFlipRef.current = onFlip;
    onPreviousRef.current = onPrevious;
    onNextRef.current = onNext;
    onCardAnswerRef.current = onCardAnswer;
  });

  const triggerAnswer = (isCorrect: boolean) => {
    setFlashColor(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFlashColor(null), 420);
    onCardAnswerRef.current(isCorrect);
  };
  const triggerAnswerRef = useRef(triggerAnswer);
  useEffect(() => {
    triggerAnswerRef.current = triggerAnswer;
  });

  // F — Auto-flip timer
  useEffect(() => {
    if (!autoFlipDelay || isFlipped) return;
    const timer = setTimeout(() => onFlipRef.current(), autoFlipDelay * 1000);
    return () => clearTimeout(timer);
  }, [currentCardIndex, autoFlipDelay, isFlipped]);

  // A — Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSettingsOpen) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          onFlipRef.current();
          break;
        case '1':
          triggerAnswerRef.current(false);
          break;
        case '2':
          triggerAnswerRef.current(true);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPreviousRef.current();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextRef.current();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen]);

  // B — Document-level drag tracking (handles fast mouse movement outside element)
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const delta = e.clientX - dragStartRef.current;
      if (Math.abs(delta) > 5) didDragRef.current = true;
      setDragOffsetX(delta);
    };
    const handleUp = (e: MouseEvent) => {
      const delta = e.clientX - dragStartRef.current;
      setIsDragging(false);
      if (didDragRef.current && Math.abs(delta) > 80) {
        setDragOffsetX(0);
        triggerAnswerRef.current(delta > 0);
      } else {
        setDragOffsetX(0);
      }
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: { clientX: number }) => {
    dragStartRef.current = e.clientX;
    didDragRef.current = false;
    setIsDragging(true);
  };

  const handleCardClick = () => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onFlip();
  };

  const total = flashcards.length;
  const current = flashcards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / total) * 100;
  const frontText = isFrontCardTerm ? current.frontCard : current.backCard;
  const backText = isFrontCardTerm ? current.backCard : current.frontCard;
  const frontLabel = isFrontCardTerm ? 'Term' : 'Definition';
  const backLabel = isFrontCardTerm ? 'Definition' : 'Term';

  const dragProgress = Math.min(1, Math.abs(dragOffsetX) / 80);
  const isDraggingRight = dragOffsetX > 10;
  const isDraggingLeft = dragOffsetX < -10;

  return (
    <>
      {/* Review-mode banner */}
      {reviewBannerMessage && (
        <div className='mx-10 mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)]'>
          <Info size={16} className='mt-0.5 shrink-0' />
          <span>{reviewBannerMessage}</span>
        </div>
      )}

      {/* Progress bar */}
      {isProgressTrackingEnabled && (
        <div className='pt-5 px-10 lg:px-20'>
          <div
            className='flex justify-between text-xs mb-2 text-[var(--pl-text-faint)]'
            style={{ fontFamily: 'var(--font-mono-pl)' }}
          >
            <span>
              {String(currentCardIndex + 1).padStart(2, '0')} / {total}
            </span>
            <span>
              Mastery ·{' '}
              <span className='text-[var(--pl-text)]'>
                {Math.round(progress)}%
              </span>
            </span>
          </div>
          <div className='h-[2px] rounded-full overflow-hidden bg-[var(--pl-border)]'>
            <div
              className='h-full rounded-full transition-all duration-300 bg-[var(--pl-accent)]'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Card area */}
      <div className='flex-1 flex items-center justify-center py-10 gap-7'>
        <Button
          onClick={onPrevious}
          disabled={currentCardIndex === 0}
          variant='outline'
          size='icon'
          className='shrink-0 text-[var(--pl-text-muted)]'
        >
          <ChevronLeft className='size-6' />
        </Button>

        {/* B — Drag wrapper */}
        <div
          className='flex-1 max-w-[720px]'
          onMouseDown={handleMouseDown}
          style={{
            transform:
              dragOffsetX !== 0
                ? `translateX(${dragOffsetX}px) rotate(${dragOffsetX * 0.025}deg)`
                : undefined,
            transition: isDragging
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            cursor: isDragging ? 'grabbing' : undefined,
            userSelect: 'none',
          }}
        >
          <FlashcardCard
            isFlipped={isFlipped}
            frontText={frontText}
            backText={backText}
            frontLabel={frontLabel}
            backLabel={backLabel}
            cardNumber={String(currentCardIndex + 1).padStart(2, '0')}
            imageUrl={current.imageUrl}
            isDraggingRight={isDraggingRight}
            isDraggingLeft={isDraggingLeft}
            dragProgress={dragProgress}
            flashColor={flashColor}
            autoFlipDelay={autoFlipDelay}
            cardKey={currentCardIndex}
            onCardClick={handleCardClick}
          />
          <FlashcardRecallButtons onAnswer={triggerAnswer} />
        </div>

        <Button
          onClick={onNext}
          disabled={currentCardIndex >= total - 1}
          variant='outline'
          size='icon'
          className='shrink-0 text-[var(--pl-text-muted)]'
        >
          <ChevronRight className='size-6' />
        </Button>
      </div>

      {/* Bottom toolbar */}
      <div className='flex justify-end gap-2 px-10 pb-4'>
        <Button variant='outline' size='icon' onClick={onShuffle}>
          <Shuffle size={14} />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={14} />
        </Button>
      </div>

      <FlashcardSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        isFrontCardTerm={isFrontCardTerm}
        isProgressTrackingEnabled={isProgressTrackingEnabled}
        autoFlipDelay={autoFlipDelay}
        matchingCardCount={matchingCardCount}
        setIsFrontCardTerm={setIsFrontCardTerm}
        setIsProgressTrackingEnabled={setIsProgressTrackingEnabled}
        setAutoFlipDelay={setAutoFlipDelay}
        setMatchingCardCount={setMatchingCardCount}
      />
    </>
  );
};

export default FlipFlashcard;
