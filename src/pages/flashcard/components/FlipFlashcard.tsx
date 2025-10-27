import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

interface FlipFlashcardProps {
    isFlipped: boolean;
    flashcards: Array<{
        question: string;
        answer: string;
    }>;
    currentCardIndex: number;
    onFlip: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function FlipFlashcard({
    isFlipped,
    flashcards,
    currentCardIndex,
    onFlip,
    onPrevious,
    onNext
}: FlipFlashcardProps) {
    return (
        <>
            <div className="flex items-center justify-center perspective-1000">
                <div
                    className="relative w-full max-w-4xl h-[400px] cursor-pointer"
                    style={{ perspective: '1000px' }}
                    onClick={onFlip}
                >
                    <div
                        className="relative w-full h-full transition-transform duration-600 preserve-3d"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: isFlipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                            transition: 'transform 0.6s'
                        }}
                    >
                        {/* Front Side - Question */}
                        <div
                            className="absolute w-full h-full bg-card rounded-2xl shadow-2xl p-16 flex items-center justify-center backface-hidden"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                        >
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                                    Question
                                </div>
                                <p className="text-3xl font-medium leading-relaxed">
                                    {flashcards[currentCardIndex].question}
                                </p>
                            </div>
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                                Click to flip
                            </div>
                        </div>

                        {/* Back Side - Answer */}
                        <div
                            className="absolute w-full h-full bg-card rounded-2xl shadow-2xl p-16 flex items-center justify-center backface-hidden"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateX(180deg)'
                            }}
                        >
                            <div className="text-center">
                                <div className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                                    Answer
                                </div>
                                <p className="text-3xl font-medium leading-relaxed">
                                    {flashcards[currentCardIndex].answer}
                                </p>
                            </div>
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                                Click to flip back
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8">
                <Button
                    variant="outline"
                    size="lg"
                    className='cursor-pointer px-8'
                    onClick={onPrevious}
                    disabled={currentCardIndex === 0}
                >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Previous
                </Button>

                <Button variant="outline" size="lg" className='cursor-pointer' onClick={onFlip}>
                    <Shuffle className="w-5 h-5" />
                </Button>

                <Button variant="default" size="lg" className='cursor-pointer px-8' onClick={onNext}>
                    {currentCardIndex === flashcards.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
            </div>
        </>
    );
}