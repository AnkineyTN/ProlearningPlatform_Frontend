import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Exam, ExamSubmission } from '../../types';
import ExamTakingFooter from './ExamTakingFooter';
import ExamTakingHeader from './ExamTakingHeader';
import ExamTakingProgress from './ExamTakingProgress';
import ExamTakingQuestion from './ExamTakingQuestion';
import LeaveExamDialog from './LeaveExamDialog';
import SubmitExamDialog from './SubmitExamDialog';

interface ExamTakingProps {
  exam: Exam;
  onSubmit: (
    submissions: ExamSubmission[],
    timeTaken: number,
  ) => void | Promise<void>;
  onAbandon: () => void;
  onRecordItem?: () => void;
}

export default function ExamTaking({
  exam,
  onSubmit,
  onAbandon,
  onRecordItem,
}: ExamTakingProps) {
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState<
    Map<string | number, ExamSubmission>
  >(new Map());
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [flagged, setFlagged] = useState<Set<number>>(new Set());

  const timeRemainingRef = useRef(0);
  const [timeRemaining, setTimeRemaining] = useState(() =>
    Math.max(0, exam.timeLimit * 60),
  );
  const isSubmittingRef = useRef(false);
  const submissionsRef = useRef(submissions);
  const onSubmitRef = useRef(onSubmit);
  const submitFromTimerRef = useRef<(timeExpired?: boolean) => Promise<void>>(
    async () => {},
  );

  const currentQuestion = exam.questions[currentQuestionIndex];
  const totalQuestions = exam.questions.length;

  submissionsRef.current = submissions;
  onSubmitRef.current = onSubmit;
  timeRemainingRef.current = timeRemaining;

  useEffect(() => {
    const total = Math.max(0, exam.timeLimit * 60);
    setTimeRemaining(total);
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void submitFromTimerRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam.timeLimit]);

  const handleAnswerChange = (
    questionId: string | number,
    answerId: string,
    isChecked: boolean,
  ) => {
    const current = submissions.get(questionId) || {
      questionId,
      selectedAnswers: [],
    };
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return;

    const newAnswers: string[] =
      question.type === 'TRUE_FALSE'
        ? [answerId]
        : isChecked
          ? [...current.selectedAnswers, answerId]
          : current.selectedAnswers.filter((id) => id !== answerId);

    setSubmissions(
      new Map(
        submissions.set(questionId, {
          ...current,
          selectedAnswers: newAnswers,
        }),
      ),
    );
    const next = new Set(answeredQuestions);
    if (newAnswers.length > 0) {
      next.add(currentQuestionIndex);
      onRecordItem?.();
    } else {
      next.delete(currentQuestionIndex);
    }
    setAnsweredQuestions(next);
  };

  const handleEssayChange = (questionId: string | number, text: string) => {
    const wasEmpty = !submissions.get(questionId)?.essayAnswer?.trim();
    setSubmissions(
      new Map(
        submissions.set(questionId, {
          questionId,
          selectedAnswers: [],
          essayAnswer: text,
        }),
      ),
    );
    const next = new Set(answeredQuestions);
    if (text.trim()) {
      next.add(currentQuestionIndex);
      if (wasEmpty) onRecordItem?.();
    } else {
      next.delete(currentQuestionIndex);
    }
    setAnsweredQuestions(next);
  };

  const handleSubmit = async (timeExpired = false) => {
    if (isSubmittingRef.current) return;
    if (timeExpired) toast.warning(t('exam.taking.timeUp'));
    const cap = exam.timeLimit * 60;
    const timeTaken = Math.min(
      cap,
      Math.max(0, cap - timeRemainingRef.current),
    );
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onSubmitRef.current(
          Array.from(submissionsRef.current.values()),
          timeTaken,
        ),
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  submitFromTimerRef.current = handleSubmit;

  const currentSubmission = submissions.get(currentQuestion.id);
  const isAnswered = answeredQuestions.has(currentQuestionIndex);
  const isFlagged = flagged.has(currentQuestionIndex);
  const isUrgent = timeRemaining < 300;

  const toggleFlag = () => {
    const next = new Set(flagged);
    if (isFlagged) next.delete(currentQuestionIndex);
    else next.add(currentQuestionIndex);
    setFlagged(next);
  };

  return (
    <div
      className='flex flex-col min-h-screen'
      style={{ background: 'var(--pl-bg)' }}
    >
      <ExamTakingHeader
        title={exam.title}
        timeRemaining={timeRemaining}
        timeLimitSeconds={exam.timeLimit * 60}
        isUrgent={isUrgent}
        isSubmitting={isSubmitting}
        onExit={() => setShowLeaveDialog(true)}
        onSubmit={() => setShowSubmitDialog(true)}
      />

      <ExamTakingProgress
        totalQuestions={totalQuestions}
        currentQuestionIndex={currentQuestionIndex}
        answeredQuestions={answeredQuestions}
        onSelect={setCurrentQuestionIndex}
      />

      <ExamTakingQuestion
        question={currentQuestion}
        submission={currentSubmission}
        isAnswered={isAnswered}
        onSelectAnswer={handleAnswerChange}
        onEssayChange={handleEssayChange}
      />

      <ExamTakingFooter
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        isFlagged={isFlagged}
        isSubmitting={isSubmitting}
        onPrev={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
        onNext={() =>
          setCurrentQuestionIndex((p) => Math.min(totalQuestions - 1, p + 1))
        }
        onToggleFlag={toggleFlag}
        onSubmit={() => setShowSubmitDialog(true)}
      />

      <LeaveExamDialog
        open={showLeaveDialog}
        onOpenChange={setShowLeaveDialog}
        onConfirm={onAbandon}
      />

      <SubmitExamDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        answeredCount={answeredQuestions.size}
        totalQuestions={totalQuestions}
        isSubmitting={isSubmitting}
        onConfirm={() => void handleSubmit()}
      />
    </div>
  );
}
