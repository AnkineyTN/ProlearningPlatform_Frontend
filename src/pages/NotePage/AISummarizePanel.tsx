import { ChevronDown, Copy, PanelRightClose, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AISummary {
  id: string;
  query: string;
  response: string;
  type: 'text' | 'file';
}

interface AISummarizePanelProps {
  summaries: AISummary[];
  onRemoveSummary: (id: string) => void;
  onClosePanel?: () => void;
}

const QUERY_PREVIEW_LIMIT = 200;

const SummaryQuery = ({ query }: { query: string }) => {
  const [expanded, setExpanded] = useState(false);
  const isTruncatable = query.length > QUERY_PREVIEW_LIMIT;
  const displayed =
    !isTruncatable || expanded
      ? query
      : query.slice(0, QUERY_PREVIEW_LIMIT).trimEnd();

  return (
    <p className='text-sm italic text-[var(--pl-text-muted)] leading-relaxed font-[var(--font-serif)] border-l-2 border-[var(--pl-accent-border)] pl-3'>
      "{displayed}
      {isTruncatable && !expanded ? '...' : ''}"
      {isTruncatable ? (
        <button
          type='button'
          onClick={() => setExpanded((prev) => !prev)}
          className='ml-1 not-italic text-[var(--pl-accent)] hover:underline text-xs font-[family-name:var(--font-mono-pl)]'
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : null}
    </p>
  );
};

interface SummaryCardProps {
  summary: AISummary;
  onRemove: (id: string) => void;
  onCopy: (text: string) => void;
}

const SummaryCard = ({ summary, onRemove, onCopy }: SummaryCardProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className='p-4 gap-2 bg-[var(--pl-bg)] border-border shadow-none hover:border-[var(--pl-border-strong)] transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 min-w-0'>
          <Button
            size='sm'
            variant='ghost'
            className='h-6 w-6 p-0 text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] shrink-0'
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expand summary' : 'Collapse summary'}
            aria-expanded={!collapsed}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            />
          </Button>
          <span
            className='text-[10px] tracking-[0.18em] uppercase px-2 py-0.5 rounded-md border shrink-0'
            style={{
              color: 'var(--pl-accent-strong)',
              borderColor: 'var(--pl-accent-border)',
              background: 'var(--pl-accent-soft)',
            }}
          >
            {summary.type === 'file' ? 'Summary' : 'Explain'}
          </span>
          {collapsed ? (
            <span
              className='text-xs italic text-[var(--pl-text-muted)] truncate font-[var(--font-serif)] min-w-0'
              title={summary.query}
            >
              {summary.query}
            </span>
          ) : null}
        </div>
        <Button
          size='sm'
          variant='ghost'
          className='h-6 w-6 p-0 text-[var(--pl-text-faint)] hover:text-[var(--pl-text)]'
          onClick={() => onRemove(summary.id)}
          aria-label='Remove summary'
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      {collapsed ? null : (
        <>
          <div className='mb-3'>
            <p className='text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)] mb-1.5'>
              {summary.type === 'file' ? 'Source' : 'Selection'}
            </p>
            <SummaryQuery query={summary.query} />
          </div>

          <div>
            <div className='flex items-center justify-between mb-1.5'>
              <p className='text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)]'>
                AI Response
              </p>
              <Button
                size='sm'
                variant='ghost'
                className='h-6 w-6 p-0 text-[var(--pl-text-faint)] hover:text-[var(--pl-text)]'
                onClick={() => onCopy(summary.response)}
                aria-label='Copy response'
              >
                <Copy className='w-3.5 h-3.5' />
              </Button>
            </div>
            <div
              className='text-sm text-[var(--pl-text)] leading-relaxed prose prose-sm max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5'
              dangerouslySetInnerHTML={{ __html: summary.response }}
            />
          </div>
        </>
      )}
    </Card>
  );
};

export const AISummarizePanel = ({
  summaries,
  onRemoveSummary,
  onClosePanel,
}: AISummarizePanelProps) => {
  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (summaries.length === 0) {
    return (
      <div className='w-full h-full bg-[var(--pl-bg)] border-l border-border flex flex-col items-center justify-center p-8 text-center'>
        <div className='w-12 h-12 rounded-full bg-[var(--pl-accent-soft)] flex items-center justify-center mb-4'>
          <Sparkles className='w-6 h-6 text-[var(--pl-accent)]' />
        </div>
        <p className='text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)] mb-2'>
          AI Workspace
        </p>
        <p
          className='text-lg italic text-[var(--pl-text-muted)] max-w-[260px] leading-snug'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Highlight text or summarize a file to surface AI insights here.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)] border-l border-border'>
      <div className='px-4 py-3 border-b border-border sticky top-0 flex items-center justify-between gap-2 bg-[var(--pl-bg)] z-10'>
        <div className='flex items-baseline gap-2 min-w-0'>
          <h3 className='font-[family-name:var(--font-display)] text-base font-medium tracking-tight truncate text-[var(--pl-text)] flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-[var(--pl-accent)]' />
            AI Workspace
          </h3>
          <span className='text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)] font-[family-name:var(--font-mono-pl)]'>
            {summaries.length}
          </span>
        </div>
        {onClosePanel ? (
          <Button
            type='button'
            size='sm'
            variant='ghost'
            className='shrink-0 gap-1 h-8 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
            onClick={onClosePanel}
            aria-label='Hide AI panel'
          >
            <PanelRightClose className='w-4 h-4' />
            <span className='hidden sm:inline text-xs'>Hide</span>
          </Button>
        ) : null}
      </div>

      <div className='flex-1 overflow-auto p-4 space-y-2'>
        {summaries.map((summary) => (
          <SummaryCard
            key={summary.id}
            summary={summary}
            onRemove={onRemoveSummary}
            onCopy={handleCopyResponse}
          />
        ))}
      </div>
    </div>
  );
};
