import { useState } from 'react';
import HomeView from './components/HomeView';
import StudyView from './components/StudyView';
import ResultsView from './components/ResultsView';
import MatchingView from './components/MatchingView';
import FlashcardHeader from './components/FlashcardHeader';

// Types
type ViewMode = 'home' | 'study' | 'matching' | 'results';

interface Flashcard {
    question: string;
    answer: string;
}

export default function FlashcardApp() {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());

    const flashcards: Flashcard[] = [
        {
            question: "What is encapsulation in OOP?",
            answer: "Encapsulation is the bundling of data and methods that operate on that data within a single unit (class), and restricting direct access to some of the object's components. It helps protect data integrity and hide implementation details."
        },
        {
            question: "What is async/await?",
            answer: "A syntax for handling asynchronous operations that makes code easier to read and write than promises."
        },
        {
            question: "What is an array?",
            answer: "An ordered collection of elements that can store multiple values in a single variable."
        },
        {
            question: "What is inheritance in OOP?",
            answer: "A mechanism where a new class derives properties and behaviors from an existing class, promoting code reuse."
        },
        {
            question: "What is polymorphism?",
            answer: "The ability of objects to take on many forms, allowing methods to do different things based on the object calling them."
        }
    ];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        if (!isFlipped) {
            setStudiedCards(new Set(studiedCards).add(currentCardIndex));
        }
    };

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

    return (
        <div>
            <FlashcardHeader setId={10} />
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
                <MatchingView onBack={() => setViewMode('home')} />
            )}
        </div>
    );
}