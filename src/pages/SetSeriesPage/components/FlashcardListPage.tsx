import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import FlashCard, { type Flashcard } from '@/components/cards/FlashCard';
import type {
  ListPrivacyFilter,
  ListCreateMethodFilter,
  ListSortOption,
} from '@/components/lists/ResourceFiltersBar';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
  Pagination,
} from '@/components/lists/ListShared';
import { formatDate, getTimeAgo } from '@/lib/utils';

type FlashcardListPageProps = {
  setId: number;
  search: string;
  privacy: ListPrivacyFilter;
  createMethod: ListCreateMethodFilter;
  sort: ListSortOption;
  onUpdate: (flashcard: Flashcard) => void;
  onDelete: (flashcardId: number | string) => void;
};

const FlashcardListPage = ({
  setId,
  search,
  privacy,
  createMethod,
  sort,
  onUpdate,
  onDelete,
}: FlashcardListPageProps) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [debouncedQ, setDebouncedQ] = useState('');
  const pageSize = 6;
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacy, createMethod, sort]);

  const { data, isLoading, isError, error } = useFlashcards({
    setId,
    page: currentPage,
    size: pageSize,
    sort,
    q: debouncedQ || undefined,
    privacy: privacy || undefined,
    createMethod: createMethod || undefined,
  });

  const handleAccess = (id: number | string) =>
    navigate(`/sets/${setId}/flashcards/${id}`);

  if (isLoading) return <CardGridSkeleton />;

  if (isError)
    return (
      <div className='py-10 text-center text-[oklch(0.65_0.2_25)] text-[13px]'>
        {t('list.flashcards.error', {
          message:
            error instanceof Error ? error.message : t('list.unknownError'),
        })}
      </div>
    );

  if (!data?.data || data.data.length === 0) {
    return <EmptyState label={t('list.flashcards.empty')} />;
  }

  const { data: flashcards, metadata } = data;

  return (
    <div>
      <CardGrid>
        {flashcards.map((flashcard) => (
          <FlashCard
            key={flashcard.id}
            flashcard={{
              id: flashcard.id,
              title: flashcard.title,
              description: flashcard.description || t('list.noDescription'),
              time: getTimeAgo(flashcard.lastStudy),
              created_at: formatDate(flashcard.lastStudy),
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
