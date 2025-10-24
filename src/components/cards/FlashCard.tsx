import { SwatchBook, MoreVertical, Clock } from 'lucide-react';

export interface Flashcard {
    id: string;
    title: string;
    category: string;
    preview: string;
    time: string;
    date: string;
}

export default function FlashCard({ flashcard, onAccess }: { flashcard: Flashcard, onAccess: (id: string) => void }) {
    const handleClick = () => {
        onAccess(flashcard.id);
    }
    return (
        <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start mb-3">
                <SwatchBook className="w-5 h-5" />
                <button className="hover:bg-card-secondary p-1 rounded cursor-pointer" title="More options">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
            <h2 className="font-semibold mb-1">{flashcard.title}</h2 >
            <p className="text-xs text-muted-foreground mb-3">{flashcard.category}</p>
            <p className="text-sm text-muted-foreground mb-4">{flashcard.preview}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {flashcard.time}
                </span>
                <span>{flashcard.date}</span>
            </div>
        </div>
    );
};