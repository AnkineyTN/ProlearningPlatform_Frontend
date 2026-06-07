import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Card, GameHistoryItem } from '@/services/types/flashcard.types';

interface MatchingRecentPlaysProps {
  allHistory: GameHistoryItem[];
  visiblePlays: GameHistoryItem[];
  showAllPlays: boolean;
  expandedHistoryId: number | null;
  cardMap: Map<string, Card>;
  maxHistDuration: number;
  formatSeconds: (seconds: number) => string;
  onToggleShowAll: () => void;
  onToggleExpand: (id: number | null) => void;
}

const MatchingRecentPlays = ({
  allHistory,
  visiblePlays,
  showAllPlays,
  expandedHistoryId,
  cardMap,
  maxHistDuration,
  formatSeconds,
  onToggleShowAll,
  onToggleExpand,
}: MatchingRecentPlaysProps) => {
  if (allHistory.length === 0) return null;

  return (
    <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
      <div className='flex items-center justify-between mb-4'>
        <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
          RECENT PLAYS
        </p>
        {allHistory.length > 4 && (
          <button
            type='button'
            onClick={onToggleShowAll}
            className='text-xs text-muted-foreground hover:text-foreground cursor-pointer'
          >
            {showAllPlays ? 'Show less' : 'View all'}
          </button>
        )}
      </div>
      <div className='space-y-1'>
        {visiblePlays.map((item, idx) => {
          const wrongEntries = Object.entries(item.wrongCardCounts ?? {}).sort(
            (a, b) => b[1] - a[1],
          );
          const totalWrong = wrongEntries.reduce((s, [, c]) => s + c, 0);
          const isPerfectRun = totalWrong === 0;
          const barWidth = Math.max(
            6,
            (item.durationSeconds / maxHistDuration) * 100,
          );
          const isExpanded = expandedHistoryId === item.id;
          const canExpand = wrongEntries.length > 0;
          const d = new Date(item.completedAt);
          const dateLabel = `${d.getMonth() + 1}/${d.getDate()}, ${String(
            d.getHours(),
          ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

          return (
            <div key={item.id}>
              <button
                type='button'
                onClick={() =>
                  canExpand && onToggleExpand(isExpanded ? null : item.id)
                }
                className={`w-full flex items-center gap-4 py-3 px-3 text-left rounded-xl transition-colors ${
                  idx === 0
                    ? 'border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft-2)]'
                    : 'border border-transparent'
                } ${
                  canExpand
                    ? 'cursor-pointer hover:bg-bg-hover/30'
                    : 'cursor-default'
                }`}
              >
                <span className='w-8 text-center text-xs font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
                  #{idx + 1}
                </span>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm mb-1.5 font-[family-name:var(--font-mono-pl)]'>
                    {dateLabel}
                  </p>
                  <div className='h-1 w-full bg-border/40 rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full ${
                        isPerfectRun ? 'bg-[var(--pl-accent)]' : 'bg-[var(--pl-danger)]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span className='text-xs text-muted-foreground whitespace-nowrap'>
                  {item.totalCards} cards
                </span>
                <span
                  className={`font-[family-name:var(--font-mono-pl)] text-xs w-20 text-right whitespace-nowrap ${
                    isPerfectRun ? 'text-[var(--pl-accent)]' : 'text-[var(--pl-danger)]'
                  }`}
                >
                  {isPerfectRun ? 'perfect' : `${totalWrong} wrong`}
                </span>
                <span className='font-[family-name:var(--font-mono-pl)] text-sm w-12 text-right'>
                  {formatSeconds(item.durationSeconds)}
                </span>
                <span className='w-4 flex items-center justify-center text-muted-foreground'>
                  {canExpand ? (
                    isExpanded ? (
                      <ChevronDown className='w-4 h-4' />
                    ) : (
                      <ChevronRight className='w-4 h-4' />
                    )
                  ) : null}
                </span>
              </button>

              {isExpanded && canExpand && (
                <div className='ml-12 mr-2 mt-2 mb-2 px-3 py-3 rounded-lg border border-border space-y-2 bg-[var(--pl-bg)]/60'>
                  <p className='text-xs text-muted-foreground mb-1'>
                    Cards you got wrong:
                  </p>
                  {wrongEntries.map(([cardId, count]) => {
                    const card = cardMap.get(cardId);
                    return (
                      <div
                        key={cardId}
                        className='flex items-center gap-3 p-2 rounded-md bg-[var(--pl-danger-soft)] border border-[var(--pl-danger-border)]'
                      >
                        <div className='flex-1 min-w-0'>
                          {card ? (
                            <>
                              <p className='text-sm font-medium truncate'>
                                {card.frontCard}
                              </p>
                              <p className='text-xs text-muted-foreground truncate'>
                                {card.backCard}
                              </p>
                            </>
                          ) : (
                            <p className='text-sm text-muted-foreground'>
                              Card #{cardId} (no longer available)
                            </p>
                          )}
                        </div>
                        <span className='text-xs font-[family-name:var(--font-mono-pl)] text-[var(--pl-danger)] bg-[var(--pl-danger)]/15 px-2 py-1 rounded'>
                          ×{count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingRecentPlays;
