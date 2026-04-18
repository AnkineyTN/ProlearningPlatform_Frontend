import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExamCard, { type ExamCardData } from "@/components/cards/ExamCard";
import {
  ResourceFiltersBar,
  type ListPrivacyFilter,
  type ListCreateMethodFilter,
  type ListSortOption,
} from "@/components/lists/ResourceFiltersBar";
import { Button } from "@/components/ui/button";
import { useExams } from "@/hooks/useExams";
import { ChevronLeft, ChevronRight, FileX } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>("");
  const [createMethodFilter, setCreateMethodFilter] = useState<ListCreateMethodFilter>("");
  const [sort, setSort] = useState<ListSortOption>("id,DESC");
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
  const metadata = data?.metadata;
  const totalPages = metadata?.totalPages ?? 1;

  const handleAccess = (id: string) => {
    navigate(`/sets/${setId}/exams/${id}`);
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='bg-card rounded-xl p-5 h-40 animate-pulse'
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {filters}
        <div className='text-center py-12 text-muted-foreground'>
          Failed to load exams. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      {filters}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
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
      </div>

      {exams.length === 0 && (
        <div className='flex flex-col justify-center items-center min-h-[400px]'>
          <FileX className='mx-auto mb-4 w-20 h-20' />
          <div className='text-muted-foreground'>No exams found</div>
        </div>
      )}

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-4'>
          <Button
            variant='ghost'
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className='p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
          >
            <ChevronLeft className='text-foreground' />
          </Button>
          <span className='text-sm font-medium'>
            {currentPage + 1}/{totalPages}
          </span>
          <Button
            variant='ghost'
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
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
