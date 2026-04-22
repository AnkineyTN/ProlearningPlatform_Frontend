import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  FileX,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useExams } from '@/hooks/useExams';
import FlashCard, { type Flashcard } from '@/components/cards/FlashCard';
import ExamCard, { type ExamCardData } from '@/components/cards/ExamCard';
import { getTimeAgo } from '@/lib/utils';

type ReviewListPageProps = {
  setId: number;
};

export default function ReviewListPage({ setId }: ReviewListPageProps) {
  const navigate = useNavigate();
  const [flashcardPage, setFlashcardPage] = useState(0);
  const [examPage, setExamPage] = useState(0);
  const pageSize = 6;

  const { data: flashcardsData, isLoading: loadingFC } = useFlashcards({
    setId,
    page: flashcardPage,
    size: pageSize,
    createMethod: 'REVIEW',
  });

  const { data: examsData, isLoading: loadingExam } = useExams({
    setId,
    page: examPage,
    size: pageSize,
    createMethod: 'REVIEW',
  });

  const flashcards = flashcardsData?.data ?? [];
  const fcTotalPages = flashcardsData?.metadata?.totalPages ?? 1;

  const exams = examsData?.data ?? [];
  const examTotalPages = examsData?.metadata?.totalPages ?? 1;

  const noContent =
    !loadingFC && !loadingExam && flashcards.length === 0 && exams.length === 0;

  if (noContent) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[300px] gap-3 text-center'>
        <Inbox className='w-16 h-16 text-muted-foreground/40' />
        <p className='text-muted-foreground font-medium'>
          Chưa có nội dung ôn tập
        </p>
        <p className='text-sm text-muted-foreground/70 max-w-sm'>
          Tạo Flashcard hoặc Exam từ{' '}
          <a href='/review-bundles' className='text-purple-500 hover:underline'>
            Review Bundles
          </a>{' '}
          để xem ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Flashcards section */}
      <section>
        <div className='flex items-center gap-2 mb-4'>
          <BookOpen className='w-4 h-4 text-purple-500' />
          <h2 className='font-semibold text-sm uppercase tracking-wider text-muted-foreground'>
            Flashcards ôn tập
          </h2>
        </div>

        {loadingFC ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-[var(--pl-bg)] rounded-xl h-36 animate-pulse'
              />
            ))}
          </div>
        ) : flashcards.length === 0 ? (
          <div className='flex items-center gap-2 py-6 text-muted-foreground text-sm'>
            <FileX className='w-5 h-5' />
            <span>Chưa có Flashcard ôn tập nào.</span>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
              {flashcards.map((fc) => (
                <FlashCard
                  key={fc.id}
                  flashcard={{
                    id: fc.id,
                    title: fc.title,
                    description: fc.description || 'Flashcard ôn tập',
                    time: getTimeAgo(fc.lastStudy),
                    created_at: new Date(fc.lastStudy).toLocaleDateString(
                      'en-GB',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      },
                    ),
                    privacy: fc.privacy,
                  }}
                  onAccess={(id) => navigate(`/sets/${setId}/flashcards/${id}`)}
                  onUpdate={(_fc: Flashcard) => {}}
                  onDelete={(_id: number | string) => {}}
                />
              ))}
            </div>

            {fcTotalPages > 1 && (
              <div className='flex justify-center items-center gap-4'>
                <Button
                  variant='ghost'
                  onClick={() => setFlashcardPage((p) => Math.max(0, p - 1))}
                  disabled={flashcardPage === 0}
                  className='cursor-pointer'
                >
                  <ChevronLeft />
                </Button>
                <span className='text-sm'>
                  {flashcardPage + 1} / {fcTotalPages}
                </span>
                <Button
                  variant='ghost'
                  onClick={() =>
                    setFlashcardPage((p) => Math.min(fcTotalPages - 1, p + 1))
                  }
                  disabled={flashcardPage >= fcTotalPages - 1}
                  className='cursor-pointer'
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Exams section */}
      <section>
        <div className='flex items-center gap-2 mb-4'>
          <FileText className='w-4 h-4 text-pink-500' />
          <h2 className='font-semibold text-sm uppercase tracking-wider text-muted-foreground'>
            Exams ôn tập
          </h2>
        </div>

        {loadingExam ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='bg-[var(--pl-bg)] rounded-xl h-36 animate-pulse'
              />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className='flex items-center gap-2 py-6 text-muted-foreground text-sm'>
            <FileX className='w-5 h-5' />
            <span>Chưa có Exam ôn tập nào.</span>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
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
                  onAccess={(id) => navigate(`/sets/${setId}/exams/${id}`)}
                  onUpdate={(_exam: ExamCardData) => {}}
                  onDelete={(_id: number | string) => {}}
                />
              ))}
            </div>

            {examTotalPages > 1 && (
              <div className='flex justify-center items-center gap-4'>
                <Button
                  variant='ghost'
                  onClick={() => setExamPage((p) => Math.max(0, p - 1))}
                  disabled={examPage === 0}
                  className='cursor-pointer'
                >
                  <ChevronLeft />
                </Button>
                <span className='text-sm'>
                  {examPage + 1} / {examTotalPages}
                </span>
                <Button
                  variant='ghost'
                  onClick={() =>
                    setExamPage((p) => Math.min(examTotalPages - 1, p + 1))
                  }
                  disabled={examPage >= examTotalPages - 1}
                  className='cursor-pointer'
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
