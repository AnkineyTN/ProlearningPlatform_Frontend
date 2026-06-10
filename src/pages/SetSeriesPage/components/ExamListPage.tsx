import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ExamCard, { type ExamCardData } from '@/components/cards/ExamCard';
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
import { useExams } from '@/hooks/useExams';

interface ExamListPageProps {
  setId: number;
  search: string;
  privacy: ListPrivacyFilter;
  createMethod: ListCreateMethodFilter;
  sort: ListSortOption;
  onUpdate: (exam: ExamCardData) => void;
  onDelete: (examId: number | string) => void;
}

export default function ExamListPage({
  setId,
  search,
  privacy,
  createMethod,
  sort,
  onUpdate,
  onDelete,
}: ExamListPageProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [debouncedQ, setDebouncedQ] = useState('');
  const pageSize = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacy, createMethod, sort]);

  const { data, isLoading, isError } = useExams({
    setId,
    page: currentPage,
    size: pageSize,
    sort,
    q: debouncedQ || undefined,
    privacy: privacy || undefined,
    createMethod: createMethod || undefined,
  });

  const exams = data?.data ?? [];
  const totalPages = data?.metadata?.totalPages ?? 1;

  const handleAccess = (id: string) => navigate(`/sets/${setId}/exams/${id}`);

  if (isLoading) return <CardGridSkeleton />;

  if (isError)
    return (
      <div className='py-10 text-center text-[oklch(0.65_0.2_25)] text-[13px]'>
        {t('list.exams.error')}
      </div>
    );

  if (exams.length === 0) return <EmptyState label={t('list.exams.empty')} />;

  return (
    <div>
      <CardGrid>
        {exams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={{
              id: exam.id,
              title: exam.title,
              description: exam.description,
              numQuestions: exam.numQuestions,
              duration: exam.duration,
              createdAt: exam.createdAt,
              privacy: exam.privacy,
            }}
            onAccess={handleAccess}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </CardGrid>
      <Pagination
        current={currentPage}
        total={totalPages}
        onChange={(p) => setCurrentPage(p)}
      />
    </div>
  );
}
