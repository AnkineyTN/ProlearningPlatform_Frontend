
import { Edit, Eye, Volume2, Brain, Blocks, Heart, MoreVertical, Share2, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FlipFlashcard from "./FlipFlashcard";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface HomeViewProps {
    setId: string;
    flashcards: Array<{
        frontCard: string;
        backCard: string;
        imageUrl?: string;
    }>;
    onCardClick: (index: number) => void;
    onStudy: () => void;
    onMatching: () => void;
    isFlipped: boolean;
    currentCardIndex: number;
    onFlip: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function HomeView({ setId, flashcards, onCardClick, onStudy, onMatching, isFlipped, currentCardIndex, onFlip, onPrevious, onNext }: HomeViewProps) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
    };

    const handleUpdate = (e: React.MouseEvent) => {
        navigate(`/sets/${setId}/flashcards/update/${currentCardIndex}`);
        e.stopPropagation();
        setShowMenu(false);
    };
    return (
        <>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex gap-2 mb-6">
                    <Button
                        variant="outline"
                        onClick={onStudy}
                        className="gap-2 cursor-pointer"
                    >
                        <Brain className="w-5 h-5" />
                        Study
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onMatching}
                        className="gap-2 cursor-pointer"
                    >
                        <Blocks className="w-5 h-5" />
                        Matching
                    </Button>
                    <div className="ml-auto flex gap-2">
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                            <Heart className="w-5 h-5" />
                        </Button>
                        {/* More Options Button with Dropdown */}
                        <div className="relative" ref={menuRef}>
                            <Button
                                variant="ghost"
                                onClick={handleMoreClick}
                                className="hover:bg-card-secondary p-1 rounded cursor-pointer transition-colors"
                                title="More options"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 mt-1 w-30 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                                    <Button
                                        variant="ghost"
                                        onClick={handleUpdate}
                                        className="w-full text-center transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDelete}
                                        className="w-full text-center text-destructive transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
                <div className="mb-6">
                    <FlipFlashcard
                        isFlipped={isFlipped}
                        flashcards={flashcards}
                        currentCardIndex={currentCardIndex}
                        onFlip={onFlip}
                        onPrevious={onPrevious}
                        onNext={onNext}
                    />
                </div>
                <h2 className="text-lg font-bold mb-4">Card ({flashcards.length})</h2>
                <div className="space-y-3">
                    {flashcards.map((card, index) => (
                        <Card
                            key={index}
                            className="cursor-pointer transition-all hover:shadow-md"
                            onClick={() => onCardClick(index)}
                        >
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 max-w-[250px]">
                                        <p className="font-medium mb-2">{card.frontCard}</p>
                                    </div>
                                    <div className="flex-1 border-l pl-6">
                                        <p className="text-foreground">{card.backCard}</p>
                                    </div>
                                    <div className="">
                                        {card.imageUrl && <img src={card.imageUrl} alt="Flashcard Icon" className="w-16 rounded" />}
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
    );
}