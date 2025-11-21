import { useState, useMemo } from 'react';
import { useDeleteCard, useFlashcardDetail, useUpdateCard, useDeleteFlashcard } from '@/hooks/useFlashcards';
import HomeView from './components/HomeView';
import StudyView from './components/StudyView';
import ResultsView from './components/ResultsView';
import MatchingView from './components/MatchingView';
import FlashcardHeader from './components/FlashcardHeader';
import type { Card } from '@/services/types/flashcard.types';
import { useNavigate } from 'react-router-dom';

// Types
type ViewMode = 'home' | 'study' | 'matching' | 'results';

interface FlashcardDetailProps {
    setId: number;
    flashcardId: number | string;
}

export default function FlashcardDetailPage({ setId, flashcardId }: FlashcardDetailProps) {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
    const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
    const [isShuffled, setIsShuffled] = useState(false);
    const updateCardMutation = useUpdateCard();
    const deleteCardMutation = useDeleteCard();
    const deleteFlashcardMutation = useDeleteFlashcard();
    const navigate = useNavigate();

    // Fetch flashcard data from API
    const { data, isLoading, isError, error, refetch } = useFlashcardDetail(
        Number(setId),
        Number(flashcardId)
    );

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            setStudiedCards(new Set(studiedCards).add(currentCardIndex));
        }
    };

    const title = useMemo(() => data?.data.title || 'Flashcard Set', [data]);
    const description = useMemo(() => data?.data.description || '', [data]);
    const flashcards: Array<Card> = useMemo(() => {
        const cards = data?.data.cards || [];
        return [...cards].sort((a, b) => a.id - b.id);
    }, [data]);

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

    const handleShuffle = () => {
        if (isShuffled) {
            // Reset to original order
            setShuffledIndices([]);
            setIsShuffled(false);
            setCurrentCardIndex(0);
            setIsFlipped(false);
        } else {
            // Create shuffled indices array
            const indices = flashcards.map((_, index) => index);
            const shuffled = [...indices].sort(() => Math.random() - 0.5);
            setShuffledIndices(shuffled);
            setIsShuffled(true);
            setCurrentCardIndex(0);
            setIsFlipped(false);
        }
    };

    const displayedFlashcards: Array<Card> = useMemo(() => {
        const cards = data?.data.cards || [];
        const sortedCards = [...cards].sort((a, b) => a.id - b.id);

        if (isShuffled && shuffledIndices.length > 0) {
            return shuffledIndices.map(index => sortedCards[index]);
        }

        return sortedCards;
    }, [data, isShuffled, shuffledIndices]);

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

    const handleUpdateCard = async (data: {
        id: number;
        frontCard: string;
        backCard: string;
        imageAssetId?: number;
        cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
    }) => {
        try {
            await updateCardMutation.mutateAsync({
                setId,
                flashcardId,
                cardId: data.id,
                data
            });
            await refetch();
            console.log('Card updated successfully');
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const handleDeleteCard = async (cardId: number) => {
        try {
            await deleteCardMutation.mutateAsync({
                setId,
                flashcardId,
                cardId
            });
            await refetch();
            console.log('Card deleted successfully');
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    const handleDeleteFlashcard = async () => {
        try {
            await deleteFlashcardMutation.mutateAsync({
                setId: Number(setId),
                flashcardId: Number(flashcardId)
            });

            // Navigate to set page after successful deletion
            navigate(`/sets/${setId}`);
        } catch (error) {
            console.error('Error deleting flashcard:', error);
            alert('Failed to delete flashcard. Please try again.');
        }
    };

    return (
        <div>
            <FlashcardHeader setId={Number(setId)} title={title} description={description} />

            {viewMode === 'home' && (
                <HomeView
                    setId={setId}
                    flashcardId={flashcardId}
                    flashcards={displayedFlashcards}
                    onCardClick={handleCardClick}
                    onStudy={startStudying}
                    onMatching={() => setViewMode('matching')}
                    isFlipped={isFlipped}
                    currentCardIndex={currentCardIndex}
                    onFlip={handleFlip}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                    onDeleteFlashcard={handleDeleteFlashcard}
                    isUpdating={updateCardMutation.isPending}
                    isDeletingFlashcard={deleteFlashcardMutation.isPending}
                    onShuffle={handleShuffle}
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
                    onShuffle={handleShuffle}
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
                    flashcards={flashcards}
                    onBack={() => setViewMode('home')}
                />
            )}
        </div>
    );
}