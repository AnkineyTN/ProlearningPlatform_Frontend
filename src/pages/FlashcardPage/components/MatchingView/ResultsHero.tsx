import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MatchingResultsHeroProps {
  heroTitle: string;
  heroSubtitle: string;
  accuracy: number;
  isPerfect: boolean;
  totalPairs: number;
  onPlayAgain: () => void;
  onBack: () => void;
}

const MatchingResultsHero = ({
  heroTitle,
  heroSubtitle,
  accuracy,
  isPerfect,
  totalPairs,
  onPlayAgain,
  onBack,
}: MatchingResultsHeroProps) => {
  const circumference = 2 * Math.PI * 90;

  return (
    <div className='relative rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden p-10 text-center'>
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(34,197,94,0.14), transparent 60%)',
        }}
      />
      <div className='relative'>
        <h2 className='font-[family-name:var(--font-display)] italic text-5xl font-normal tracking-tight mb-3'>
          {heroTitle}
        </h2>
        <p className='text-muted-foreground mb-8 max-w-md mx-auto text-sm'>
          {heroSubtitle}
        </p>

        <div className='inline-flex relative items-center justify-center mb-8'>
          <svg width='220' height='220' viewBox='0 0 220 220'>
            <circle
              cx='110'
              cy='110'
              r='90'
              fill='none'
              strokeWidth='8'
              stroke='var(--pl-border)'
              opacity='0.3'
            />
            <circle
              cx='110'
              cy='110'
              r='90'
              fill='none'
              strokeWidth='8'
              strokeLinecap='round'
              stroke={isPerfect ? '#22c55e' : '#ef4444'}
              strokeDasharray={`${(accuracy / 100) * circumference} ${circumference}`}
              transform='rotate(-90 110 110)'
              style={{
                filter: `drop-shadow(0 0 8px ${
                  isPerfect ? 'rgba(34,197,94,0.55)' : 'rgba(239,68,68,0.45)'
                })`,
                transition: 'stroke-dasharray 600ms ease',
              }}
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.2em] text-muted-foreground mb-1'>
              ACCURACY
            </span>
            <span className='font-[family-name:var(--font-display)] text-6xl font-medium leading-none'>
              {accuracy}
              <span className='text-2xl text-muted-foreground'>%</span>
            </span>
            <div className='flex items-center gap-1.5 mt-2'>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPerfect ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className='text-xs text-muted-foreground'>
                {totalPairs}/{totalPairs} matched
              </span>
            </div>
          </div>
        </div>

        <div className='flex gap-3 justify-center'>
          <Button
            onClick={onPlayAgain}
            className='gap-2 bg-green-500 hover:bg-green-500/90 text-black'
          >
            <RotateCcw className='w-4 h-4' />
            Play again
          </Button>
          <Button variant='outline' onClick={onBack} className='gap-2'>
            <ArrowLeft className='w-4 h-4' />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MatchingResultsHero;
