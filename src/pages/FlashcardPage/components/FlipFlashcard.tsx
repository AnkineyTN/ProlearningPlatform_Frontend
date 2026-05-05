import {
  Shuffle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFlashcardStudySettings } from '@/hooks/useFlashcardStudySettings';

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

const RECALL_BUTTONS = [
  { label: 'Again', hint: '< 1m', correct: false, color: 'var(--pl-danger)' },
  { label: 'Good', hint: '1d', correct: true, color: 'var(--pl-accent)' },
] as const;

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
    setIsFrontCardTerm,
    setIsProgressTrackingEnabled,
  } = useFlashcardStudySettings();
  const [hoveredBtn, setHoveredBtn] = useState<number | null>(null);

  const total = flashcards.length;
  const progress = ((currentCardIndex + 1) / total) * 100;
  const current = flashcards[currentCardIndex];

  // When isFrontCardTerm = false, swap which side is the "front".
  const frontText = isFrontCardTerm ? current.frontCard : current.backCard;
  const backText = isFrontCardTerm ? current.backCard : current.frontCard;

  return (
    <>
      {/* REVIEW-mode banner (server-issued message) */}
      {reviewBannerMessage && (
        <div
          className='mx-10 mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm'
          style={{
            background: 'var(--pl-accent-soft)',
            borderColor: 'var(--pl-accent-border)',
            color: 'var(--pl-accent-strong)',
          }}
        >
          <Info size={16} className='mt-0.5 shrink-0' />
          <span>{reviewBannerMessage}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className='pt-5 px-10 lg:px-20'>
        <div
          className='flex justify-between text-xs mb-2'
          style={{
            color: 'var(--pl-text-faint)',
            fontFamily: 'var(--font-mono-pl)',
          }}
        >
          <span>
            {String(currentCardIndex + 1).padStart(2, '0')} / {total}
          </span>
          {isProgressTrackingEnabled && (
            <span>
              Mastery ·{' '}
              <span style={{ color: 'var(--pl-text)' }}>
                {Math.round(progress)}%
              </span>
            </span>
          )}
        </div>
        <div
          className='h-[2px] rounded-full overflow-hidden'
          style={{ background: 'var(--pl-border)' }}
        >
          <div
            className='h-full rounded-full transition-all duration-300'
            style={{ width: `${progress}%`, background: 'var(--pl-accent)' }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className='flex-1 flex items-center justify-center py-10 gap-7'>
        {/* Prev */}
        <Button
          onClick={onPrevious}
          disabled={currentCardIndex === 0}
          className='h-9 w-9 hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
        >
          <ChevronLeft className='size-6' />
        </Button>

        {/* Flip card */}
        <div className='flex-1 max-w-[720px]' style={{ perspective: '1800px' }}>
          <div
            onClick={onFlip}
            className='relative cursor-pointer'
            style={{
              height: 440,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'none',
            }}
          >
            {/* Front */}
            <div
              className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col'
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: 'var(--pl-bg-elev)',
                border: '1px solid var(--pl-border)',
                boxShadow: '0 30px 80px oklch(0 0 0 / 0.1)',
              }}
            >
              <div className='flex justify-between items-start'>
                <span
                  className='text-[11px] uppercase tracking-[0.16em]'
                  style={{ color: 'var(--pl-text-faint)' }}
                >
                  {isFrontCardTerm ? 'Term' : 'Definition'} · Tap to reveal
                </span>
                <span
                  className='text-[10.5px] px-[10px] py-[3px] rounded-full uppercase tracking-[0.08em] font-[500]'
                  style={{
                    background: 'var(--pl-accent-soft)',
                    color: 'var(--pl-accent-strong)',
                  }}
                >
                  Medium
                </span>
              </div>

              <div className='flex-1 flex items-center justify-center text-center py-5'>
                <div>
                  <div
                    className='text-[13px] mb-4'
                    style={{
                      color: 'var(--pl-text-faint)',
                      fontFamily: 'var(--font-mono-pl)',
                    }}
                  >
                    Q·{String(currentCardIndex + 1).padStart(2, '0')}
                  </div>
                  {/* Per spec: image rides with the side that has hasImage = true.
                      When front is the definition, the image stays on the front. */}
                  {current.imageUrl && (
                    <img
                      src={current.imageUrl}
                      alt='Card'
                      className='max-w-full max-h-36 object-contain rounded mb-4 mx-auto'
                    />
                  )}
                  <div
                    className='text-[32px] font-[400] leading-[1.25]'
                    style={{
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em',
                      color: 'var(--pl-text)',
                    }}
                  >
                    {frontText}
                  </div>
                </div>
              </div>

              <div className='flex justify-between items-center'>
                <div />
                <div
                  className='text-[11.5px] flex items-center gap-2'
                  style={{ color: 'var(--pl-text-faint)' }}
                >
                  <span>Press</span>
                  <kbd
                    className='text-[10.5px] px-[7px] py-[2px] rounded'
                    style={{
                      background: 'var(--pl-bg-hover)',
                      border: '1px solid var(--pl-border)',
                      fontFamily: 'var(--font-mono-pl)',
                    }}
                  >
                    Space
                  </kbd>
                  <span>to flip</span>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col'
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                background: 'var(--pl-bg-elev)',
                border: '1px solid var(--pl-accent-border)',
                boxShadow: '0 30px 80px oklch(0 0 0 / 0.1)',
              }}
            >
              <div
                className='text-[11px] uppercase tracking-[0.16em] mb-5'
                style={{ color: 'var(--pl-accent-strong)' }}
              >
                {isFrontCardTerm ? 'Definition' : 'Term'}
              </div>
              <div className='flex-1 overflow-auto'>
                <div
                  className='text-[22px] font-[400] leading-[1.4]'
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.01em',
                    color: 'var(--pl-text)',
                  }}
                >
                  {backText}
                </div>
              </div>
            </div>
          </div>

          {/* Recall buttons */}
          <div className='mt-7'>
            <div
              className='text-[11px] uppercase tracking-[0.16em] text-center mb-3'
              style={{ color: 'var(--pl-text-faint)' }}
            >
              How well did you recall this?
            </div>
            <div className='grid grid-cols-2 gap-[10px]'>
              {RECALL_BUTTONS.map((btn, i) => (
                <button
                  key={btn.label}
                  onClick={() => onCardAnswer(btn.correct)}
                  onMouseEnter={() => setHoveredBtn(i)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  className='py-[14px] px-4 rounded-[10px] flex flex-col items-start gap-[2px] transition-all'
                  style={{
                    background:
                      hoveredBtn === i
                        ? 'var(--pl-bg-hover)'
                        : 'var(--pl-bg-elev)',
                    border:
                      hoveredBtn === i
                        ? `1px solid ${btn.color}`
                        : '1px solid var(--pl-border)',
                  }}
                >
                  <div className='flex items-center gap-2 w-full'>
                    <span
                      className='w-[6px] h-[6px] rounded-full flex-shrink-0'
                      style={{ background: btn.color }}
                    />
                    <span
                      className='text-[13.5px] font-[500]'
                      style={{ color: 'var(--pl-text)' }}
                    >
                      {btn.label}
                    </span>
                    <span
                      className='ml-auto text-[10px] px-[6px] py-[1px] rounded'
                      style={{
                        background: 'var(--pl-bg-hover)',
                        color: 'var(--pl-text-faint)',
                        fontFamily: 'var(--font-mono-pl)',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>
                  <span
                    className='text-[11px]'
                    style={{
                      color: 'var(--pl-text-faint)',
                      fontFamily: 'var(--font-mono-pl)',
                    }}
                  >
                    Review in {btn.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next */}
        <Button
          onClick={onNext}
          disabled={currentCardIndex >= total - 1}
          className='h-9 w-9 hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
          style={{
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text-muted)',
          }}
        >
          <ChevronRight className='size-6' />
        </Button>
      </div>

      {/* Bottom toolbar */}
      <div className='flex justify-end gap-2 px-10 pb-4'>
        <button
          onClick={onShuffle}
          className='p-2 rounded-lg transition-colors'
          style={{
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text-muted)',
          }}
        >
          <Shuffle size={14} />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className='p-2 rounded-lg transition-colors'
          style={{
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text-muted)',
          }}
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className='space-y-6 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='font-medium'>Track Progress</div>
                <div className='text-sm text-muted-foreground'>
                  Monitor your learning progress
                </div>
              </div>
              <Switch
                checked={isProgressTrackingEnabled}
                onCheckedChange={setIsProgressTrackingEnabled}
                className='cursor-pointer'
              />
            </div>
            <div>
              <div className='font-medium mb-3'>Front Side</div>
              <div className='space-x-10 flex items-center'>
                <Label className='flex items-center gap-3 cursor-pointer'>
                  <Input
                    type='radio'
                    name='cardSide'
                    checked={isFrontCardTerm}
                    onChange={() => setIsFrontCardTerm(true)}
                    className='w-4 h-4'
                  />
                  <span>Term</span>
                </Label>
                <Label className='flex items-center gap-3 cursor-pointer'>
                  <Input
                    type='radio'
                    name='cardSide'
                    checked={!isFrontCardTerm}
                    onChange={() => setIsFrontCardTerm(false)}
                    className='w-4 h-4'
                  />
                  <span>Definition</span>
                </Label>
              </div>
            </div>
            <Button
              variant='outline'
              className='w-full cursor-pointer mt-2'
              onClick={() => window.location.reload()}
            >
              Reset Flashcards
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlipFlashcard;
