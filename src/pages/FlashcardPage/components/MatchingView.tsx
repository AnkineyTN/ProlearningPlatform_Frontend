import { useState, useEffect } from "react";
import { Blocks, Trophy, Clock, Award, Medal } from "lucide-react";
import type { Card } from "@/services/types/flashcard.types";
import { Button } from "@/components/ui/button";
import { useGameHistory, useGameRanking, useSaveGameResult } from "@/hooks/useFlashcards";

type Props = {
  setId: number;
  flashcardId: number | string;
  privacy: "PUBLIC" | "PRIVATE";
  flashcards: Card[];
  onBack: () => void;
};

interface MatchingCard {
  id: string;
  content: string;
  type: "term" | "definition";
  originalId: number;
  isMatched: boolean;
}

type GameTab = "ranking" | "history";

const MatchingView = ({ setId, flashcardId, privacy, flashcards, onBack }: Props) => {
  const [cards, setCards] = useState<MatchingCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resultSaved, setResultSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<GameTab>("history");

  const saveGameResult = useSaveGameResult();
  const isPublic = privacy === "PUBLIC";

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

  // Initialize game
  useEffect(() => {
    if (flashcards.length > 0 && !isGameStarted) {
      initializeGame();
    }
  }, [flashcards, isGameStarted]);

  // Timer
  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        setTimer(Date.now() - startTime);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  // Save result when game ends
  useEffect(() => {
    if (endTime && startTime && !resultSaved) {
      const durationSeconds = Math.round((endTime - startTime) / 1000);
      const totalCards = Math.min(flashcards.length, 6);
      setResultSaved(true);
      saveGameResult.mutate(
        { setId: Number(setId), flashcardId, data: { totalCards, durationSeconds } },
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
      type: "term" as const,
      originalId: card.id,
      isMatched: false,
    }));

    const definitionCards: MatchingCard[] = selectedFlashcards.map((card) => ({
      id: `def-${card.id}`,
      content: card.backCard,
      type: "definition" as const,
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
    setIsGameStarted(true);
  };

  const handleCardClick = (cardId: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

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
          setCards((prevCards) =>
            prevCards.map((c) =>
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
          setTimeout(() => {
            setSelectedCards([]);
          }, 500);
        }
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  const formatSeconds = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getCardClassName = (card: MatchingCard) => {
    const baseClasses =
      "p-4 rounded-lg border-1 cursor-pointer transition-all duration-200 text-center flex items-center justify-center min-h-[100px]";

    if (card.isMatched) {
      return `${baseClasses} bg-bg-info border-text-info opacity-50`;
    }

    if (selectedCards.includes(card.id)) {
      const otherSelectedId = selectedCards.find((id) => id !== card.id);
      if (otherSelectedId) {
        const otherCard = cards.find((c) => c.id === otherSelectedId);
        const isMatch =
          otherCard &&
          card.originalId === otherCard.originalId &&
          card.type !== otherCard.type;

        return `${baseClasses} ${
          isMatch
            ? "bg-bg-info border-text-info scale-105"
            : "bg-bg-error border-text-error"
        }`;
      }
      return `${baseClasses} bg-bg-selected border-text-selected scale-105`;
    }

    return `${baseClasses} bg-card border-border hover:border-blue-400 hover:shadow-md`;
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return <Medal className='w-5 h-5 text-yellow-500' />;
    if (rank === 2) return <Medal className='w-5 h-5 text-gray-400' />;
    if (rank === 3) return <Medal className='w-5 h-5 text-amber-600' />;
    return <span className='w-5 text-center font-bold text-muted-foreground'>{rank}</span>;
  };

  // Game completed
  if (endTime && startTime) {
    const totalTime = endTime - startTime;

    return (
      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='text-center mb-8'>
          <Trophy className='w-20 h-20 mx-auto mb-4 text-yellow-500' />
          <h2 className='text-3xl font-bold mb-2'>Congratulations! 🎉</h2>
          <p className='text-lg text-foreground mb-6'>You completed the matching game!</p>

          <div className='rounded-lg shadow-lg p-6 max-w-xs mx-auto mb-6 bg-card'>
            <div className='flex items-center justify-center gap-2 mb-1'>
              <Clock className='w-5 h-5 text-selected' />
              <span className='text-2xl font-bold text-selected'>{formatTime(totalTime)}</span>
            </div>
            <p className='text-sm text-muted-foreground'>Your Time</p>
          </div>

          <div className='flex gap-4 justify-center mb-8'>
            <Button
              variant='default'
              onClick={() => {
                setIsGameStarted(false);
                initializeGame();
              }}
              className='px-6 cursor-pointer rounded-lg font-semibold'
            >
              Play Again
            </Button>
            <Button
              variant='outline'
              onClick={onBack}
              className='px-6 bg-card cursor-pointer rounded-lg font-semibold'
            >
              Back to Home
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-border mb-6'>
          <div className='flex gap-1'>
            {isPublic && (
              <button
                onClick={() => setActiveTab("ranking")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "ranking"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Ranking
              </button>
            )}
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === "history"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              My History
            </button>
          </div>
        </div>

        {/* Ranking Tab */}
        {activeTab === "ranking" && isPublic && (
          <div>
            {!rankingData?.data || rankingData.data.length === 0 ? (
              <p className='text-center text-muted-foreground py-8'>No rankings yet.</p>
            ) : (
              <div className='space-y-2'>
                {rankingData.data.map((item) => (
                  <div
                    key={item.userId}
                    className='flex items-center gap-4 p-3 rounded-lg bg-card border border-border'
                  >
                    <div className='flex items-center justify-center w-8'>
                      {getRankMedal(item.rank)}
                    </div>
                    <div className='flex-1'>
                      <span className='font-medium'>
                        {item.firstName} {item.lastName}
                      </span>
                      <span className='text-xs text-muted-foreground ml-2'>
                        {item.playCount} {item.playCount === 1 ? "play" : "plays"}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 text-selected font-bold'>
                      <Clock className='w-4 h-4' />
                      {formatSeconds(item.bestDuration)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div>
            {!historyData?.data || historyData.data.length === 0 ? (
              <p className='text-center text-muted-foreground py-8'>No history yet.</p>
            ) : (
              <div className='space-y-2'>
                {historyData.data.map((item, idx) => (
                  <div
                    key={item.id}
                    className='flex items-center gap-4 p-3 rounded-lg bg-card border border-border'
                  >
                    <span className='w-6 text-center text-sm text-muted-foreground font-medium'>
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
                    <div className='flex items-center gap-1 text-selected font-bold'>
                      <Clock className='w-4 h-4' />
                      {formatSeconds(item.durationSeconds)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Game not started or no flashcards
  if (!isGameStarted || flashcards.length === 0) {
    return (
      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='text-center py-20'>
          <Blocks className='w-20 h-20 mx-auto mb-4 text-muted-foreground' />
          <h2 className='text-2xl font-bold mb-2'>Matching Game</h2>
          <p className='text-xl text-foreground mb-8'>
            {flashcards.length === 0
              ? "No flashcards available"
              : "Click Start to begin!"}
          </p>
          <div className='flex gap-4 justify-center'>
            {flashcards.length > 0 && (
              <Button
                variant='default'
                onClick={initializeGame}
                className='px-6 py-3 rounded-lg transition-colors font-semibold cursor-pointer'
              >
                Start Game
              </Button>
            )}
            <Button
              variant='outline'
              onClick={onBack}
              className='px-6 py-3 rounded-lg transition-colors font-semibold cursor-pointer'
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing game
  return (
    <div className='max-w-4xl mx-auto px-6 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-3xl font-bold mb-2'>Matching Game</h2>
          <p className='text-foreground'>Match terms with their definitions</p>
        </div>

        <div className='flex items-center gap-6'>
          <div className='rounded-lg shadow px-6 py-3 bg-card'>
            <div className='flex items-center gap-2'>
              <Clock className='w-5 h-5 text-selected' />
              <span className='text-2xl font-bold text-selected'>
                {formatTime(timer)}
              </span>
            </div>
          </div>

          <div className='rounded-lg shadow px-6 py-3 bg-card'>
            <div className='flex items-center gap-2'>
              <Award className='w-5 h-5 text-info' />
              <span className='text-2xl font-bold text-info'>
                {matchedPairs.size}/{Math.min(flashcards.length, 6)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className='grid grid-cols-3 gap-4 mb-8'>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={getCardClassName(card)}
          >
            <p className='text-lg font-medium'>{card.content}</p>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className='flex justify-center'>
        <Button
          onClick={onBack}
          variant='outline'
          className='px-6 py-3 bg-card cursor-pointer rounded-lg transition-colors font-semibold'
        >
          Exit Game
        </Button>
      </div>
    </div>
  );
};

export default MatchingView;
