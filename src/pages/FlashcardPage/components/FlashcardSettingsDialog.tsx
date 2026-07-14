import { useTranslation } from 'react-i18next';

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

const AUTO_FLIP_DELAYS = [3, 5, 10, 15] as const;
const MATCHING_CARD_COUNTS = [6, 9, 12, 15] as const;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isFrontCardTerm: boolean;
  isProgressTrackingEnabled: boolean;
  autoFlipDelay: number | null;
  matchingCardCount: number;
  setIsFrontCardTerm: (v: boolean) => void;
  setIsProgressTrackingEnabled: (v: boolean) => void;
  setAutoFlipDelay: (v: number | null) => void;
  setMatchingCardCount: (v: number) => void;
};

const FlashcardSettingsDialog = ({
  open,
  onOpenChange,
  isFrontCardTerm,
  isProgressTrackingEnabled,
  autoFlipDelay,
  matchingCardCount,
  setIsFrontCardTerm,
  setIsProgressTrackingEnabled,
  setAutoFlipDelay,
  setMatchingCardCount,
}: Props) => {
  const { t } = useTranslation();

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>{t('flashcard.settings.title')}</DialogTitle>
      </DialogHeader>
      <div className='space-y-6 py-4'>

        {/* Track Progress */}
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>{t('flashcard.settings.trackProgressLabel')}</p>
            <p className='text-sm text-muted-foreground'>{t('flashcard.settings.trackProgressDescription')}</p>
          </div>
          <Switch
            checked={isProgressTrackingEnabled}
            onCheckedChange={setIsProgressTrackingEnabled}
            className='cursor-pointer'
          />
        </div>

        {/* Auto-flip */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='font-medium'>{t('flashcard.settings.autoFlipLabel')}</p>
              <p className='text-sm text-muted-foreground'>
                {t('flashcard.settings.autoFlipDescription')}
              </p>
            </div>
            <Switch
              checked={autoFlipDelay !== null}
              onCheckedChange={(v) => setAutoFlipDelay(v ? 5 : null)}
              className='cursor-pointer'
            />
          </div>
          {autoFlipDelay !== null && (
            <div className='flex gap-2'>
              {AUTO_FLIP_DELAYS.map((s) => (
                <Button
                  key={s}
                  variant='outline'
                  size='sm'
                  onClick={() => setAutoFlipDelay(s)}
                  className='cursor-pointer'
                  style={{
                    background: autoFlipDelay === s ? 'var(--pl-accent-soft)' : undefined,
                    borderColor: autoFlipDelay === s ? 'var(--pl-accent-border)' : undefined,
                    color: autoFlipDelay === s ? 'var(--pl-accent-strong)' : undefined,
                  }}
                >
                  {t('flashcard.settings.autoFlipSeconds', { value: s })}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Matching game card count */}
        <div className='space-y-3'>
          <div>
            <p className='font-medium'>{t('flashcard.settings.matchingCardsLabel')}</p>
            <p className='text-sm text-muted-foreground'>
              {t('flashcard.settings.matchingCardsDescription')}
            </p>
          </div>
          <div className='flex gap-2'>
            {MATCHING_CARD_COUNTS.map((n) => (
              <Button
                key={n}
                variant='outline'
                size='sm'
                onClick={() => setMatchingCardCount(n)}
                className='cursor-pointer'
                style={{
                  background: matchingCardCount === n ? 'var(--pl-accent-soft)' : undefined,
                  borderColor: matchingCardCount === n ? 'var(--pl-accent-border)' : undefined,
                  color: matchingCardCount === n ? 'var(--pl-accent-strong)' : undefined,
                }}
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* Front Side */}
        <div>
          <p className='font-medium mb-3'>{t('flashcard.settings.frontSideLabel')}</p>
          <div className='flex items-center space-x-10'>
            <Label className='flex items-center gap-3 cursor-pointer'>
              <Input
                type='radio'
                name='cardSide'
                checked={isFrontCardTerm}
                onChange={() => setIsFrontCardTerm(true)}
                className='w-4 h-4'
              />
              <span>{t('flashcard.settings.term')}</span>
            </Label>
            <Label className='flex items-center gap-3 cursor-pointer'>
              <Input
                type='radio'
                name='cardSide'
                checked={!isFrontCardTerm}
                onChange={() => setIsFrontCardTerm(false)}
                className='w-4 h-4'
              />
              <span>{t('flashcard.settings.definition')}</span>
            </Label>
          </div>
        </div>

        <Button
          variant='outline'
          className='w-full cursor-pointer'
          onClick={() => window.location.reload()}
        >
          {t('flashcard.settings.resetFlashcards')}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
  );
};

export default FlashcardSettingsDialog;
