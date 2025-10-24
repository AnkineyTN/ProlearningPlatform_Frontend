import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, MoreVertical, Share2, Shuffle, Maximize2, Edit, Volume2, Eye, BookOpen, Blocks, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from "@/components/theme/mode-toggle";

export default function FlashcardApp() {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewMode, setViewMode] = useState<'study' | 'list'>('study');

    const flashcards = [
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
    };

    const handleNext = () => {
        if (currentCardIndex < flashcards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setIsFlipped(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold">Encapsulation question</h1>
                        <ModeToggle />
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <BookOpen className="w-5 h-5" />
                        <span>Software Engineering</span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'study' ? 'default' : 'outline'}
                            onClick={() => setViewMode('study')}
                            className="gap-2 cursor-pointer"
                        >
                            <Brain className="w-5 h-5" />
                            Study
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            onClick={() => setViewMode('list')}
                            className="gap-2 cursor-pointer bg-card"
                        >
                            <Blocks className="w-5 h-5" />
                            Matching
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button variant="ghost" size="icon" className='cursor-pointer'>
                                <Heart className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className='cursor-pointer'>
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className='cursor-pointer'>
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {viewMode === 'study' ? (
                    <>
                        {/* Flashcard */}
                        <div className="mb-8">
                            <div
                                className="relative bg-card rounded-lg shadow-lg p-12 min-h-[300px] flex items-center justify-center cursor-pointer transition-all hover:shadow-xl"
                                onClick={handleFlip}
                            >
                                <div className="text-center">
                                    <p className="text-2xl font-medium">
                                        {isFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                                    </p>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-6">
                                <Button
                                    variant="ghost"
                                    className='cursor-pointer'
                                    size="icon"
                                    onClick={handlePrevious}
                                    disabled={currentCardIndex === 0}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </Button>

                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{currentCardIndex + 1}/{flashcards.length}</span>
                                    <Button variant="ghost" size="icon" className='cursor-pointer' onClick={handleFlip}>
                                        <Shuffle className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className='cursor-pointer'>
                                        <Maximize2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    className='cursor-pointer'
                                    size="icon"
                                    onClick={handleNext}
                                    disabled={currentCardIndex === flashcards.length - 1}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </div>
                        </div>

                        {/* Card List */}
                        <div>
                            <h2 className="text-lg font-bold mb-4">Card</h2>
                            <div className="space-y-3">
                                {flashcards.map((card, index) => (
                                    <Card
                                        key={index}
                                        className={`cursor-pointer transition-all hover:shadow-md ${index === currentCardIndex ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        onClick={() => {
                                            setCurrentCardIndex(index);
                                            setIsFlipped(false);
                                        }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 max-w-[250px]">
                                                    <p className="font-medium mb-2">{card.question}</p>
                                                </div>
                                                <div className="flex-1 border-l pl-6">
                                                    <p className="text-foreground">{card.answer}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                                                        <Volume2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl text-muted-foreground">Matching mode coming soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};