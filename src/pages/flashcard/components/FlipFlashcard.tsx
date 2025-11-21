import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Shuffle, Settings, Fullscreen, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FlipFlashcardProps {
    isFlipped: boolean;
    flashcards: Array<{
        frontCard: string;
        backCard: string;
        imageUrl?: string;
    }>;
    currentCardIndex: number;
    onFlip: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onShuffle: () => void;
}

export default function FlipFlashcard({
    isFlipped,
    flashcards,
    currentCardIndex,
    onFlip,
    onPrevious,
    onNext,
    onShuffle
}: FlipFlashcardProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [trackProgress, setTrackProgress] = useState(true);
    const [cardSide, setCardSide] = useState<'term' | 'definition'>('term');

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <>
            <div className="flex items-center justify-center perspective-1000">
                <div
                    className={`relative w-full ${isFullscreen ? 'h-screen' : 'max-w-4xl h-[400px]'} cursor-pointer`}
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
                                {flashcards[currentCardIndex].imageUrl && (
                                    <img
                                        src={flashcards[currentCardIndex].imageUrl}
                                        alt="Flashcard Image"
                                        className="max-w-full max-h-50 object-contain rounded"
                                    />
                                )}
                                <p className="text-3xl font-medium leading-relaxed">
                                    {flashcards[currentCardIndex].frontCard}
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
                                    {flashcards[currentCardIndex].backCard}
                                </p>
                            </div>
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                                Click to flip back
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-8 mt-8">
                <div className="flex-1" />
                <div className="flex items-center justify-center gap-8">
                    <Button
                        variant="default"
                        className='cursor-pointer'
                        onClick={onPrevious}
                        disabled={currentCardIndex === 0}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </Button>

                    <div className="text-foreground">
                        {currentCardIndex + 1} / {flashcards.length}
                    </div>

                    <Button variant="default" className='cursor-pointer' onClick={onNext}>
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>
                <div className="flex-1 justify-end flex items-center gap-2">
                    <Button variant="ghost" className='cursor-pointer' onClick={onShuffle}>
                        <Shuffle className="w-8 h-8" />
                    </Button>
                    <Button variant="ghost" className='cursor-pointer' onClick={() => setIsSettingsOpen(true)}>
                        <Settings className="w-8 h-8" />
                    </Button>
                    <Button variant="ghost" className='cursor-pointer' onClick={handleFullscreen}>
                        <Fullscreen className="w-8 h-8" />
                    </Button>
                </div>
            </div>

            {/* Settings Dialog */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Settings</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Track Progress */}
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium">Track Progress</div>
                                <div className="text-sm text-muted-foreground">Monitor your learning progress</div>
                            </div>
                            <Switch
                                className="cursor-pointer"
                                checked={trackProgress}
                                onCheckedChange={setTrackProgress}
                            />
                        </div>

                        {/* Card Side Selection */}
                        <div>
                            <div className="font-medium mb-3">Front Side</div>
                            <div className="space-x-10 flex items-center">
                                <Label className="flex items-center gap-3 cursor-pointer">
                                    <Input
                                        type="radio"
                                        name="cardSide"
                                        checked={cardSide === 'term'}
                                        onChange={() => setCardSide('term')}
                                        className="w-4 h-4"
                                    />
                                    <span>Term</span>
                                </Label>
                                <Label className="flex items-center gap-3 cursor-pointer">
                                    <Input
                                        type="radio"
                                        name="cardSide"
                                        checked={cardSide === 'definition'}
                                        onChange={() => setCardSide('definition')}
                                        className="w-4 h-4"
                                    />
                                    <span>Definition</span>
                                </Label>
                            </div>
                        </div>

                        {/* Reset Cards */}
                        <div>
                            <Button
                                variant="outline"
                                className="w-full cursor-pointer mt-2"
                                onClick={handleReset}
                            >
                                Reset Flashcards
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Fullscreen Overlay */}
            {isFullscreen && (
                <div className="fixed inset-0 bg-background z-40 flex flex-col">
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="w-full max-w-5xl">
                            <div
                                className="relative w-full h-[600px] cursor-pointer"
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
                                            {flashcards[currentCardIndex].imageUrl && (
                                                <img
                                                    src={flashcards[currentCardIndex].imageUrl}
                                                    alt="Flashcard Image"
                                                    className="max-w-full max-h-50 object-contain rounded mb-4"
                                                />
                                            )}
                                            <p className="text-4xl font-medium leading-relaxed">
                                                {flashcards[currentCardIndex].frontCard}
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
                                            <p className="text-4xl font-medium leading-relaxed">
                                                {flashcards[currentCardIndex].backCard}
                                            </p>
                                        </div>
                                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                                            Click to flip back
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fullscreen Controls */}
                    <div className="flex items-center gap-8 p-8 border-t">
                        <div className="flex-1" />
                        <div className="flex items-center justify-center gap-8">
                            <Button
                                variant="default"
                                className='cursor-pointer'
                                onClick={onPrevious}
                                disabled={currentCardIndex === 0}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </Button>

                            <div className="text-foreground text-lg">
                                {currentCardIndex + 1} / {flashcards.length}
                            </div>

                            <Button variant="default" className='cursor-pointer' onClick={onNext}>
                                <ChevronRight className="w-8 h-8" />
                            </Button>
                        </div>
                        <div className="flex-1 justify-end flex items-center gap-2">
                            <Button variant="ghost" className='cursor-pointer' onClick={handleFullscreen}>
                                <X className="w-8 h-8" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}