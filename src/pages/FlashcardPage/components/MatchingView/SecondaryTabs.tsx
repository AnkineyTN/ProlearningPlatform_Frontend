import type { ReactNode } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import type { Card, GameRankingItem } from '@/services/types/flashcard.types';
import type { GameTab } from './useMatchingGame';

const TAB_LABELS: Record<GameTab, string> = {
  ranking: 'Ranking',
  history: 'My History',
  mistakes: 'Mistakes',
};

interface AggregatedMistake {
  cardId: string;
  count: number;
}

interface MatchingSecondaryTabsProps {
  tabs: GameTab[];
  activeTab: GameTab;
  isPublic: boolean;
  rankingData: { data: GameRankingItem[] } | undefined;
  aggregatedMistakes: AggregatedMistake[];
  cardMap: Map<string, Card>;
  onTabChange: (tab: GameTab) => void;
  getRankMedal: (rank: number) => ReactNode;
  formatSeconds: (seconds: number) => string;
}

const MatchingSecondaryTabs = ({
  tabs,
  activeTab,
  isPublic,
  rankingData,
  aggregatedMistakes,
  cardMap,
  onTabChange,
  getRankMedal,
  formatSeconds,
}: MatchingSecondaryTabsProps) => {
  return (
    <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
      <div className='border-b border-border mb-4 flex gap-1'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              activeTab === tab
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Ranking */}
      {activeTab === 'ranking' && isPublic && (
        <div className='space-y-2'>
          {!rankingData?.data || rankingData.data.length === 0 ? (
            <p className='text-center text-muted-foreground py-10 text-sm'>
              No rankings yet. Be the first!
            </p>
          ) : (
            rankingData.data.map((item) => (
              <div
                key={item.userId}
                className='flex items-center gap-4 p-3.5 rounded-xl bg-[var(--pl-bg)] border border-border'
              >
                <div className='flex items-center justify-center w-7'>
                  {getRankMedal(item.rank)}
                </div>
                <div className='flex-1 min-w-0'>
                  <span className='font-medium text-sm truncate block'>
                    {item.firstName} {item.lastName}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {item.playCount} {item.playCount === 1 ? 'play' : 'plays'}
                  </span>
                </div>
                <div className='flex items-center gap-1.5 text-text-selected font-[family-name:var(--font-mono-pl)] text-sm font-medium'>
                  <Clock className='w-3.5 h-3.5' />
                  {formatSeconds(item.bestDuration)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Mistakes (aggregated) */}
      {activeTab === 'mistakes' && (
        <div className='space-y-2'>
          {aggregatedMistakes.length === 0 ? (
            <p className='text-center text-muted-foreground py-10 text-sm'>
              No mistakes yet. Nice!
            </p>
          ) : (
            <>
              <p className='text-xs text-muted-foreground mb-2'>
                Cards you got wrong most often, across all plays:
              </p>
              {aggregatedMistakes.map(({ cardId, count }, idx) => {
                const card = cardMap.get(cardId);
                return (
                  <div
                    key={cardId}
                    className='flex items-center gap-3 p-3 rounded-xl bg-[var(--pl-bg)] border border-border'
                  >
                    <span className='w-6 text-center text-xs font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
                      #{idx + 1}
                    </span>
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
                    <span className='inline-flex items-center gap-1 text-xs font-[family-name:var(--font-mono-pl)] font-medium text-text-error bg-bg-error/30 px-2.5 py-1 rounded-md whitespace-nowrap'>
                      <AlertCircle className='w-3 h-3' />×{count}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchingSecondaryTabs;
