import { BookOpen, MoreVertical, Clock, FileText, Headphones } from 'lucide-react';

export interface Set {
    title: string;
    code: string;
    instructor: string;
    duration: string;
    flashcards: number;
    tests: number;
    audio: string;
    video: string | number;
    progress: number; // percentage
    lastUpdated: string;
    date: string;
}

export default function SetCard({ set, onAccess }: { set: Set, onAccess: (id: string) => void }) {
    const handleClick = () => {
        onAccess(set.code); // Giả sử 'code' là ID của set
    }

    return (
        <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start mb-3">
                <BookOpen className="w-5 h-5" />
                <button className="hover:bg-card-secondary p-1 rounded cursor-pointer" title="More options">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
            <h3 className="font-semibold mb-1">{set.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{set.code} • {set.instructor}</p>
            <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {set.duration}
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {set.flashcards} flashcard
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {set.tests} test
                </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" /> {set.audio} audio
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {typeof set.video === 'number' ? `${set.video} tài liệu` : set.video}
                </span>
            </div>
            <div className="w-full bg-card-secondary rounded-full h-2 mb-3">
                <div className="bg-foreground h-2 rounded-full" style={{ width: `${set.progress}%` }}></div>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {set.lastUpdated}
                </span>
                <span>{set.date}</span>
            </div>
        </div>
    );
};