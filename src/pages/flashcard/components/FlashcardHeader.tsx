import { BookOpen, SwatchBook } from "lucide-react";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { useNavigate } from "react-router";

export default function FlashcardHeader({ setId }: { setId: number }) {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/sets/${setId}`);
    }
    return (
        <div className="border-b">
            <div className="max-w-4xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <SwatchBook className="w-8 h-8" />
                        <h1 className="text-3xl font-bold">Encapsulation question</h1>
                    </div>
                    <ModeToggle />
                </div>

                <div className="flex items-center gap-2 text-muted-foreground mb-4 cursor-pointer" onClick={handleClick}>
                    <BookOpen className="w-5 h-5" />
                    <span>Software Engineering</span>
                </div>
            </div>
        </div>
    );
}