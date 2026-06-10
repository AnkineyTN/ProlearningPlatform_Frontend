import { useState, useEffect, useMemo } from 'react';
import { Medal } from 'lucide-react';
import type { Card, GameHistoryItem } from '@/services/types/flashcard.types';
import {
  useGameHistory,
  useGameRanking,
  useSaveGameResult,
} from '@/hooks/useFlashcards';

export interface MatchingCard {
  id: string;
  content: string;
  type: 'term' | 'definition';
  originalId: number;
  isMatched: boolean;
}

export type GameTab = 'ranking' | 'history' | 'mistakes';

interface UseMatchingGameProps {
  setId: number;
  flashcardId: number | string;
  privacy: 'PUBLIC' | 'PRIVATE';
  flashcards: Card[];
}

export const useMatchingGame = ({
  setId,
  flashcardId,
  privacy,
  flashcards,
}: UseMatchingGameProps) => {
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
  const [streak, setStreak] = useState(0);
  const [shakingCards, setShakingCards] = useState<Set<string>>(new Set());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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

  // Countdown: 3 → 2 → 1 → 0 ("Go!") → start timer
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
      return () => clearTimeout(t);
    }
    // countdown === 0: show "Go!" for 600ms then start
    const t = setTimeout(() => {
      setCountdown(null);
      setStartTime(Date.now());
    }, 600);
    return () => clearTimeout(t);
  }, [countdown]);

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
    setStreak(0);
    setShakingCards(new Set());
    setShowConfetti(false);
    setIsGameStarted(true);
    setCountdown(3);
  };

  const handleCardClick = (cardId: string) => {
    if (!startTime) return;
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
          setStreak((s) => s + 1);
          if (newMatchedPairs.size === Math.min(flashcards.length, 6)) {
            setShowConfetti(true);
            setTimeout(() => setEndTime(Date.now()), 700);
          }
        } else {
          setShakingCards(new Set([firstId, secondId]));
          setTimeout(() => setShakingCards(new Set()), 500);
          setWrongCardCounts((prev) => {
            const next = { ...prev };
            const firstKey = String(firstCard.originalId);
            const secondKey = String(secondCard.originalId);
            next[firstKey] = (next[firstKey] ?? 0) + 1;
            next[secondKey] = (next[secondKey] ?? 0) + 1;
            return next;
          });
          setStreak(0);
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
      'p-4 rounded-xl border cursor-pointer transition-colors duration-150 text-center flex items-center justify-center min-h-[100px] select-none';

    if (card.isMatched) {
      return `${base} bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] opacity-60 cursor-default animate-[pop-match_0.4s_ease-out_forwards]`;
    }

    if (shakingCards.has(card.id)) {
      return `${base} bg-[var(--pl-danger-soft)] border-[var(--pl-danger)] animate-[shake_0.5s_ease-in-out]`;
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
            ? 'bg-[var(--pl-accent-soft)] border-[var(--pl-accent)] scale-105 shadow-md'
            : 'bg-[var(--pl-danger-soft)] border-[var(--pl-danger)]'
        }`;
      }
      return `${base} bg-[var(--pl-warning-soft)] border-[var(--pl-warning)] scale-105 shadow-md`;
    }

    return `${base} bg-[var(--pl-bg)] border-border hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5`;
  };

  const getRankMedal = (rank: number) => {
    const colors = [
      'text-[var(--pl-warning)]',
      'text-[var(--pl-text-muted)]',
      'text-[var(--pl-warning)]/70',
    ];
    if (rank <= 3) return <Medal className={`w-4 h-4 ${colors[rank - 1]}`} />;
    return (
      <span className='w-4 text-center text-xs font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
        {rank}
      </span>
    );
  };

  return {
    // State
    cards,
    selectedCards,
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
    // Setters
    setIsGameStarted,
    setExpandedHistoryId,
    setShowAllPlays,
    setActiveTab,
    // Actions
    initializeGame,
    handleCardClick,
    // Formatters
    formatTime,
    formatSeconds,
    // Style helpers
    getCardStyle,
    getRankMedal,
    // Data
    rankingData,
    historyData,
    cardMap,
    aggregatedMistakes,
    isPublic,
  };
};
