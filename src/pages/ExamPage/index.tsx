import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ExamHomeView from './components/ExamHomeView';
import ExamTaking from './components/ExamTaking';
import ExamResults from './components/ExamResults';
import type { Exam, ExamResult, ExamSubmission } from './types';
import { useExamDetail } from '@/hooks/useExams';
import { useSessionTracker } from '@/hooks/useSessionTracker';
import { apiQuizDetailToExam } from './utils/examMapper';
import {
  buildExamAttemptAnswers,
  examAttemptDetailToExamResult,
} from './utils/examAttemptUtils';
import { examAPI } from '@/services/endpoints/exam';
import type { ExamAttemptSummary } from '@/services/types/exam.types';

type ViewMode = 'home' | 'taking' | 'results';

type Props = {
  setId: number;
  examId: number | string;
};

export default function ExamPage({ setId, examId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttemptSummary | null>(
    null,
  );
  const [submittedAttemptId, setSubmittedAttemptId] = useState<number | null>(
    null,
  );
  const [isStartingAttempt, setIsStartingAttempt] = useState(false);

  const { recordItem, flush } = useSessionTracker({
    contentType: 'EXAM',
    setId: Number(examId),
  });

  const { data, isLoading, isError } = useExamDetail(Number(setId), examId);

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
    } catch {
      toast.error(t('exam.page.startAttemptError'));
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
      setExamResult(mapped);
      setSubmittedAttemptId(activeAttempt.id);
      setActiveAttempt(null);
      setViewMode('results');
    } catch {
      toast.error(t('exam.page.submitError'));
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
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            {t('exam.page.loadError')}
          </p>
          <button
            onClick={() => navigate(`/sets/${setId}/exams`)}
            className='text-primary hover:underline'
          >
            {t('exam.backToExams')}
          </button>
        </div>
      </div>
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
              onClick={() => navigate(`/sets/${setId}/exams`)}
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
        examId={Number(examId)}
        onStartExam={handleStartExam}
        onEditExam={handleEditExam}
        onBack={() => navigate(`/sets/${setId}/exams`)}
        isStarting={isStartingAttempt}
        userRole={userRole}
        isFavorited={data?.data?.isFavorited}
      />
    );
  }

  if (viewMode === 'taking') {
    return (
      <ExamTaking
        exam={exam}
        onSubmit={handleSubmitExam}
        onAbandon={handleAbandonAttempt}
        onRecordItem={recordItem}
      />
    );
  }

  if (viewMode === 'results' && examResult) {
    return (
      <ExamResults
        setId={Number(setId)}
        examId={Number(examId)}
        exam={exam}
        result={examResult}
        attemptId={submittedAttemptId ?? undefined}
      />
    );
  }

  return null;
}
