import { LoaderCircle, Sparkles } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/components/ui/button';

interface AiExplainTooltipProps {
  isPending: boolean;
  onClick: () => void;
}

const AiExplainTooltip = forwardRef<HTMLDivElement, AiExplainTooltipProps>(
  function AiExplainTooltip({ isPending, onClick }, ref) {
    return (
      <div
        ref={ref}
        className='absolute top-3 right-1/4 -translate-x-1/2 z-50 rounded-lg border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] shadow-lg animate-in fade-in slide-in-from-top-1 duration-150'
      >
        <Button
          size='sm'
          onClick={onClick}
          disabled={isPending}
          className='gap-2'
        >
          {isPending ? (
            <LoaderCircle className='w-4 h-4 animate-spin' />
          ) : (
            <Sparkles className='w-4 h-4' />
          )}
          AI Explain
        </Button>
      </div>
    );
  },
);

export default AiExplainTooltip;
