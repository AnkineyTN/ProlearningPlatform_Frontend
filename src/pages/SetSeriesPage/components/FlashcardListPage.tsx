import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import FlashCard, { type Flashcard } from '@/components/cards/FlashCard';
import {
  ResourceFiltersBar,
  type ListPrivacyFilter,
  type ListCreateMethodFilter,
  type ListSortOption,
} from '@/components/lists/ResourceFiltersBar';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
  Pagination,
} from '@/components/lists/ListShared';
import { getTimeAgo } from '@/lib/utils';

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
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>('');
  const [createMethodFilter, setCreateMethodFilter] =
    useState<ListCreateMethodFilter>('');
  const [sort, setSort] = useState<ListSortOption>('id,DESC');
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

  const handleAccess = (id: number | string) =>
    navigate(`/sets/${setId}/flashcards/${id}`);

  const filters = (
    <ResourceFiltersBar
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

  if (isLoading)
    return (
      <div>
        {filters}
        <CardGridSkeleton />
      </div>
    );

  if (isError)
    return (
      <div>
        {filters}
        <div className='py-10 text-center text-[oklch(0.65_0.2_25)] text-[13px]'>
          Error loading flashcards:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );

  if (!data?.data || data.data.length === 0) {
    return (
      <div>
        {filters}
        <EmptyState label='No flashcards found' />
      </div>
    );
  }

  const { data: flashcards, metadata } = data;

  return (
    <div>
      {filters}
      <CardGrid>
        {flashcards.map((flashcard) => (
          <FlashCard
            key={flashcard.id}
            flashcard={{
              id: flashcard.id,
              title: flashcard.title,
              description: flashcard.description || 'No description available…',
              time: getTimeAgo(flashcard.lastStudy),
              created_at: new Date(flashcard.lastStudy).toLocaleDateString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                },
              ),
              privacy: flashcard.privacy,
            }}
            onAccess={handleAccess}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </CardGrid>
      <Pagination
        current={currentPage}
        total={metadata.totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentPage((p) => Math.min(metadata.totalPages - 1, p + 1))
        }
      />
    </div>
  );
};

export default FlashcardListPage;
