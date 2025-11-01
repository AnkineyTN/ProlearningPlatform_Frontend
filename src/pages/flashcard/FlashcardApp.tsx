import { useState, useMemo } from 'react';
import { useFlashcardDetail } from '@/hooks/useFlashcards';
import HomeView from './components/HomeView';
import StudyView from './components/StudyView';
import ResultsView from './components/ResultsView';
import MatchingView from './components/MatchingView';
import FlashcardHeader from './components/FlashcardHeader';
import type { Card } from '@/services/types/flashcard.types';

// Types
type ViewMode = 'home' | 'study' | 'matching' | 'results';

interface FlashcardDetailProps {
    setId: string;
    flashcardId: string;
}

export default function FlashcardDetailPage({ setId, flashcardId }: FlashcardDetailProps) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());

    // Fetch flashcard data from API
    const { data, isLoading, isError, error } = useFlashcardDetail(
        Number(setId),
        flashcardId || ''
    );

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            setStudiedCards(new Set(studiedCards).add(currentCardIndex));
        }
    };

    const title = useMemo(() => data?.data.title || 'Flashcard Set', [data]);
    const description = useMemo(() => data?.data.description || '', [data]);
    const flashcards: Array<Card> = useMemo(() => data?.data.cards || [], [data]);

    const handleNext = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
        } else {
            setViewMode('results');
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
        }
    };

    const handleCardClick = (index: number) => {
        setCurrentCardIndex(index);
        setIsFlipped(false);
    };

    const startStudying = () => {
        setViewMode('study');
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const resetFlashcards = () => {
        setStudiedCards(new Set());
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setViewMode('study');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-muted-foreground">Loading flashcards...</div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-destructive mb-2">
                        Error loading flashcards
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!data?.data || flashcards.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg text-muted-foreground mb-2">
                        No flashcards available
                    </div>
                    <div className="text-sm text-muted-foreground">
                        This flashcard set is empty
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <FlashcardHeader setId={Number(setId)} title={title} description={description} />

            {viewMode === 'home' && (
                <HomeView
                    flashcards={flashcards}
                    onCardClick={handleCardClick}
                    onStudy={startStudying}
                    onMatching={() => setViewMode('matching')}
                    isFlipped={isFlipped}
                    currentCardIndex={currentCardIndex}
                    onFlip={handleFlip}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            )}

            {viewMode === 'study' && (
                <StudyView
                    flashcards={flashcards}
                    currentCardIndex={currentCardIndex}
                    isFlipped={isFlipped}
                    onBack={() => setViewMode('home')}
                    onFlip={handleFlip}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            )}

            {viewMode === 'results' && (
                <ResultsView
                    studiedCards={studiedCards.size}
                    totalCards={flashcards.length}
                    onHome={() => setViewMode('home')}
                    onContinue={() => setViewMode('study')}
                    onReset={resetFlashcards}
                />
            )}

            {viewMode === 'matching' && (
                <MatchingView
                    // flashcards={flashcards}
                    onBack={() => setViewMode('home')}
                />
            )}
        </div>
    );
}