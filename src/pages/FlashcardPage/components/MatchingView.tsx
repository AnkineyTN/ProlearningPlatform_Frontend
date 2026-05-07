import { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Medal,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Layers,
  Zap,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  Card,
  GameHistoryItem,
} from '@/services/types/flashcard.types';
import { Button } from '@/components/ui/button';
import {
  useGameHistory,
  useGameRanking,
  useSaveGameResult,
} from '@/hooks/useFlashcards';

type Props = {
  setId: number;
  flashcardId: number | string;
  privacy: 'PUBLIC' | 'PRIVATE';
  flashcards: Card[];
  flashcardTitle?: string;
  onBack: () => void;
};

interface MatchingCard {
  id: string;
  content: string;
  type: 'term' | 'definition';
  originalId: number;
  isMatched: boolean;
}

type GameTab = 'ranking' | 'history' | 'mistakes';

const MatchingView = ({
  setId,
  flashcardId,
  privacy,
  flashcards,
  flashcardTitle,
  onBack,
}: Props) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<GameTab>('history');
  const [wrongCardCounts, setWrongCardCounts] = useState<
    Record<string, number>
  >({});
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(
    null,
  );
  const [snapshotPrevRun, setSnapshotPrevRun] =
    useState<GameHistoryItem | null>(null);
  const [showAllPlays, setShowAllPlays] = useState(false);

  const saveGameResult = useSaveGameResult();
  const isPublic = privacy === 'PUBLIC';

  const { data: rankingData, refetch: refetchRanking } = useGameRanking(
    Number(setId),
    flashcardId,
    isPublic,
  );
  const { data: historyData, refetch: refetchHistory } = useGameHistory(
    Number(setId),
    flashcardId,
    true,
  );

  const cardMap = useMemo(() => {
    const map = new Map<string, Card>();
    flashcards.forEach((c) => map.set(String(c.id), c));
    return map;
  }, [flashcards]);

  const aggregatedMistakes = useMemo(() => {
    const totals: Record<string, number> = {};
    historyData?.data?.forEach((item) => {
      Object.entries(item.wrongCardCounts ?? {}).forEach(([cardId, count]) => {
        totals[cardId] = (totals[cardId] ?? 0) + count;
      });
    });
    return Object.entries(totals)
      .map(([cardId, count]) => ({ cardId, count }))
      .sort((a, b) => b.count - a.count);
  }, [historyData]);

  useEffect(() => {
    if (flashcards.length > 0 && !isGameStarted) {
      initializeGame();
    }
  }, [flashcards, isGameStarted]);

  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        setTimer(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (endTime && startTime && !resultSaved) {
      const durationSeconds = Math.round((endTime - startTime) / 1000);
      const totalCards = Math.min(flashcards.length, 6);
      setSnapshotPrevRun(historyData?.data?.[0] ?? null);
      setResultSaved(true);
      saveGameResult.mutate(
        {
          setId: Number(setId),
          flashcardId,
          data: { totalCards, durationSeconds, wrongCardCounts },
        },
        {
          onSuccess: () => {
            refetchHistory();
            if (isPublic) refetchRanking();
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime]);

  const initializeGame = () => {
    const selectedFlashcards = flashcards.slice(0, 6);
    const termCards: MatchingCard[] = selectedFlashcards.map((card) => ({
      id: `term-${card.id}`,
      content: card.frontCard,
      type: 'term' as const,
      originalId: card.id,
      isMatched: false,
    }));
    const definitionCards: MatchingCard[] = selectedFlashcards.map((card) => ({
      id: `def-${card.id}`,
      content: card.backCard,
      type: 'definition' as const,
      originalId: card.id,
      isMatched: false,
    }));
    const allCards = [...termCards, ...definitionCards];
    const shuffled = allCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs(new Set());
    setStartTime(null);
    setEndTime(null);
    setTimer(0);
    setResultSaved(false);
    setWrongCardCounts({});
    setIsGameStarted(true);
  };

  const handleCardClick = (cardId: string) => {
    if (!startTime) setStartTime(Date.now());
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched) return;
    if (selectedCards.length >= 2) return;
    if (selectedCards.includes(cardId)) return;

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard) {
        const isMatch =
          firstCard.originalId === secondCard.originalId &&
          firstCard.type !== secondCard.type;

        if (isMatch) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstId || c.id === secondId
                ? { ...c, isMatched: true }
                : c,
            ),
          );
          const newMatchedPairs = new Set(matchedPairs);
          newMatchedPairs.add(firstCard.originalId);
          setMatchedPairs(newMatchedPairs);
          setSelectedCards([]);
          if (newMatchedPairs.size === Math.min(flashcards.length, 6)) {
            setEndTime(Date.now());
          }
        } else {
          setWrongCardCounts((prev) => {
            const next = { ...prev };
            const firstKey = String(firstCard.originalId);
            const secondKey = String(secondCard.originalId);
            next[firstKey] = (next[firstKey] ?? 0) + 1;
            next[secondKey] = (next[secondKey] ?? 0) + 1;
            return next;
          });
          setTimeout(() => setSelectedCards([]), 500);
        }
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getCardStyle = (card: MatchingCard): string => {
    const base =
      'p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center flex items-center justify-center min-h-[100px] select-none';

    if (card.isMatched) {
      return `${base} bg-bg-info/40 border-text-info/40 opacity-60 cursor-default scale-95`;
    }

    if (selectedCards.includes(card.id)) {
      const otherId = selectedCards.find((id) => id !== card.id);
      if (otherId) {
        const other = cards.find((c) => c.id === otherId);
        const isMatch =
          other &&
          card.originalId === other.originalId &&
          card.type !== other.type;
        return `${base} ${
          isMatch
            ? 'bg-bg-info border-text-info scale-105 shadow-md'
            : 'bg-bg-error border-text-error'
        }`;
      }
      return `${base} bg-card-selected border-text-selected scale-105 shadow-md`;
    }

    return `${base} bg-[var(--pl-bg)] border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5`;
  };

  const getRankMedal = (rank: number) => {
    const colors = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];
    if (rank <= 3) return <Medal className={`w-4 h-4 ${colors[rank - 1]}`} />;
    return (
      <span className='w-4 text-center text-xs font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
        {rank}
      </span>
    );
  };

  // Results screen
  if (endTime && startTime) {
    const totalTimeMs = endTime - startTime;
    const totalDurationSec = Math.round(totalTimeMs / 1000);
    const totalPairs = Math.min(flashcards.length, 6);
    const wrongPicks = Math.round(
      Object.values(wrongCardCounts).reduce((a, b) => a + b, 0) / 2,
    );
    const totalAttempts = totalPairs + wrongPicks;
    const accuracy =
      totalAttempts > 0
        ? Math.round((totalPairs / totalAttempts) * 100)
        : 100;
    const isPerfect = wrongPicks === 0;
    const matchesPerMin =
      totalDurationSec > 0
        ? Math.round((totalPairs / totalDurationSec) * 60)
        : 0;

    const heroTitle = isPerfect
      ? 'Nicely done.'
      : accuracy >= 80
        ? 'Great run.'
        : 'Keep practicing.';
    const setLabel = flashcardTitle ? ` in ${flashcardTitle}` : '';
    const heroSubtitle = isPerfect
      ? `You matched all ${totalPairs} cards${setLabel} without a single mistake.`
      : `You matched ${totalPairs} cards${setLabel} with ${wrongPicks} ${
          wrongPicks === 1 ? 'mistake' : 'mistakes'
        }.`;

    const lastRun = snapshotPrevRun;
    let timeBadge: { text: string; kind: 'down' | 'up' } | null = null;
    if (lastRun && lastRun.durationSeconds > 0) {
      const diff = totalDurationSec - lastRun.durationSeconds;
      if (diff < 0) {
        const pct = Math.round(
          (Math.abs(diff) / lastRun.durationSeconds) * 100,
        );
        timeBadge = { text: `${pct}% faster`, kind: 'down' };
      } else if (diff > 0) {
        const pct = Math.round((diff / lastRun.durationSeconds) * 100);
        timeBadge = { text: `${pct}% slower`, kind: 'up' };
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
        padX +
        (i / Math.max(1, trendValues.length - 1)) * (trendW - 2 * padX);
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
    const tabLabels: Record<GameTab, string> = {
      ranking: 'Ranking',
      history: 'My History',
      mistakes: 'Mistakes',
    };
    const secondaryTab: GameTab =
      activeTab === 'ranking' || activeTab === 'mistakes'
        ? activeTab
        : isPublic
          ? 'ranking'
          : 'mistakes';

    return (
      <div className='max-w-4xl mx-auto px-6 py-10 space-y-5'>
        {/* Hero card */}
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
                  strokeDasharray={`${(accuracy / 100) * (2 * Math.PI * 90)} ${
                    2 * Math.PI * 90
                  }`}
                  transform='rotate(-90 110 110)'
                  style={{
                    filter: `drop-shadow(0 0 8px ${
                      isPerfect
                        ? 'rgba(34,197,94,0.55)'
                        : 'rgba(239,68,68,0.45)'
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
                onClick={() => {
                  setIsGameStarted(false);
                  initializeGame();
                }}
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

        {/* Stats row */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* TIME */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-bg-info/30 flex items-center justify-center'>
                <Clock className='w-4 h-4 text-text-info' />
              </div>
              {timeBadge && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
                    timeBadge.kind === 'down'
                      ? 'border-green-500/30 bg-green-500/10 text-green-500'
                      : 'border-red-500/30 bg-red-500/10 text-red-500'
                  }`}
                >
                  {timeBadge.kind === 'down' ? (
                    <TrendingDown className='w-3 h-3' />
                  ) : (
                    <TrendingUp className='w-3 h-3' />
                  )}
                  {timeBadge.text}
                </span>
              )}
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              TIME
            </p>
            <p className='font-[family-name:var(--font-mono-pl)] text-3xl font-medium mb-1'>
              {formatTime(totalTimeMs)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {lastRun
                ? `vs last run · ${formatSeconds(lastRun.durationSeconds)}`
                : 'first run'}
            </p>
          </div>

          {/* CARDS REVIEWED */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-muted flex items-center justify-center'>
                <Layers className='w-4 h-4 text-muted-foreground' />
              </div>
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              CARDS REVIEWED
            </p>
            <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
              {totalPairs}{' '}
              <span className='text-base text-muted-foreground'>cards</span>
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {flashcardTitle ? `${flashcardTitle} · ` : ''}
              {isPerfect
                ? 'all matched'
                : `${wrongPicks} mistake${wrongPicks === 1 ? '' : 's'}`}
            </p>
          </div>

          {/* MATCHES / MIN */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <div className='w-9 h-9 rounded-lg bg-muted flex items-center justify-center'>
                <Zap className='w-4 h-4 text-muted-foreground' />
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${
                  isPerfect
                    ? 'border-green-500/30 bg-green-500/10 text-green-500'
                    : 'border-red-500/30 bg-red-500/10 text-red-500'
                }`}
              >
                {isPerfect ? (
                  <TrendingDown className='w-3 h-3' />
                ) : (
                  <TrendingUp className='w-3 h-3' />
                )}
                {accuracy}% acc
              </span>
            </div>
            <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
              MATCHES / MIN
            </p>
            <p className='font-[family-name:var(--font-display)] text-3xl font-medium mb-1'>
              {matchesPerMin}
            </p>
            <p className='text-xs text-muted-foreground'>
              {wrongPicks > 0
                ? `${wrongPicks} wrong pick${wrongPicks === 1 ? '' : 's'}`
                : 'flawless run'}
            </p>
          </div>
        </div>

        {/* Trend chart */}
        {trendValues.length >= 2 && (
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-start justify-between mb-2'>
              <div>
                <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
                  LAST {trendValues.length} RUNS · TIME TO COMPLETE
                </p>
                <p className='text-sm text-muted-foreground'>
                  {improving
                    ? 'Trending down — keep at it.'
                    : 'Time creeping up — focus on the cards you miss most.'}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
                  improving
                    ? 'border-green-500/30 bg-green-500/10 text-green-500'
                    : 'border-red-500/30 bg-red-500/10 text-red-500'
                }`}
              >
                {improving ? (
                  <TrendingDown className='w-3 h-3' />
                ) : (
                  <TrendingUp className='w-3 h-3' />
                )}
                {improving ? 'Improving' : 'Watch out'}
              </span>
            </div>

            <div className='relative h-28 mt-4'>
              <svg
                width='100%'
                height='100%'
                viewBox={`0 0 ${trendW} ${trendH}`}
                preserveAspectRatio='none'
              >
                <defs>
                  <linearGradient id='trendFill' x1='0' x2='0' y1='0' y2='1'>
                    <stop offset='0%' stopColor='#22c55e' stopOpacity='0.25' />
                    <stop offset='100%' stopColor='#22c55e' stopOpacity='0' />
                  </linearGradient>
                </defs>
                <path
                  d={`M ${trendPoints[0].x},${trendH - padY} ${trendPoints
                    .map((p) => `L ${p.x},${p.y}`)
                    .join(' ')} L ${
                    trendPoints[trendPoints.length - 1].x
                  },${trendH - padY} Z`}
                  fill='url(#trendFill)'
                />
                <path
                  d={trendPoints
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
                    .join(' ')}
                  fill='none'
                  stroke='#22c55e'
                  strokeWidth='2'
                />
                {trendPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={i === trendPoints.length - 1 ? 5 : 3}
                    fill={
                      i === trendPoints.length - 1
                        ? '#22c55e'
                        : 'var(--pl-bg)'
                    }
                    stroke='#22c55e'
                    strokeWidth='2'
                  />
                ))}
              </svg>
              <span className='absolute right-1 bottom-1 text-xs font-[family-name:var(--font-mono-pl)] text-text-selected'>
                {formatSeconds(trendValues[trendValues.length - 1])}
              </span>
            </div>
          </div>
        )}

        {/* Recent plays */}
        {allHistory.length > 0 && (
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            <div className='flex items-center justify-between mb-4'>
              <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                RECENT PLAYS
              </p>
              {allHistory.length > 4 && (
                <button
                  type='button'
                  onClick={() => setShowAllPlays((v) => !v)}
                  className='text-xs text-muted-foreground hover:text-foreground cursor-pointer'
                >
                  {showAllPlays ? 'Show less' : 'View all'}
                </button>
              )}
            </div>
            <div className='space-y-1'>
              {visiblePlays.map((item, idx) => {
                const wrongEntries = Object.entries(
                  item.wrongCardCounts ?? {},
                ).sort((a, b) => b[1] - a[1]);
                const totalWrong = wrongEntries.reduce(
                  (s, [, c]) => s + c,
                  0,
                );
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
                ).padStart(2, '0')}:${String(d.getMinutes()).padStart(
                  2,
                  '0',
                )}`;

                return (
                  <div key={item.id}>
                    <button
                      type='button'
                      onClick={() =>
                        canExpand &&
                        setExpandedHistoryId(isExpanded ? null : item.id)
                      }
                      className={`w-full flex items-center gap-4 py-3 px-3 text-left rounded-xl transition-colors ${
                        idx === 0
                          ? 'border border-green-500/30 bg-green-500/[0.04]'
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
                              isPerfectRun ? 'bg-green-500' : 'bg-red-500'
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
                          isPerfectRun ? 'text-green-500' : 'text-red-500'
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
                              className='flex items-center gap-3 p-2 rounded-md bg-red-500/10 border border-red-500/20'
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
                              <span className='text-xs font-[family-name:var(--font-mono-pl)] text-red-500 bg-red-500/15 px-2 py-1 rounded'>
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
        )}

        {/* Secondary tabs (Ranking + Mistakes) */}
        <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
          <div className='border-b border-border mb-4 flex gap-1'>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                  secondaryTab === tab
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Ranking */}
          {secondaryTab === 'ranking' && isPublic && (
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
          {secondaryTab === 'mistakes' && (
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
      </div>
    );
  }

  // Not started / no cards
  if (!isGameStarted || flashcards.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 text-center'>
        <div className='w-20 h-20 rounded-2xl bg-[var(--pl-bg)] border border-border flex items-center justify-center mb-6'>
          <div className='grid grid-cols-2 gap-1'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='w-4 h-4 rounded bg-border' />
            ))}
          </div>
        </div>
        <h2 className='font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight mb-2'>
          Matching Game
        </h2>
        <p className='text-muted-foreground mb-8 max-w-xs'>
          {flashcards.length === 0
            ? 'No flashcards available to play.'
            : 'Match terms with their definitions as fast as you can.'}
        </p>
        <div className='flex gap-3'>
          {flashcards.length > 0 && (
            <Button onClick={initializeGame} className='px-6'>
              Start Game
            </Button>
          )}
          <Button variant='outline' onClick={onBack} className='gap-2 px-6'>
            <ArrowLeft className='w-4 h-4' />
            Back
          </Button>
        </div>
      </div>
    );
  }

  const totalPairs = Math.min(flashcards.length, 6);

  // Playing
  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight'>
            Matching Game
          </h2>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Match terms with their definitions
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {/* Timer */}
          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <Clock className='w-4 h-4 text-muted-foreground' />
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-text-selected'>
              {formatTime(timer)}
            </span>
          </div>

          {/* Score */}
          <div className='flex items-center gap-2 bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-2.5'>
            <span className='font-[family-name:var(--font-mono-pl)] text-lg font-medium text-text-info'>
              {matchedPairs.size}
              <span className='text-muted-foreground text-sm'>
                /{totalPairs}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className='h-1 bg-border rounded-full overflow-hidden mb-8'>
        <div
          className='h-full bg-primary transition-all duration-300 rounded-full'
          style={{ width: `${(matchedPairs.size / totalPairs) * 100}%` }}
        />
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-3 gap-3 mb-8'>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={getCardStyle(card)}
          >
            <p className='text-sm font-medium leading-snug'>{card.content}</p>
          </div>
        ))}
      </div>

      {/* Exit */}
      <div className='flex justify-center'>
        <Button variant='outline' onClick={onBack} className='gap-2'>
          <ArrowLeft className='w-4 h-4' />
          Exit Game
        </Button>
      </div>
    </div>
  );
};

export default MatchingView;
