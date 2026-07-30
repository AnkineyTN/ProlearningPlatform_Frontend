import type { Card } from '@/services/types/flashcard.types';
import { useMatchingGame } from './MatchingView/useMatchingGame';
import type { GameTab } from './MatchingView/useMatchingGame';
import MatchingEmptyState from './MatchingView/EmptyState';
import MatchingGameBoard from './MatchingView/GameBoard';
import MatchingResultsHero from './MatchingView/ResultsHero';
import MatchingResultsStats from './MatchingView/ResultsStats';
import MatchingTrendChart from './MatchingView/TrendChart';
import MatchingRecentPlays from './MatchingView/RecentPlays';
import MatchingSecondaryTabs from './MatchingView/SecondaryTabs';
import { useTranslation } from 'react-i18next';

type Props = {
  setId: number;
  flashcardId: number | string;
  privacy: 'PUBLIC' | 'PRIVATE';
  flashcards: Card[];
  flashcardTitle?: string;
  onBack: () => void;
};

const MatchingView = ({
  setId,
  flashcardId,
  privacy,
  flashcards,
  flashcardTitle,
  onBack,
}: Props) => {
  const { t } = useTranslation();

  const {
    cards,
    matchedPairs,
    startTime,
    endTime,
    isGameStarted,
    timer,
    wrongCardCounts,
    expandedHistoryId,
    snapshotPrevRun,
    showAllPlays,
    activeTab,
    streak,
    countdown,
    showConfetti,
    cardCount,
    setIsGameStarted,
    setExpandedHistoryId,
    setShowAllPlays,
    setActiveTab,
    initializeGame,
    handleCardClick,
    formatTime,
    formatSeconds,
    getCardStyle,
    getRankMedal,
    rankingData,
    historyData,
    cardMap,
    aggregatedMistakes,
    isPublic,
  } = useMatchingGame({ setId, flashcardId, privacy, flashcards });

  // ── Results screen ────────────────────────────────────────────────────────
  if (endTime && startTime) {
    const totalTimeMs = endTime - startTime;
    const totalDurationSec = Math.round(totalTimeMs / 1000);
    const totalPairs = cardCount;
    const wrongPicks = Math.round(
      Object.values(wrongCardCounts).reduce((a, b) => a + b, 0) / 2,
    );
    const totalAttempts = totalPairs + wrongPicks;
    const accuracy =
      totalAttempts > 0 ? Math.round((totalPairs / totalAttempts) * 100) : 100;
    const isPerfect = wrongPicks === 0;
    const matchesPerMin =
      totalDurationSec > 0
        ? Math.round((totalPairs / totalDurationSec) * 60)
        : 0;

    const heroTitle = isPerfect
      ? t('flashcard.matching.results.perfectTitle')
      : accuracy >= 80
        ? t('flashcard.matching.results.greatTitle')
        : t('flashcard.matching.results.keepPracticingTitle');
    const heroSubtitle = isPerfect
      ? t(
          flashcardTitle
            ? 'flashcard.matching.results.perfectSubtitleWithTitle'
            : 'flashcard.matching.results.perfectSubtitle',
          { count: totalPairs, title: flashcardTitle },
        )
      : t(
          flashcardTitle
            ? 'flashcard.matching.results.subtitleWithTitle'
            : 'flashcard.matching.results.subtitle',
          { count: totalPairs, title: flashcardTitle, mistakes: wrongPicks },
        );

    const lastRun = snapshotPrevRun;
    let timeBadge: { text: string; kind: 'down' | 'up' } | null = null;
    if (lastRun && lastRun.durationSeconds > 0) {
      const diff = totalDurationSec - lastRun.durationSeconds;
      if (diff < 0) {
        const pct = Math.round(
          (Math.abs(diff) / lastRun.durationSeconds) * 100,
        );
        timeBadge = {
          text: t('flashcard.matching.results.faster', { percent: pct }),
          kind: 'down',
        };
      } else if (diff > 0) {
        const pct = Math.round((diff / lastRun.durationSeconds) * 100);
        timeBadge = {
          text: t('flashcard.matching.results.slower', { percent: pct }),
          kind: 'up',
        };
      }
    }

    const allHistory = historyData?.data ?? [];
    const trendRuns = [...allHistory].slice(0, 8).reverse();
    const trendValues = trendRuns.map((r) => r.durationSeconds);
    const minDur = trendValues.length ? Math.min(...trendValues) : 0;
    const maxDur = trendValues.length ? Math.max(...trendValues) : 1;
    const trendW = 600;
    const trendH = 100;
    const padX = 12;
    const padY = 14;
    const range = Math.max(1, maxDur - minDur);
    const trendPoints = trendValues.map((v, i) => {
      const x =
        padX + (i / Math.max(1, trendValues.length - 1)) * (trendW - 2 * padX);
      const y = padY + (1 - (v - minDur) / range) * (trendH - 2 * padY);
      return { x, y };
    });
    const improving =
      trendValues.length >= 2 &&
      trendValues[trendValues.length - 1] < trendValues[0];

    const maxHistDuration = Math.max(
      1,
      ...allHistory.map((r) => r.durationSeconds),
    );
    const visiblePlays = showAllPlays ? allHistory : allHistory.slice(0, 4);

    const tabs: GameTab[] = isPublic ? ['ranking', 'mistakes'] : ['mistakes'];
    const secondaryTab: GameTab =
      activeTab === 'ranking' || activeTab === 'mistakes'
        ? activeTab
        : isPublic
          ? 'ranking'
          : 'mistakes';

    return (
      <div className='max-w-4xl mx-auto px-6 py-10 space-y-5'>
        <MatchingResultsHero
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          accuracy={accuracy}
          isPerfect={isPerfect}
          totalPairs={totalPairs}
          onPlayAgain={() => {
            setIsGameStarted(false);
            initializeGame();
          }}
          onBack={onBack}
        />

        <MatchingResultsStats
          totalTimeMs={totalTimeMs}
          totalPairs={totalPairs}
          wrongPicks={wrongPicks}
          accuracy={accuracy}
          isPerfect={isPerfect}
          matchesPerMin={matchesPerMin}
          flashcardTitle={flashcardTitle}
          lastRun={lastRun}
          timeBadge={timeBadge}
          formatTime={formatTime}
          formatSeconds={formatSeconds}
        />

        <MatchingTrendChart
          trendValues={trendValues}
          trendPoints={trendPoints}
          improving={improving}
          trendW={trendW}
          trendH={trendH}
          padY={padY}
          formatSeconds={formatSeconds}
        />

        <MatchingRecentPlays
          allHistory={allHistory}
          visiblePlays={visiblePlays}
          showAllPlays={showAllPlays}
          expandedHistoryId={expandedHistoryId}
          cardMap={cardMap}
          maxHistDuration={maxHistDuration}
          formatSeconds={formatSeconds}
          onToggleShowAll={() => setShowAllPlays((v) => !v)}
          onToggleExpand={(id) => setExpandedHistoryId(id)}
        />

        <MatchingSecondaryTabs
          tabs={tabs}
          activeTab={secondaryTab}
          isPublic={isPublic}
          rankingData={rankingData}
          aggregatedMistakes={aggregatedMistakes}
          cardMap={cardMap}
          onTabChange={(tab) => setActiveTab(tab)}
          getRankMedal={getRankMedal}
          formatSeconds={formatSeconds}
        />
      </div>
    );
  }

  // ── Pre-game / empty state ────────────────────────────────────────────────
  if (!isGameStarted || flashcards.length === 0) {
    return (
      <MatchingEmptyState
        hasCards={flashcards.length > 0}
        onStart={initializeGame}
        onBack={onBack}
      />
    );
  }

  // ── Active game board ─────────────────────────────────────────────────────
  const totalPairs = cardCount;

  return (
    <MatchingGameBoard
      cards={cards}
      matchedPairs={matchedPairs}
      totalPairs={totalPairs}
      timer={timer}
      streak={streak}
      countdown={countdown}
      showConfetti={showConfetti}
      formatTime={formatTime}
      getCardStyle={getCardStyle}
      onCardClick={handleCardClick}
      onBack={onBack}
    />
  );
};

export default MatchingView;
