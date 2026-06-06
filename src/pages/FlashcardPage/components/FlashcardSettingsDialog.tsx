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

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  isFrontCardTerm: boolean;
  isProgressTrackingEnabled: boolean;
  autoFlipDelay: number | null;
  setIsFrontCardTerm: (v: boolean) => void;
  setIsProgressTrackingEnabled: (v: boolean) => void;
  setAutoFlipDelay: (v: number | null) => void;
};

const FlashcardSettingsDialog = ({
  open,
  onOpenChange,
  isFrontCardTerm,
  isProgressTrackingEnabled,
  autoFlipDelay,
  setIsFrontCardTerm,
  setIsProgressTrackingEnabled,
  setAutoFlipDelay,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className='sm:max-w-md'>
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>
      <div className='space-y-6 py-4'>

        {/* Track Progress */}
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>Track Progress</p>
            <p className='text-sm text-muted-foreground'>Monitor your learning progress</p>
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
              <p className='font-medium'>Auto-flip</p>
              <p className='text-sm text-muted-foreground'>
                Reveal answer automatically after delay
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
                  {s}s
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Front Side */}
        <div>
          <p className='font-medium mb-3'>Front Side</p>
          <div className='flex items-center space-x-10'>
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
          className='w-full cursor-pointer'
          onClick={() => window.location.reload()}
        >
          Reset Flashcards
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default FlashcardSettingsDialog;
