import { forwardRef } from 'react';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiExplainTooltipProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  tooltipPos: { x: number; y: number };
  isPending: boolean;
  onClick: () => void;
}

const AiExplainTooltip = forwardRef<HTMLDivElement, AiExplainTooltipProps>(
  function AiExplainTooltip(
    { containerRef, tooltipPos, isPending, onClick },
    ref,
  ) {
    const containerLeft = containerRef.current?.getBoundingClientRect().left ?? 0;
    return (
      <div
        ref={ref}
        className='absolute rounded-lg shadow-lg bg-[var(--pl-bg)] z-50 flex items-center gap-2'
        style={{
          right: `${containerLeft + tooltipPos.x + 20}px`,
          top: `${tooltipPos.y}px`,
        }}
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
