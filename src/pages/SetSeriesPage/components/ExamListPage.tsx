import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ExamCard, { type ExamCardData } from '@/components/cards/ExamCard';
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
import { useExams } from '@/hooks/useExams';

interface ExamListPageProps {
  setId: number;
  onUpdate: (exam: ExamCardData) => void;
  onDelete: (examId: number | string) => void;
}

export default function ExamListPage({
  setId,
  onUpdate,
  onDelete,
}: ExamListPageProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>('');
  const [createMethodFilter, setCreateMethodFilter] =
    useState<ListCreateMethodFilter>('');
  const [sort, setSort] = useState<ListSortOption>('id,DESC');
  const pageSize = 9;
  const navigate = useNavigate();

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(listSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [listSearch]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacyFilter, createMethodFilter, sort]);

  const { data, isLoading, isError } = useExams({
    setId,
    page: currentPage,
    size: pageSize,
    sort,
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
    createMethod: createMethodFilter || undefined,
  });

  const exams = data?.data ?? [];
  const totalPages = data?.metadata?.totalPages ?? 1;

  const handleAccess = (id: string) => navigate(`/sets/${setId}/exams/${id}`);

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
          {t('list.exams.error')}
        </div>
      </div>
    );

  if (exams.length === 0)
    return (
      <div>
        {filters}
        <EmptyState label={t('list.exams.empty')} />
      </div>
    );

  return (
    <div>
      {filters}
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
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
      />
    </div>
  );
}
