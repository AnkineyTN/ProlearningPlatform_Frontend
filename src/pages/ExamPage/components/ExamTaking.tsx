import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookmarkIcon,
  Clock,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Textarea } from '@/components/ui/textarea';
import type { Exam, ExamSubmission } from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ExamTakingProps {
  exam: Exam;
  onSubmit: (
    submissions: ExamSubmission[],
    timeTaken: number,
  ) => void | Promise<void>;
  onAbandon: () => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ExamTaking({
  exam,
  onSubmit,
  onAbandon,
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
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

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

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

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
    if (newAnswers.length > 0) next.add(currentQuestionIndex);
    else next.delete(currentQuestionIndex);
    setAnsweredQuestions(next);
  };

  const handleEssayChange = (questionId: string | number, text: string) => {
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
    if (text.trim()) next.add(currentQuestionIndex);
    else next.delete(currentQuestionIndex);
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

  const questionTypeLabel =
    currentQuestion.type === 'MULTIPLE_CHOICE'
      ? t('exam.common.multipleChoice')
      : currentQuestion.type === 'TRUE_FALSE'
        ? t('exam.common.trueFalse')
        : t('exam.common.essay');

  return (
    <div
      className='flex flex-col min-h-screen'
      style={{ background: 'var(--pl-bg)' }}
    >
      {/* Header */}
      <div
        className='sticky top-0 z-10 flex items-center justify-between px-10 py-4'
        style={{
          borderBottom: '1px solid var(--pl-border)',
          background: 'var(--pl-bg)',
        }}
      >
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setShowLeaveDialog(true)}
            disabled={isSubmitting}
            className='flex items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
            style={{ color: 'var(--pl-text-muted)' }}
          >
            <X size={14} /> Exit exam
          </button>
          <div
            className='h-[18px] w-px'
            style={{ background: 'var(--pl-border)' }}
          />
          <span
            className='text-[11px] uppercase tracking-[0.14em]'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            {exam.title} · Practice Exam
          </span>
        </div>

        <div className='flex items-center gap-5'>
          <div
            className='flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]'
            style={{
              background: isUrgent
                ? 'oklch(0.65 0.2 25 / 0.12)'
                : 'var(--pl-bg-elev)',
              border: `1px solid ${isUrgent ? 'oklch(0.65 0.2 25 / 0.4)' : 'var(--pl-border)'}`,
              color: isUrgent ? 'oklch(0.65 0.2 25)' : 'var(--pl-text-muted)',
              fontFamily: 'var(--font-mono-pl)',
            }}
          >
            <Clock size={13} />
            <span className='font-[500]'>{formatTime(timeRemaining)}</span>
            <span style={{ color: 'var(--pl-text-faint)' }}>
              / {formatTime(exam.timeLimit * 60)}
            </span>
          </div>
          <button
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
            className='px-5 py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
            style={{
              background: 'var(--pl-accent)',
              color: 'var(--pl-accent-fg)',
            }}
          >
            {isSubmitting
              ? t('exam.taking.submitting')
              : t('exam.taking.submitExam')}
          </button>
        </div>
      </div>

      {/* Progress dots */}
      <div
        className='flex items-center gap-3 px-10 py-[14px]'
        style={{ borderBottom: '1px solid var(--pl-border)' }}
      >
        <span
          className='text-[11px] uppercase tracking-[0.14em] flex-shrink-0'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          Question {currentQuestionIndex + 1}/{totalQuestions}
        </span>
        <div className='flex-1 flex gap-1'>
          {exam.questions.map((_, i) => {
            const done = answeredQuestions.has(i);
            const curr = i === currentQuestionIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentQuestionIndex(i)}
                className='flex-1 h-1 rounded-full transition-all'
                style={{
                  background: curr
                    ? 'var(--pl-accent)'
                    : done
                      ? 'var(--pl-success)'
                      : 'var(--pl-border)',
                  opacity: done && !curr ? 0.7 : 1,
                }}
              />
            );
          })}
        </div>
        <span
          className='text-[11.5px] flex-shrink-0'
          style={{
            color: 'var(--pl-text-faint)',
            fontFamily: 'var(--font-mono-pl)',
          }}
        >
          {answeredQuestions.size}/{totalQuestions} answered
        </span>
      </div>

      {/* Main */}
      <div className='flex-1 overflow-auto flex items-start justify-center px-10 py-12'>
        <div style={{ maxWidth: 760, width: '100%' }}>
          {/* Question meta */}
          <div
            className='flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] mb-3'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            <span>{questionTypeLabel}</span>
            <span>·</span>
            <span style={{ color: 'var(--pl-text-faint)' }}>
              {currentQuestion.type === 'MULTIPLE_CHOICE'
                ? 'Multiple answers'
                : currentQuestion.type === 'TRUE_FALSE'
                  ? 'Single answer'
                  : 'Written response'}
            </span>
            <span>·</span>
            <span style={{ color: 'var(--pl-accent-strong)' }}>
              +{currentQuestion.score}{' '}
              {currentQuestion.score === 1 ? 'point' : 'points'}
            </span>
          </div>

          {/* Question text */}
          <h2
            className='text-[28px] font-[400] leading-[1.28] mb-8'
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              color: 'var(--pl-text)',
            }}
          >
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          {currentQuestion.type !== 'ESSAY' ? (
            <div className='flex flex-col gap-[10px]'>
              {currentQuestion.answers.map((answer, idx) => {
                const sel =
                  currentSubmission?.selectedAnswers.includes(answer.id) ??
                  false;
                const letter = OPTION_LABELS[idx] ?? String(idx + 1);
                return (
                  <button
                    key={answer.id}
                    onClick={() =>
                      handleAnswerChange(currentQuestion.id, answer.id, !sel)
                    }
                    onMouseEnter={() => setHoveredOption(answer.id)}
                    onMouseLeave={() => setHoveredOption(null)}
                    className='flex items-center gap-[14px] px-5 py-4 rounded-[12px] text-left transition-all'
                    style={{
                      background: sel
                        ? 'var(--pl-accent-soft)'
                        : hoveredOption === answer.id
                          ? 'var(--pl-bg-hover)'
                          : 'var(--pl-bg-elev)',
                      border: `1.5px solid ${sel ? 'var(--pl-accent)' : hoveredOption === answer.id ? 'var(--pl-border-strong)' : 'var(--pl-border)'}`,
                    }}
                  >
                    <div
                      className='w-7 h-7 rounded-[7px] grid place-items-center flex-shrink-0 text-[12px] font-[500]'
                      style={{
                        background: sel ? 'var(--pl-bg)' : 'var(--pl-bg-hover)',
                        border: '1px solid var(--pl-border)',
                        color: sel
                          ? 'var(--pl-accent-strong)'
                          : 'var(--pl-text-muted)',
                        fontFamily: 'var(--font-mono-pl)',
                      }}
                    >
                      {letter}
                    </div>
                    <span
                      className='flex-1 text-[14.5px] leading-[1.5]'
                      style={{ color: 'var(--pl-text)' }}
                    >
                      {answer.text}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Textarea
              value={currentSubmission?.essayAnswer || ''}
              onChange={(e) =>
                handleEssayChange(currentQuestion.id, e.target.value)
              }
              placeholder={t('exam.taking.essayPlaceholder')}
              className='w-full min-h-[200px] resize-none'
              style={{
                background: 'var(--pl-bg-elev)',
                border: '1px solid var(--pl-border)',
                color: 'var(--pl-text)',
              }}
            />
          )}

          {/* Unanswered warning */}
          {!isAnswered && currentQuestion.type !== 'ESSAY' && (
            <div
              className='mt-6 p-3 rounded-lg text-[12px] flex items-center gap-2'
              style={{
                background: 'var(--pl-warning, oklch(0.78 0.15 75)) / 0.1',
                border: '1px solid oklch(0.78 0.15 75 / 0.3)',
                color: 'var(--pl-text-muted)',
              }}
            >
              <AlertCircle size={13} />
              {t('exam.taking.notAnsweredWarning')}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className='sticky bottom-0 flex items-center justify-between px-10 py-4'
        style={{
          borderTop: '1px solid var(--pl-border)',
          background: 'var(--pl-bg-elev)',
        }}
      >
        <button
          onClick={() => setCurrentQuestionIndex((p) => Math.max(0, p - 1))}
          disabled={currentQuestionIndex === 0}
          className='flex items-center gap-2 px-[18px] py-[10px] rounded-full text-[13px] transition-opacity disabled:opacity-30'
          style={{
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text-muted)',
          }}
        >
          <ArrowLeft size={12} /> {t('exam.taking.previous')}
        </button>

        <button
          onClick={toggleFlag}
          className='flex items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
          style={{
            color: isFlagged
              ? 'var(--pl-accent-strong)'
              : 'var(--pl-text-faint)',
          }}
        >
          <BookmarkIcon size={12} fill={isFlagged ? 'currentColor' : 'none'} />
          Flag for review
        </button>

        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() =>
              setCurrentQuestionIndex((p) =>
                Math.min(totalQuestions - 1, p + 1),
              )
            }
            className='flex items-center gap-2 px-[22px] py-[10px] rounded-full text-[13px] font-[500] transition-colors'
            style={{
              background: 'var(--pl-accent)',
              color: 'var(--pl-accent-fg)',
            }}
          >
            {t('exam.taking.next')} <ArrowRight size={12} />
          </button>
        ) : (
          <button
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
            className='flex items-center gap-2 px-[22px] py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
            style={{
              background: 'var(--pl-accent)',
              color: 'var(--pl-accent-fg)',
            }}
          >
            {isSubmitting
              ? t('exam.taking.submitting')
              : t('exam.taking.submitExam')}{' '}
            <ArrowRight size={12} />
          </button>
        )}
      </div>

      {/* Leave dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exam.taking.leaveTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('exam.taking.leaveDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('exam.taking.stayContinue')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowLeaveDialog(false);
                onAbandon();
              }}
            >
              {t('exam.taking.leaveConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exam.taking.submitTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('exam.taking.submitConfirm', {
                answered: answeredQuestions.size,
                total: totalQuestions,
              })}
              {answeredQuestions.size < totalQuestions && (
                <span
                  className='block mt-2'
                  style={{ color: 'var(--pl-warning)' }}
                >
                  {t('exam.taking.unansweredWarning')}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('exam.taking.continueExam')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={() => {
                setShowSubmitDialog(false);
                void handleSubmit();
              }}
            >
              {t('exam.taking.submitExam')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
