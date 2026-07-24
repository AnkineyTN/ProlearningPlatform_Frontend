import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { ResourceAccessError } from '@/components/collaboration/ResourceAccessError';
import ExamHomeView from './components/ExamHomeView';
import ExamTaking from './components/ExamTaking';
import type { Exam, ExamSubmission } from './types';
import { useExamDetail } from '@/hooks/useExams';
import { useBackTo } from '@/hooks/useBackTo';
import { useSessionTracker } from '@/hooks/useSessionTracker';
import { apiQuizDetailToExam } from './utils/examMapper';
import {
  buildExamAttemptAnswers,
  examAttemptDetailToExamResult,
} from './utils/examAttemptUtils';
import { examAPI } from '@/services/endpoints/exam';
import type { ExamAttemptSummary } from '@/services/types/exam.types';

type ViewMode = 'home' | 'taking';

type Props = {
  setId: number;
  examId: number | string;
};

export default function ExamPage({ setId, examId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backTo = useBackTo();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeAttempt, setActiveAttempt] = useState<ExamAttemptSummary | null>(
    null,
  );
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);

  const numericExamId = Number(examId);

  const { recordItem, flush } = useSessionTracker({
    contentType: 'EXAM',
    setId: numericExamId,
  });

  const { data, isLoading, isError, error, refetch } = useExamDetail(
    Number(setId),
    numericExamId,
  );

  const exam: Exam | null = data?.data ? apiQuizDetailToExam(data.data) : null;
  const userRole = data?.data?.userRole ?? 'OWNER';
  const hasNoQuestions = exam !== null && exam.questions.length === 0;

  const handleStartExam = async () => {
    setIsStartingAttempt(true);
    try {
      const res = await examAPI.startExamAttempt(Number(setId), Number(examId));
      const attempt = res.data?.data;
      if (!attempt?.id) {
        toast.error(t('exam.page.startAttemptError'));
        return;
      }
      setActiveAttempt(attempt);
      setViewMode('taking');
    } catch (error) {
      toast.error(apiErrorMessage(error, t('exam.page.startAttemptError')));
    } finally {
      setIsStartingAttempt(false);
    }
  };

  const handleEditExam = () => {
    navigate(`/sets/${setId}/exams/${examId}/edit`, {
      state: {
        title: exam?.title,
        description: exam?.description,
        privacy: exam?.privacy,
      },
    });
  };

  const handleAbandonAttempt = () => {
    setActiveAttempt(null);
    setViewMode('home');
  };

  const handleSubmitExam = async (
    submissions: ExamSubmission[],
    timeTaken: number,
  ) => {
    if (!exam || !activeAttempt) return;

    const answers = buildExamAttemptAnswers(exam, submissions);
    try {
      const res = await examAPI.submitExamAttempt(
        Number(setId),
        Number(examId),
        activeAttempt.id,
        { answers },
      );
      const detail = res.data?.data;
      if (!detail) {
        toast.error(t('exam.page.submitError'));
        return;
      }
      const mapped = examAttemptDetailToExamResult(
        detail,
        exam,
        submissions,
        timeTaken,
      );
      await flush(Math.round(mapped.percentage));
      const attemptId = activeAttempt.id;
      setActiveAttempt(null);
      setViewMode('home');
      navigate(`/sets/${setId}/exams/${examId}/attempts/${attemptId}`, {
        state: { result: mapped, backTo },
      });
    } catch (error) {
      toast.error(apiErrorMessage(error, t('exam.page.submitError')));
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>
          {t('exam.page.loading')}
        </div>
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <ResourceAccessError
        resource='exam'
        error={error}
        onRetry={refetch}
        className='min-h-[calc(100vh-200px)]'
      />
    );
  }

  if (hasNoQuestions) {
    return (
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center p-8'>
        <div className='max-w-md w-full text-center bg-[var(--pl-bg)] border border-border rounded-xl p-8 shadow-lg'>
          <p className='text-muted-foreground mb-6'>
            {t('exam.page.emptyDescription')}
          </p>
          <div className='flex flex-col gap-3'>
            <button
              onClick={() =>
                navigate(`/sets/${setId}/exams/${examId}/edit`, {
                  state: {
                    title: exam?.title,
                    description: exam?.description,
                    privacy: exam?.privacy,
                  },
                })
              }
              className='text-primary hover:underline font-medium'
            >
              {t('exam.page.goToEditor')}
            </button>
            <button
              onClick={() => navigate(backTo ?? `/sets/${setId}/exams`)}
              className='text-muted-foreground hover:text-foreground text-sm'
            >
              {t('exam.page.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'home') {
    return (
      <ExamHomeView
        exam={exam}
        setId={Number(setId)}
        examId={numericExamId}
        onStartExam={handleStartExam}
        onEditExam={handleEditExam}
        onBack={() => navigate(backTo ?? `/sets/${setId}/exams`)}
        isStarting={isStartingAttempt}
        userRole={userRole}
        isFavorited={data?.data?.isFavorited}
      />
    );
  }

  if (viewMode === 'taking' && activeAttempt) {
    return (
      <ExamTaking
        exam={exam}
        deadlineAt={activeAttempt.deadlineAt}
        onSubmit={handleSubmitExam}
        onAbandon={handleAbandonAttempt}
        onRecordItem={recordItem}
      />
    );
  }

  return null;
}
