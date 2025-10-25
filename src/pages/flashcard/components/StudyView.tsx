import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import FlipFlashcard from "./FlipFlashcard";

interface StudyViewProps {
    flashcards: Array<{
        question: string;
        answer: string;
    }>;
    currentCardIndex: number;
    isFlipped: boolean;
    onBack: () => void;
    onFlip: () => void;
    onPrevious: () => void;
    onNext: () => void;
}

export default function StudyView({
    flashcards,
    currentCardIndex,
    isFlipped,
    onBack,
    onFlip,
    onPrevious,
    onNext
}: StudyViewProps) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" onClick={onBack} className="cursor-pointer">
                        ← Back
                    </Button>
                    <span className="text-lg font-medium">
                        {currentCardIndex + 1} / {flashcards.length}
                    </span>
                </div>

                <div className="w-full h-2 bg-muted rounded-full mb-12">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${((currentCardIndex + 1) / flashcards.length) * 100}%` }}
                    ></div>
                </div>

                <FlipFlashcard
                    isFlipped={isFlipped}
                    flashcards={flashcards}
                    currentCardIndex={currentCardIndex}
                    onFlip={onFlip}
                    onPrevious={onPrevious}
                    onNext={onNext}
                />
            </div>
        </div>
    );
}