import { useState, useRef, useEffect } from 'react';
import { FileText, MoreVertical, Clock } from 'lucide-react';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { useTranslation } from 'react-i18next';
import DropdownMenu from './DropdownMenu';

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
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { t } = useTranslation();

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

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
        if (onDelete) {
            onDelete(note.id);
        }
        setShowDeleteDialog(false);
    };

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        if (onUpdate) {
            onUpdate(note);
        }
    };

    const handleClick = () => {
        if (!showMenu && !showDeleteDialog) {
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
                        <DropdownMenu
                            onUpdate={handleUpdate}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </div>
            </div>
            <h2 className="font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{note.title}</h2 >
            <p className="text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis whitespace-nowrap">{note.description}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {note.timeAgo}
                </span>
                <span>{note.created_at}</span>
            </div>
            <DeleteConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleConfirmDelete}
                title={t('modal.delete')}
                itemName={`"${note.title}"`}
            />
        </div>
    );
};