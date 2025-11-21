import { useState, useEffect } from 'react';
import { Blocks, Trophy, Clock, Award } from 'lucide-react';
import type { Card } from '@/services/types/flashcard.types';
import { Button } from '@/components/ui/button';
interface MatchingViewProps {
    flashcards: Card[];
    onBack: () => void;
}

interface MatchingCard {
    id: string;
    content: string;
    type: 'term' | 'definition';
    originalId: number;
    isMatched: boolean;
}

export default function MatchingView({ flashcards, onBack }: MatchingViewProps) {
    const [cards, setCards] = useState<MatchingCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [timer, setTimer] = useState(0);

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

    const initializeGame = () => {
        // Lấy tối đa 6 thẻ đầu tiên
        const selectedFlashcards = flashcards.slice(0, 6);

        // Tạo mảng các thẻ (terms và definitions)
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

        // Shuffle cards
        const allCards = [...termCards, ...definitionCards];
        const shuffled = allCards.sort(() => Math.random() - 0.5);

        setCards(shuffled);
        setSelectedCards([]);
        setMatchedPairs(new Set());
        setStartTime(null);
        setEndTime(null);
        setTimer(0);
        setIsGameStarted(true);
    };

    const handleCardClick = (cardId: string) => {
        if (!startTime) {
            setStartTime(Date.now());
        }

        const card = cards.find(c => c.id === cardId);
        if (!card || card.isMatched) return;

        // Nếu đã chọn 2 thẻ rồi thì không cho chọn thêm
        if (selectedCards.length >= 2) return;

        // Nếu thẻ này đã được chọn rồi
        if (selectedCards.includes(cardId)) return;

        const newSelected = [...selectedCards, cardId];
        setSelectedCards(newSelected);

        // Kiểm tra match khi đã chọn 2 thẻ
        if (newSelected.length === 2) {
            const [firstId, secondId] = newSelected;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard && secondCard) {
                // Kiểm tra xem có match không
                const isMatch =
                    firstCard.originalId === secondCard.originalId &&
                    firstCard.type !== secondCard.type;

                if (isMatch) {
                    // Match thành công
                    setCards(prevCards =>
                        prevCards.map(c =>
                            c.id === firstId || c.id === secondId
                                ? { ...c, isMatched: true }
                                : c
                        )
                    );

                    const newMatchedPairs = new Set(matchedPairs);
                    newMatchedPairs.add(firstCard.originalId);
                    setMatchedPairs(newMatchedPairs);

                    setSelectedCards([]);

                    // Kiểm tra xem đã hoàn thành chưa
                    if (newMatchedPairs.size === Math.min(flashcards.length, 6)) {
                        setEndTime(Date.now());
                    }
                } else {
                    // Không match - đợi 500ms rồi bỏ chọn
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
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    };

    const getCardClassName = (card: MatchingCard) => {
        const baseClasses = "p-4 rounded-lg border-1 cursor-pointer transition-all duration-200 text-center flex items-center justify-center min-h-[100px]";

        if (card.isMatched) {
            return `${baseClasses} bg-bg-info border-text-info opacity-50`;
        }

        if (selectedCards.includes(card.id)) {
            const otherSelectedId = selectedCards.find(id => id !== card.id);
            if (otherSelectedId) {
                const otherCard = cards.find(c => c.id === otherSelectedId);
                const isMatch =
                    otherCard &&
                    card.originalId === otherCard.originalId &&
                    card.type !== otherCard.type;

                return `${baseClasses} ${isMatch
                    ? 'bg-bg-info border-text-info scale-105'
                    : 'bg-bg-error border-text-error'
                    }`;
            }
            return `${baseClasses} bg-bg-selected border-text-selected scale-105`;
        }

        return `${baseClasses} bg-card border-border hover:border-blue-400 hover:shadow-md`;
    };

    // Game completed
    if (endTime && startTime) {
        const totalTime = endTime - startTime;

        return (
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="text-center py-20">
                    <Trophy className="w-24 h-24 mx-auto mb-6 text-yellow-500" />
                    <h2 className="text-4xl font-bold mb-4">Congratulations! 🎉</h2>
                    <p className="text-2xl text-foreground mb-8">You completed the matching game!</p>

                    <div className="rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8 bg-card">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Clock className="w-6 h-6 text-selected" />
                            <span className="text-3xl font-bold text-selected">{formatTime(totalTime)}</span>
                        </div>
                        <p className="text-foreground">Your Time</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <Button
                            variant={"default"}
                            onClick={() => {
                                setIsGameStarted(false);
                                initializeGame();
                            }}
                            className="px-6 py-3 cursor-pointer rounded-lg transition-colors font-semibold"
                        >
                            Play Again
                        </Button>
                        <Button
                            variant={"outline"}
                            onClick={onBack}
                            className="px-6 bg-card cursor-pointer py-3 rounded-lg transition-colors font-semibold"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Game not started or no flashcards
    if (!isGameStarted || flashcards.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="text-center py-20">
                    <Blocks className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Matching Game</h2>
                    <p className="text-xl text-foreground mb-8">
                        {flashcards.length === 0
                            ? 'No flashcards available'
                            : 'Click Start to begin!'}
                    </p>
                    <div className="flex gap-4 justify-center">
                        {flashcards.length > 0 && (
                            <Button
                                variant={"default"}
                                onClick={initializeGame}
                                className="px-6 py-3 rounded-lg transition-colors font-semibold"
                            >
                                Start Game
                            </Button>
                        )}
                        <Button
                            variant={"outline"}
                            onClick={onBack}
                            className="px-6 py-3 rounded-lg transition-colors font-semibold"
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
        <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Matching Game</h2>
                    <p className="text-foreground">Match terms with their definitions</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="rounded-lg shadow px-6 py-3 bg-card">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-selected" />
                            <span className="text-2xl font-bold text-selected">{formatTime(timer)}</span>
                        </div>
                    </div>

                    <div className="rounded-lg shadow px-6 py-3 bg-card">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-info" />
                            <span className="text-2xl font-bold text-info">
                                {matchedPairs.size}/{Math.min(flashcards.length, 6)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {cards.map((card) => (
                    <div
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        className={getCardClassName(card)}
                    >
                        <p className="text-lg font-medium">{card.content}</p>
                    </div>
                ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-center">
                <Button
                    onClick={onBack}
                    variant={"outline"}
                    className="px-6 py-3 bg-card cursor-pointer rounded-lg transition-colors font-semibold"
                >
                    Exit Game
                </Button>
            </div>
        </div>
    );
}