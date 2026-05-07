import { useState, useEffect } from 'react';
import { Trophy, Clock, Medal, ArrowLeft, RotateCcw } from 'lucide-react';
import type { Card } from '@/services/types/flashcard.types';
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
  onBack: () => void;
};

interface MatchingCard {
  id: string;
  content: string;
  type: 'term' | 'definition';
  originalId: number;
  isMatched: boolean;
}

type GameTab = 'ranking' | 'history';

const MatchingView = ({
  setId,
  flashcardId,
  privacy,
  flashcards,
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

  const saveGameResult = useSaveGameResult();
  const isPublic = privacy === 'PUBLIC';

  const { data: rankingData, refetch: refetchRanking } = useGameRanking(
    Number(setId),
    flashcardId,
    false,
  );
  const { data: historyData, refetch: refetchHistory } = useGameHistory(
    Number(setId),
    flashcardId,
    false,
  );

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
    const totalTime = endTime - startTime;
    const tabs: GameTab[] = isPublic ? ['ranking', 'history'] : ['history'];
    const tabLabels: Record<GameTab, string> = {
      ranking: 'Ranking',
      history: 'My History',
    };

    return (
      <div className='max-w-3xl mx-auto px-6 py-10'>
        {/* Result hero */}
        <div className='text-center mb-10'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-5'>
            <Trophy className='w-10 h-10 text-yellow-500' />
          </div>
          <h2 className='font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight mb-2'>
            Congratulations!
          </h2>
          <p className='text-muted-foreground'>
            You completed the matching game
          </p>

          <div className='inline-flex items-center gap-3 mt-6 bg-[var(--pl-bg)] border border-border rounded-xl px-8 py-4'>
            <Clock className='w-5 h-5 text-text-selected' />
            <span className='font-[family-name:var(--font-mono-pl)] text-2xl font-medium text-text-selected'>
              {formatTime(totalTime)}
            </span>
          </div>

          <div className='flex gap-3 justify-center mt-6'>
            <Button
              onClick={() => {
                setIsGameStarted(false);
                initializeGame();
              }}
              className='gap-2'
            >
              <RotateCcw className='w-4 h-4' />
              Play Again
            </Button>
            <Button variant='outline' onClick={onBack} className='gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Back to Home
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-border mb-6 flex gap-1'>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
                activeTab === tab
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabLabels[tab]}
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

        {/* History */}
        {activeTab === 'history' && (
          <div className='space-y-2'>
            {!historyData?.data || historyData.data.length === 0 ? (
              <p className='text-center text-muted-foreground py-10 text-sm'>
                No history yet.
              </p>
            ) : (
              historyData.data.map((item, idx) => (
                <div
                  key={item.id}
                  className='flex items-center gap-4 p-3.5 rounded-xl bg-[var(--pl-bg)] border border-border'
                >
                  <span className='w-6 text-center text-xs font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
                    #{idx + 1}
                  </span>
                  <div className='flex-1'>
                    <span className='text-sm text-muted-foreground'>
                      {new Date(item.completedAt).toLocaleString()}
                    </span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    {item.totalCards} cards
                  </span>
                  <div className='flex items-center gap-1.5 text-text-selected font-[family-name:var(--font-mono-pl)] text-sm font-medium'>
                    <Clock className='w-3.5 h-3.5' />
                    {formatSeconds(item.durationSeconds)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
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
