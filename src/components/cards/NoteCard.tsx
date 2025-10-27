import { useState, useRef, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { FileText, MoreVertical, Clock } from 'lucide-react';
import { Button } from '../ui/button';

export interface Note {
    id: number;
    title: string;
    description: string;
    privacy: string;
    timeAgo: string;
    created_at: string;
}

interface NoteCardProps {
    note: Note;
    onAccess: (id: number) => void;
    onDelete?: (id: number) => void;
    onUpdate?: (note: Note) => void;
}

export default function NoteCard({ note, onAccess, onDelete, onUpdate }: NoteCardProps) {
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
            if (window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
                onDelete(note.id);
            }
        }
    };

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onUpdate) {
            onUpdate(note);
        }
    };

    const handleClick = () => {
        if (!showMenu) {
            onAccess(note.id);
        }
    };

    return (
        <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start mb-3">
                <FileText className="w-5 h-5" />

                {/* More Options Button with Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMoreClick}
                        className="hover:bg-card-secondary p-1 rounded cursor-pointer transition-colors"
                        title="More options"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

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
            <h2 className="font-semibold mb-1">{note.title}</h2 >
            <p className="text-sm text-muted-foreground mb-4">{note.description}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {note.timeAgo}
                </span>
                <span>{note.created_at}</span>
            </div>
        </div>
    );
};