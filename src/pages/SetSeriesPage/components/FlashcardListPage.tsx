import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import FlashCard from '@/components/cards/FlashCard';
import { Button } from '@/components/ui/button';
import { getTimeAgo } from '@/lib/utils';

interface FlashcardListPageProps {
    setId: number;
}

export default function FlashcardListPage({ setId }: FlashcardListPageProps) {
    const [currentPage, setCurrentPage] = useState(0); // API uses 0-based indexing
    const pageSize = 6;
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useFlashcards({
        setId,
        page: currentPage,
        size: pageSize,
        sort: 'id,ASC'
    });

    const handleAccess = (id: string) => {
        navigate(`/sets/${setId}/flashcards/${id}`);
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(0, prev - 1));
    };

    const handleNextPage = () => {
        if (data?.metadata) {
            setCurrentPage((prev) => Math.min(data.metadata.totalPages - 1, prev + 1));
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-muted-foreground">Loading flashcards...</div>
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-destructive">
                    Error loading flashcards: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
            </div>
        );
    }

    // Empty state
    if (!data?.data || data.data.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-muted-foreground">No flashcards found</div>
            </div>
        );
    }

    const { data: flashcards, metadata } = data;
    const totalPages = metadata.totalPages;
    const displayPage = currentPage + 1; // Display 1-based page number

    return (
        <div>
            {/* Flashcards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {flashcards.map((flashcard) => (
                    <FlashCard
                        key={flashcard.id}
                        flashcard={{
                            id: flashcard.id,
                            title: flashcard.title,
                            preview: flashcard.description,
                            time: getTimeAgo(flashcard.lastStudy),
                            created_at: new Date(flashcard.lastStudy).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }),
                        }}
                        onAccess={handleAccess}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <Button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 0}
                        className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="text-gray-700">‹</span>
                    </Button>

                    <span className="text-sm font-medium text-gray-700">
                        {displayPage}/{totalPages}
                    </span>

                    <Button
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                        className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <span className="text-gray-700">›</span>
                    </Button>
                </div>
            )}
        </div>
    );
}