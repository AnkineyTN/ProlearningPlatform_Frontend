import { useState, useRef, useEffect } from 'react';
import { BookOpen, MoreVertical, Clock, FileText, Headphones, Trash2, Edit } from 'lucide-react';
import { Button } from '../ui/button';

export interface Set {
    id: number;
    title: string;
    description: string;
    numNotes: number;
    code: string;
    duration: string;
    flashcards: number;
    tests: number;
    audio: string;
    video: string | number;
    progress: number;
    lastUpdated: string;
    date: string;
}

interface SetCardProps {
    set: Set;
    onAccess: (id: number) => void;
    onDelete?: (id: number) => void;
    onUpdate?: (set: Set) => void;
}

export default function SetCard({ set, onAccess, onDelete, onUpdate }: SetCardProps) {
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
        if (onDelete) {
            if (window.confirm(`Are you sure you want to delete "${set.title}"?`)) {
                onDelete(set.id);
            }
        }
    };

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onUpdate) {
            onUpdate(set);
        }
    };

    const handleCardClick = () => {
        if (!showMenu) {
            onAccess(set.id);
        }
    };

    return (
        <div
            className="bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleCardClick}
        >
            <div className="flex justify-between items-start mb-3">
                <BookOpen className="w-5 h-5" />

                {/* More Options Button with Dropdown */}
                <div className="relative" ref={menuRef}>
                    <Button
                        onClick={handleMoreClick}
                        variant="ghost"
                        className="p-1 rounded cursor-pointer transition-colors"
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
            </div>

            <h3 className="font-semibold mb-1">{set.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{set.description}</p>

            <div className="flex gap-4 text-xs text-muted-foreground mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {set.flashcards} flashcard
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {set.numNotes} notes
                </span>
                <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" /> {set.audio} audio
                </span>
                <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {typeof set.video === 'number' ? `${set.video} tài liệu` : set.video}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-card-secondary rounded-full h-2 mb-3">
                <div
                    className={`bg-foreground h-2 rounded-full transition-all w-[${set.progress}px]`}
                />
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {set.lastUpdated}
                </span>
                <span>{set.date}</span>
            </div>
        </div>
    );
}