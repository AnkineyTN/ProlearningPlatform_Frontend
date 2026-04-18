import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFlashcards } from "@/hooks/useFlashcards";
import FlashCard, { type Flashcard } from "@/components/cards/FlashCard";
import {
  ResourceFiltersBar,
  type ListPrivacyFilter,
  type ListCreateMethodFilter,
  type ListSortOption,
} from "@/components/lists/ResourceFiltersBar";
import { Button } from "@/components/ui/button";
import { getTimeAgo } from "@/lib/utils";
import { ChevronLeft, ChevronRight, FileX } from "lucide-react";

type FlashcardListPageProps = {
  setId: number;
  onUpdate: (flashcard: Flashcard) => void;
  onDelete: (flashcardId: number | string) => void;
};

const FlashcardListPage = ({
  setId,
  onUpdate,
  onDelete,
}: FlashcardListPageProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>("");
  const [createMethodFilter, setCreateMethodFilter] = useState<ListCreateMethodFilter>("");
  const [sort, setSort] = useState<ListSortOption>("id,DESC");
  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(listSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [listSearch]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacyFilter, createMethodFilter, sort]);

  const { data, isLoading, isError, error } = useFlashcards({
    setId,
    page: currentPage,
    size: pageSize,
    sort,
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
    createMethod: createMethodFilter || undefined,
  });

  const handleAccess = (id: number | string) => {
    navigate(`/sets/${setId}/flashcards/${id}`);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.metadata) {
      setCurrentPage((prev) =>
        Math.min(data.metadata.totalPages - 1, prev + 1),
      );
    }
  };

  const filters = (
    <ResourceFiltersBar
      className='mb-4'
      searchValue={listSearch}
      onSearchChange={setListSearch}
      privacy={privacyFilter}
      onPrivacyChange={setPrivacyFilter}
      createMethod={createMethodFilter}
      onCreateMethodChange={setCreateMethodFilter}
      sort={sort}
      onSortChange={setSort}
    />
  );

  if (isLoading) {
    return (
      <div>
        {filters}
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='text-muted-foreground'>Loading flashcards...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {filters}
        <div className='flex justify-center items-center min-h-[400px]'>
          <div className='text-destructive'>
            Error loading flashcards:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div>
        {filters}
        <div className='flex flex-col justify-center items-center min-h-[400px]'>
          <FileX className='mx-auto mb-4 text-6xl w-20 h-20' />
          <div className='text-muted-foreground'>No flashcards found</div>
        </div>
      </div>
    );
  }

  const { data: flashcards, metadata } = data;
  const totalPages = metadata.totalPages;
  const displayPage = currentPage + 1;

  return (
    <div>
      {filters}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {flashcards.map((flashcard) => (
          <FlashCard
            key={flashcard.id}
            flashcard={{
              id: flashcard.id,
              title: flashcard.title,
              description:
                flashcard.description || "No description available...",
              time: getTimeAgo(flashcard.lastStudy),
              created_at: new Date(flashcard.lastStudy).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                },
              ),
              privacy: flashcard.privacy,
            }}
            onAccess={handleAccess}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-4'>
          <Button
            variant='ghost'
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          >
            <ChevronLeft className='text-foreground' />
          </Button>

          <span className='text-sm font-medium'>
            {displayPage}/{totalPages}
          </span>

          <Button
            variant='ghost'
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          >
            <ChevronRight className='text-foreground' />
          </Button>
        </div>
      )}
    </div>
  );
}

export default FlashcardListPage;
