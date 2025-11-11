import { useState } from 'react';
import NoteCard, { type Note } from '@/components/cards/NoteCard';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotesBySet } from '@/hooks/useNotes';
import { getTimeAgo } from '@/lib/utils';

interface NoteListPageProps {
    setId?: number;
    onUpdate: (note: Note) => void;
    onDelete: (noteId: number) => void;
}

export default function NoteListPage({ setId: propSetId, onUpdate, onDelete }: NoteListPageProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const navigate = useNavigate();
    const { setId: paramSetId } = useParams<{ setId: string }>();
    const pageSize = 6;

    const setId = propSetId || Number(paramSetId);

    const { data: notesData, isLoading, error } = useNotesBySet(
        setId,
        currentPage,
        pageSize
    );

    const notes = notesData?.items || [];
    const totalPages = notesData?.totalPage || 1;

    const handleAccess = (id: number) => {
        navigate(`/note/${id}`);
    };

    const handleDelete = (id: number) => {
        onDelete(id);
    };

    const handleUpdate = (note: Note) => {
        onUpdate(note);
    };

    const handlePageChange = (direction: 'prev' | 'next') => {
        setCurrentPage(prev =>
            direction === 'prev'
                ? Math.max(0, prev - 1)
                : Math.min(totalPages - 1, prev + 1)
        );
    };

    if (!setId) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-destructive">Invalid set ID</div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">Loading notes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-destructive">Error loading notes. Please try again.</div>
            </div>
        );
    }

    if (notes.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
                <div className="text-muted-foreground text-lg">No notes found</div>
                <div className="text-muted-foreground text-sm">Create your first note to get started!</div>
            </div>
        );
    }

    return (
        <div>
            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {notes.map((note) => (
                    <NoteCard
                        key={note.id}
                        note={{
                            id: note.id,
                            title: note.title,
                            description: note.description || 'No description available...',
                            privacy: note.privacy,
                            timeAgo: getTimeAgo(note.updated_at),
                            created_at: new Date(note.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            })
                        }}
                        onAccess={() => handleAccess(note.id)}
                        onUpdate={() => handleUpdate(note)}
                        onDelete={() => handleDelete(note.id)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <Button
                        variant={"ghost"}
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    <span className="text-sm font-medium">
                        {currentPage + 1}/{totalPages}
                    </span>

                    <Button
                        variant={"ghost"}
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            )}
        </div>
    );
}