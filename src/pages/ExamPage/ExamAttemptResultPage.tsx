import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useExamAttempt, useExamDetail } from '@/hooks/useExams';

import ExamResults from './components/ExamResults';
import type { Exam, ExamResult } from './types';
import { examAttemptDetailToExamResult } from './utils/examAttemptUtils';
import { apiQuizDetailToExam } from './utils/examMapper';

export default function ExamAttemptResultPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setId, examId, attemptId } = useParams();
  const location = useLocation();

  const sid = Number(setId);
  const eid = Number(examId);
  const aid = Number(attemptId);

  const passedResult = (location.state as { result?: ExamResult } | null)
    ?.result;

  const {
    data: examData,
    isLoading: examLoading,
    isError: examError,
  } = useExamDetail(sid, eid);

  const {
    data: attemptData,
    isLoading: attemptLoading,
    isError: attemptError,
  } = useExamAttempt(sid, eid, aid, !passedResult);

  const exam: Exam | null = examData?.data
    ? apiQuizDetailToExam(examData.data)
    : null;

  const result: ExamResult | null =
    passedResult ??
    (exam && attemptData?.data
      ? examAttemptDetailToExamResult(attemptData.data, exam, [], 0)
      : null);

  const isLoading = examLoading || (!passedResult && attemptLoading);

  if (isLoading) {
    return (
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center'>
        <div className='animate-pulse text-muted-foreground'>
          {t('exam.page.loading')}
        </div>
      </div>
    );
  }

  if (examError || (!passedResult && attemptError) || !exam || !result) {
    return (
      <div className='min-h-[calc(100vh-200px)] flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            {t('exam.page.loadError')}
          </p>
          <button
            onClick={() => navigate(`/sets/${sid}/exams/${eid}`)}
            className='text-primary hover:underline'
          >
            {t('exam.results.viewExam')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamResults
      setId={sid}
      examId={eid}
      exam={exam}
      result={result}
      attemptId={aid}
    />
  );
}
