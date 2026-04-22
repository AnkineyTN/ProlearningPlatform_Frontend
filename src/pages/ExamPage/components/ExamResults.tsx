import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Sparkles,
  History,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Exam, ExamResult } from '../types';
import type {
  ExamAttemptDetail,
  ExamAttemptSummary,
  ExamGradedAnswer,
} from '@/services/types/exam.types';
import { examAPI } from '@/services/endpoints/exam';
import ModeToggle from '@/components/theme/mode-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import {
  useExamQuestionStats,
  useGenerateReviewExam,
} from '@/hooks/useReviewBundles';
import { toast } from 'react-toastify';

interface ExamResultsProps {
  setId: number;
  examId: number;
  exam: Exam;
  result: ExamResult;
}

export default function ExamResults({
  setId,
  examId,
  exam,
  result,
}: ExamResultsProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openQuestions, setOpenQuestions] = useState<
    Record<string | number, boolean>
  >(() => {
    const initial: Record<string | number, boolean> = {};
    exam.questions.forEach((q) => {
      const graded = result.gradedByBackend?.find(
        (g) => String(g.questionId) === String(q.id),
      );
      if (graded) {
        initial[q.id] = q.type === 'ESSAY' ? true : !graded.isCorrect;
        return;
      }
      const correctAnswerIds = q.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id);
      const submission = result.submissions.find((s) => s.questionId === q.id);
      const selectedAnswerIds = submission?.selectedAnswers ?? [];
      if (q.type === 'ESSAY') {
        initial[q.id] = true;
      } else {
        const isCorrect =
          correctAnswerIds.length === selectedAnswerIds.length &&
          correctAnswerIds.every((id) => selectedAnswerIds.includes(id));
        initial[q.id] = !isCorrect;
      }
    });
    return initial;
  });
  const [aiDialog, setAiDialog] = useState<{
    open: boolean;
    questionId: string | number | null;
    loading: boolean;
    explanation: string;
  }>({ open: false, questionId: null, loading: false, explanation: '' });

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyAttempts, setHistoryAttempts] = useState<ExamAttemptSummary[]>(
    [],
  );

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ExamAttemptDetail | null>(null);

  // Retry Wrong Answers (Flow 2)
  const [retryOpen, setRetryOpen] = useState(false);
  const [selectedRetryIds, setSelectedRetryIds] = useState<Set<number>>(
    new Set(),
  );
  const [retryDone, setRetryDone] = useState(false);
  const { data: questionStatsData, isLoading: statsLoading } =
    useExamQuestionStats(setId, examId);
  const generateReviewExam = useGenerateReviewExam();

  const formatAttemptDateTime = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const normalized = iso
      .trim()
      .replace(/(\.\d{3})\d+/, '$1')
      .replace(' ', 'T');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(i18n.language, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  useEffect(() => {
    if (!historyOpen) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(false);
    examAPI
      .listExamAttempts(setId, examId)
      .then((res) => {
        if (cancelled) return;
        const rows = res.data?.data ?? [];
        const sorted = [...rows].sort((a, b) => {
          const ts = (x: ExamAttemptSummary) => {
            const raw = x.submittedAt ?? x.startedAt;
            const n = raw.replace(/(\.\d{3})\d+/, '$1').replace(' ', 'T');
            const ms = new Date(n).getTime();
            return Number.isNaN(ms) ? 0 : ms;
          };
          return ts(b) - ts(a) || b.id - a.id;
        });
        setHistoryAttempts(sorted);
      })
      .catch(() => {
        if (!cancelled) setHistoryError(true);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [historyOpen, setId, examId]);

  const openAttemptDetail = (attemptId: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    examAPI
      .getExamAttempt(setId, examId, attemptId)
      .then((res) => {
        setDetailData(res.data?.data ?? null);
      })
      .catch(() => {
        setDetailData(null);
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return t('exam.results.timeFormatted', { mins, secs });
  };

  const getSubmissionForQuestion = (questionId: string | number) =>
    result.submissions.find((s) => s.questionId === questionId);

  const getGradedForQuestion = (
    questionId: string | number,
  ): ExamGradedAnswer | undefined =>
    result.gradedByBackend?.find(
      (g) => String(g.questionId) === String(questionId),
    );

  const isAnswerCorrect = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const graded = getGradedForQuestion(questionId);
    if (graded) return graded.isCorrect;
    const submission = getSubmissionForQuestion(questionId);
    if (!question || !submission) {
      return question?.type === 'ESSAY' ? null : false;
    }
    if (question.type === 'ESSAY') return null;
    const correctAnswerIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);
    const selectedAnswerIds = submission.selectedAnswers;
    if (correctAnswerIds.length !== selectedAnswerIds.length) return false;
    return correctAnswerIds.every((id) => selectedAnswerIds.includes(id));
  };

  const getQuestionScore = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const graded = getGradedForQuestion(questionId);
    if (graded) return graded.earnedPoints ?? 0;
    const correct = isAnswerCorrect(questionId);
    if (!question) return 0;
    if (correct === null) return 0;
    return correct ? question.score : 0;
  };

  const isOptionSelected = (
    answerId: string,
    graded: ExamGradedAnswer | undefined,
    submissionSelected: boolean,
  ) => {
    if (graded && graded.selectedOptionId != null) {
      return (
        String(graded.selectedOptionId) === answerId ||
        Number(answerId) === graded.selectedOptionId
      );
    }
    return submissionSelected;
  };

  const scrollToQuestion = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    // Auto-expand if collapsed
    const qId = exam.questions[index].id;
    setOpenQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const handleExplainWithAI = async (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return;
    const submission = getSubmissionForQuestion(questionId);
    const graded = getGradedForQuestion(questionId);

    setAiDialog({ open: true, questionId, loading: true, explanation: '' });

    try {
      const correctFromUi = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.text)
        .join(', ');
      const correctAnswer =
        graded?.expectedAnswer?.trim() ||
        correctFromUi ||
        t('exam.results.noExplanation');
      const userAnswer =
        graded?.studentAnswer?.trim() ||
        (question.type === 'ESSAY'
          ? submission?.essayAnswer?.trim() || ''
          : question.answers
              .filter((a) => submission?.selectedAnswers.includes(a.id))
              .map((a) => a.text)
              .join(', ') || '');

      const res = await examAPI.explainWrongAnswer(setId, {
        question: question.questionText,
        correctAnswer,
        userAnswer,
        language: i18n.language || 'en',
      });

      const text =
        res.data?.data?.explanation?.trim() || t('exam.results.noExplanation');
      setAiDialog({
        open: true,
        questionId,
        loading: false,
        explanation: text,
      });
    } catch {
      setAiDialog({
        open: true,
        questionId,
        loading: false,
        explanation: t('exam.results.failedExplanation'),
      });
    }
  };

  const showExplainAi = (questionId: string | number) => {
    const q = exam.questions.find((x) => x.id === questionId);
    const graded = getGradedForQuestion(questionId);
    if (!q) return false;
    if (q.type === 'ESSAY') return true;
    if (graded) return !graded.isCorrect;
    return isAnswerCorrect(questionId) !== true;
  };

  const totalNonEssay = exam.questions.filter((q) => q.type !== 'ESSAY').length;
  const correctCount = exam.questions.filter(
    (q) => isAnswerCorrect(q.id) === true,
  ).length;

  return (
    <TooltipProvider>
      <div className='bg-background flex h-[calc(100dvh-35px)] min-h-0 flex-col overflow-hidden'>
        <header className='flex shrink-0 flex-col border-b border-border bg-background z-10'>
          <div className='mx-auto w-full py-3 px-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigate(`/sets/${setId}/exams`)}
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back to Set
                </Button>
                <h1 className='text-xl font-bold'>Exam Results</h1>
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate(`/sets/${setId}/exams/${examId}`)}
                >
                  {t('exam.results.viewExam')}
                </Button>
                <NotificationBell />
                <ModeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className='flex min-h-0 min-w-0 flex-1'>
          <aside className='flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-background'>
            <div className='shrink-0 border-b border-border p-4'>
              <h2 className='font-semibold text-sm mb-1'>
                {t('exam.results.navigatorTitle')}
              </h2>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-3 space-y-1'>
              {exam.questions.map((question, index) => {
                const correct = isAnswerCorrect(question.id);

                let tooltipText = '';
                let bgColor = '';
                let textColor = '';
                let icon = null;

if (correct === true) {
                  tooltipText = t('exam.results.navCorrect');
                  bgColor =
                    'bg-green-500/10 border-green-500/40 hover:bg-green-500/20';
                  textColor = 'text-green-700 dark:text-green-400';
                  icon = <CheckCircle className='w-3 h-3' />;
                } else if (correct === false) {
                  tooltipText = t('exam.results.navIncorrect');
                  bgColor =
                    'bg-red-500/10 border-red-500/40 hover:bg-red-500/20';
                  textColor = 'text-red-700 dark:text-red-400';
                  icon = <XCircle className='w-3 h-3' />;
                } else {
                  tooltipText = t('exam.results.navEssayPending');
                  bgColor =
                    'bg-yellow-500/10 border-yellow-500/40 hover:bg-yellow-500/20';
                  textColor = 'text-yellow-700 dark:text-yellow-400';
                  icon = <Clock className='w-3 h-3' />;
                }

                return (
                  <Tooltip key={question.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => scrollToQuestion(index)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 ${bgColor} ${textColor} text-sm font-medium`}
                      >
                        <span className={`flex-shrink-0 ${textColor}`}>
                          {icon}
                        </span>
                        <span className='truncate'>Q{index + 1}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side='right'>
                      <p className='text-xs font-medium'>{tooltipText}</p>
                      <div className='flex items-center gap-2 truncate max-w-60'>
                        <p className='text-xs text-muted-foreground line-clamp-1 truncate'>
                          {question.questionText}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </aside>

          <main className='min-h-0 min-w-0 flex-1 overflow-y-auto'>
            <div className='max-w-3xl mx-auto px-6 py-8 space-y-6'>
              {/* Summary card */}
              <div className='bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6'>
                <div className='text-center mb-5'>
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3'>
                    {result.passed ? (
                      <Award className='w-8 h-8 text-primary' />
                    ) : (
                      <FileText className='w-8 h-8 text-primary' />
                    )}
                  </div>
                  <h2 className='text-2xl font-bold mb-1'>
                    {result.passed
                      ? t('exam.results.congrats')
                      : t('exam.results.examCompleted')}
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {result.passed
                      ? t('exam.results.passed')
                      : t('exam.results.keepPracticing')}
                  </p>
                </div>
                <div className='grid grid-cols-4 gap-3'>
                  {[
                    {
                      value: `${result.percentage.toFixed(1)}%`,
                      label: t('exam.results.percentage'),
                      colored: true,
                    },
                    {
                      value: `${result.earnedScore}/${result.totalScore}`,
                      label: t('exam.results.score'),
                    },
                    {
                      value: `${correctCount}/${totalNonEssay}`,
                      label: t('exam.results.correctLabel'),
                    },
                    {
                      value: formatTime(result.timeTaken),
                      label: t('exam.results.timeTaken'),
                    },
                  ].map(({ value, label, colored }) => (
                    <div
                      key={label}
                      className='bg-background/50 rounded-lg p-3 text-center'
                    >
                      <div
                        className={`text-2xl font-bold mb-0.5 ${colored ? 'text-primary' : ''}`}
                      >
                        {value}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Review */}
              <div className='bg-[var(--pl-bg)] border border-border rounded-lg p-5'>
                <div className='flex items-center gap-2 mb-5'>
                  <BarChart3 className='w-5 h-5' />
                  <h3 className='text-lg font-semibold'>
                    {t('exam.results.questionReview')}
                  </h3>
                  <Badge variant='outline' className='ml-auto text-xs'>
                    {t('exam.results.correctBadge', {
                      correct: correctCount,
                      total: exam.questions.length,
                    })}
                  </Badge>
                </div>

                <div className='space-y-3'>
                  {exam.questions.map((question, index) => {
                    const submission = getSubmissionForQuestion(question.id);
                    const graded = getGradedForQuestion(question.id);
                    const correct = isAnswerCorrect(question.id);
                    const score = getQuestionScore(question.id);
                    const isOpen = openQuestions[question.id] ?? true;

                    const borderColor = correct === true
                        ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800'
                        : correct === false
                          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800'
                          : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-700';

                    const iconBg = correct === true
                        ? 'bg-green-500 text-white'
                        : correct === false
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white';

                    return (
                      <div
                        key={question.id}
                        ref={(el) => {
                          questionRefs.current[index] = el;
                        }}
                        className={`border-2 rounded-lg transition-all duration-200 ${borderColor}`}
                      >
                        <Collapsible
                          open={isOpen}
                          onOpenChange={(open) =>
                            setOpenQuestions((prev) => ({
                              ...prev,
                              [question.id]: open,
                            }))
                          }
                        >
                          {/* Question Header – always visible */}
                          <div className='flex items-center gap-3 p-4'>
                            <div
                              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${iconBg}`}
                            >
                              {correct === true ? (
                                <CheckCircle className='w-4 h-4' />
                              ) : correct === false ? (
                                <XCircle className='w-4 h-4' />
                              ) : (
                                <Clock className='w-4 h-4' />
                              )}
                            </div>

                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center gap-2 flex-wrap'>
                                <span className='font-semibold text-sm'>
                                  Q{index + 1}
                                </span>
                                <Badge variant='secondary' className='text-xs'>
                                  {question.type === 'MULTIPLE_CHOICE'
                                    ? t('exam.common.multipleChoice')
                                    : question.type === 'TRUE_FALSE'
                                      ? t('exam.common.trueFalse')
                                      : t('exam.common.essay')}
                                </Badge>
                                {correct === null && (
                                  <Badge
                                    variant='outline'
                                    className='text-xs text-yellow-600 border-yellow-500'
                                  >
                                    {t('exam.results.pendingGrading')}
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground truncate mt-0.5 pr-4'>
                                {question.questionText}
                              </p>
                            </div>

                            <div className='flex items-center gap-2 flex-shrink-0'>
                              <span className='text-sm font-semibold whitespace-nowrap'>
                                {score}/{question.score}{' '}
                                {t('exam.common.points')}
                              </span>
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                >
                                  {isOpen ? (
                                    <ChevronUp className='w-4 h-4' />
                                  ) : (
                                    <ChevronDown className='w-4 h-4' />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            </div>
                          </div>

                          {/* Collapsible Body */}
                          <CollapsibleContent>
                            <div className='px-4 pb-4 space-y-4'>
                              <p className='font-medium text-sm'>
                                {question.questionText}
                              </p>

                              {/* Answer choices */}
                              {question.type !== 'ESSAY' && (
                                <div className='space-y-2'>
                                  {question.answers.map((answer) => {
                                    const isSelected = isOptionSelected(
                                      answer.id,
                                      graded,
                                      submission?.selectedAnswers.includes(
                                        answer.id,
                                      ) ?? false,
                                    );
                                    const isCorrectAnswer = answer.isCorrect;
                                    return (
                                      <div
                                        key={answer.id}
                                        className={`p-3 rounded-lg border-2 text-sm ${
                                          isCorrectAnswer
                                            ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                                            : isSelected
                                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
                                              : 'border-border bg-background'
                                        }`}
                                      >
                                        <div className='flex items-center gap-2'>
                                          {isCorrectAnswer && (
                                            <CheckCircle className='w-4 h-4 text-green-600 flex-shrink-0' />
                                          )}
                                          {!isCorrectAnswer && isSelected && (
                                            <XCircle className='w-4 h-4 text-red-600 flex-shrink-0' />
                                          )}
                                          <span
                                            className={
                                              isCorrectAnswer
                                                ? 'font-medium text-green-700 dark:text-green-300'
                                                : isSelected
                                                  ? 'text-red-700 dark:text-red-300'
                                                  : ''
                                            }
                                          >
                                            {answer.text}
                                          </span>
                                          {isCorrectAnswer && (
                                            <span className='ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded'>
                                              {t('exam.common.correct')}
                                            </span>
                                          )}
                                          {!isCorrectAnswer && isSelected && (
                                            <span className='ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded'>
                                              {t('exam.common.yourAnswer')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Essay answer */}
                              {question.type === 'ESSAY' &&
                                (graded?.studentAnswer ||
                                  submission?.essayAnswer) && (
                                  <div className='bg-background border border-border rounded-lg p-4'>
                                    <p className='text-xs font-medium text-muted-foreground mb-2'>
                                      {t('exam.results.yourAnswerLabel')}
                                    </p>
                                    <p className='text-sm whitespace-pre-wrap'>
                                      {graded?.studentAnswer ??
                                        submission?.essayAnswer}
                                    </p>
                                  </div>
                                )}

                              {graded?.expectedAnswer &&
                                question.type !== 'ESSAY' &&
                                !graded.isCorrect && (
                                  <div className='rounded-lg border border-border bg-muted/40 p-3 text-sm'>
                                    <p className='text-xs font-medium text-muted-foreground mb-1'>
                                      {t('exam.results.expectedAnswer')}
                                    </p>
                                    <p className='whitespace-pre-wrap'>
                                      {graded.expectedAnswer}
                                    </p>
                                  </div>
                                )}

                              {graded?.feedback?.trim() && (
                                <div className='rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm'>
                                  <p className='text-xs font-medium text-muted-foreground mb-1'>
                                    {t('exam.results.feedback')}
                                  </p>
                                  <p className='whitespace-pre-wrap'>
                                    {graded.feedback}
                                  </p>
                                </div>
                              )}

                              {/* Action buttons */}
                              <div className='flex items-center gap-2 pt-1'>
                                {showExplainAi(question.id) && (
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='gap-1.5 text-xs h-8'
                                    onClick={() =>
                                      handleExplainWithAI(question.id)
                                    }
                                  >
                                    <Sparkles className='w-3.5 h-3.5 text-purple-500' />
                                    {t('exam.results.explainAI')}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='flex justify-center gap-4 pb-8 flex-wrap'>
                <Button
                  variant='outline'
                  onClick={() => navigate(`/sets/${setId}`)}
                >
                  {t('exam.results.backToSet')}
                </Button>
                <Button
                  variant='default'
                  className='gap-2'
                  onClick={() => setHistoryOpen(true)}
                >
                  <History className='w-4 h-4' />
                  {t('exam.results.viewHistory')}
                </Button>
                <Button
                  variant='outline'
                  className='gap-2 border-orange-400/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer'
                  onClick={() => {
                    setRetryOpen(true);
                    setSelectedRetryIds(new Set());
                    setRetryDone(false);
                  }}
                >
                  <RotateCcw className='w-4 h-4' />
                  Luyện lại câu sai
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className='max-w-4xl max-h-[85vh] flex flex-col gap-0'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <History className='w-5 h-5' />
              {t('exam.results.attemptHistoryTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className='mt-2 min-h-0 flex-1 overflow-y-auto pr-1'>
            {historyLoading && (
              <p className='text-sm text-muted-foreground py-8 text-center'>
                {t('exam.results.attemptHistoryLoading')}
              </p>
            )}
            {historyError && !historyLoading && (
              <p className='text-sm text-destructive py-8 text-center'>
                {t('exam.results.attemptHistoryLoadError')}
              </p>
            )}
            {!historyLoading &&
              !historyError &&
              historyAttempts.length === 0 && (
                <p className='text-sm text-muted-foreground py-8 text-center'>
                  {t('exam.results.attemptHistoryEmpty')}
                </p>
              )}
            {!historyLoading && !historyError && historyAttempts.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('exam.results.tableStatus')}</TableHead>
                    <TableHead>{t('exam.results.tableStarted')}</TableHead>
                    <TableHead>{t('exam.results.tableSubmitted')}</TableHead>
                    <TableHead>{t('exam.results.tableScore')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyAttempts.map((row) => {
                    const submitted =
                      row.status === 'SUBMITTED' || row.submittedAt != null;
                    const scoreLabel =
                      submitted && row.score != null && row.totalPoints != null
                        ? `${row.score}/${row.totalPoints}`
                        : '—';
                    return (
                      <TableRow
                        key={row.id}
                        onClick={() => openAttemptDetail(row.id)}
                        className='cursor-pointer'
                      >
                        <TableCell>
                          <Badge
                            variant={submitted ? 'default' : 'secondary'}
                            className='text-xs'
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-muted-foreground whitespace-normal'>
                          {formatAttemptDateTime(row.startedAt)}
                        </TableCell>
                        <TableCell className='text-muted-foreground whitespace-normal'>
                          {formatAttemptDateTime(row.submittedAt)}
                        </TableCell>
                        <TableCell>{scoreLabel}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailData(null);
        }}
      >
        <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle>{t('exam.results.attemptDetailTitle')}</DialogTitle>
          </DialogHeader>
          <div className='mt-2 min-h-0 flex-1 overflow-y-auto space-y-4 text-sm'>
            {detailLoading && (
              <p className='text-muted-foreground py-6 text-center'>
                {t('exam.results.attemptDetailLoading')}
              </p>
            )}
            {!detailLoading && !detailData && (
              <p className='text-destructive py-6 text-center'>
                {t('exam.results.attemptDetailError')}
              </p>
            )}
            {!detailLoading && detailData && (
              <>
                <div className='grid grid-cols-2 gap-2 text-xs sm:text-sm'>
                  <div>
                    <span className='text-muted-foreground'>
                      {t('exam.results.tableStatus')}:{' '}
                    </span>
                    <Badge variant='outline'>{detailData.status}</Badge>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>
                      {t('exam.results.tableScore')}:{' '}
                    </span>
                    <span className='font-semibold'>
                      {detailData.score != null &&
                      detailData.totalPoints != null
                        ? `${detailData.score}/${detailData.totalPoints}`
                        : '—'}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-muted-foreground'>
                      {t('exam.results.tableStarted')}:{' '}
                    </span>
                    {formatAttemptDateTime(detailData.startedAt)}
                  </div>
                  <div className='col-span-2'>
                    <span className='text-muted-foreground'>
                      {t('exam.results.tableSubmitted')}:{' '}
                    </span>
                    {formatAttemptDateTime(detailData.submittedAt)}
                  </div>
                </div>
                {detailData.answers && detailData.answers.length > 0 && (
                  <div className='space-y-3 border-t border-border pt-3'>
                    <p className='font-medium text-xs uppercase tracking-wide text-muted-foreground'>
                      {t('exam.results.attemptDetailAnswers')}
                    </p>
                    <ul className='space-y-3'>
                      {detailData.answers.map((ans, idx) => (
                        <li
                          key={`${ans.questionId}-${idx}`}
                          className='rounded-lg border border-border p-3 space-y-1'
                        >
                          <div className='flex items-start justify-between gap-2'>
                            <p className='font-medium text-sm flex-1'>
                              Q{idx + 1}:{' '}
                              {ans.questionContent ?? `ID ${ans.questionId}`}
                            </p>
                            {ans.isCorrect ? (
                              <CheckCircle className='w-4 h-4 text-green-600 shrink-0' />
                            ) : (
                              <XCircle className='w-4 h-4 text-red-600 shrink-0' />
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {t('exam.results.tableScore')}: {ans.earnedPoints}
                            {ans.feedback ? (
                              <span className='block mt-1 text-foreground'>
                                {ans.feedback}
                              </span>
                            ) : null}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Explanation Dialog */}
      <Dialog
        open={aiDialog.open}
        onOpenChange={(open) => setAiDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='w-5 h-5 text-purple-500' />
              {t('exam.results.aiExplanation')}
            </DialogTitle>
          </DialogHeader>
          <div className='mt-2'>
            {aiDialog.loading ? (
              <div className='flex flex-col items-center gap-3 py-8 text-muted-foreground'>
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                <p className='text-sm'>
                  {t('exam.results.generatingExplanation')}
                </p>
              </div>
            ) : (
              <p className='text-sm whitespace-pre-wrap leading-relaxed'>
                {aiDialog.explanation}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Retry Wrong Answers Dialog */}
      <Dialog open={retryOpen} onOpenChange={setRetryOpen}>
        <DialogContent className='max-w-2xl max-h-[85vh] flex flex-col'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <RotateCcw className='w-5 h-5 text-orange-500' />
              Luyện lại câu sai
            </DialogTitle>
          </DialogHeader>

          <div className='mt-2 min-h-0 flex-1 overflow-y-auto space-y-3'>
            {statsLoading && (
              <div className='flex items-center justify-center gap-2 py-8 text-muted-foreground'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span className='text-sm'>Đang tải thống kê...</span>
              </div>
            )}

            {!statsLoading &&
              (!questionStatsData?.data ||
                questionStatsData.data.length === 0) && (
                <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground text-center'>
                  <AlertCircle className='w-8 h-8' />
                  <p className='text-sm'>Chưa có dữ liệu thống kê câu sai.</p>
                  <p className='text-xs'>
                    Câu essay đang chờ chấm sẽ không hiển thị ở đây.
                  </p>
                </div>
              )}

            {!statsLoading &&
              questionStatsData?.data &&
              questionStatsData.data.length > 0 && (
                <>
                  <p className='text-sm text-muted-foreground'>
                    Chọn các câu bạn muốn ôn lại. AI sẽ tạo bài kiểm tra mới với
                    câu hỏi biến thể trên cùng chủ đề.
                  </p>

                  {/* Select all */}
                  <div className='flex items-center gap-2 pb-1 border-b border-border'>
                    <input
                      type='checkbox'
                      id='select-all-retry'
                      className='cursor-pointer'
                      checked={
                        selectedRetryIds.size === questionStatsData.data.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRetryIds(
                            new Set(
                              questionStatsData.data.map((q) => q.questionId),
                            ),
                          );
                        } else {
                          setSelectedRetryIds(new Set());
                        }
                      }}
                    />
                    <label
                      htmlFor='select-all-retry'
                      className='text-sm font-medium cursor-pointer'
                    >
                      Chọn tất cả ({questionStatsData.data.length} câu)
                    </label>
                  </div>

                  <ul className='space-y-2'>
                    {questionStatsData.data.map((stat) => {
                      const pct = Math.round(stat.incorrectRate * 100);
                      const checked = selectedRetryIds.has(stat.questionId);
                      return (
                        <li
                          key={stat.questionId}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            checked
                              ? 'border-orange-400/60 bg-orange-50/40 dark:bg-orange-950/20'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                          onClick={() => {
                            setSelectedRetryIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(stat.questionId)) {
                                next.delete(stat.questionId);
                              } else {
                                next.add(stat.questionId);
                              }
                              return next;
                            });
                          }}
                        >
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={() => {}}
                            className='mt-0.5 cursor-pointer shrink-0'
                          />
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium line-clamp-2'>
                              {stat.questionText}
                            </p>
                            <div className='flex items-center gap-3 mt-1.5'>
                              {/* Incorrect rate bar */}
                              <div className='flex items-center gap-1.5 flex-1'>
                                <div className='h-1.5 flex-1 rounded-full bg-muted overflow-hidden'>
                                  <div
                                    className='h-full rounded-full bg-red-500 transition-all'
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-xs font-semibold ${
                                    pct >= 60
                                      ? 'text-red-500'
                                      : pct >= 30
                                        ? 'text-orange-500'
                                        : 'text-muted-foreground'
                                  }`}
                                >
                                  {pct}% sai
                                </span>
                              </div>
                              <span className='text-xs text-muted-foreground shrink-0'>
                                {stat.incorrectCount}/{stat.totalAttempts} lần
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between pt-3 border-t border-border mt-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedRetryIds.size} câu được chọn
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setRetryOpen(false)}
              >
                Hủy
              </Button>
              <Button
                size='sm'
                disabled={
                  selectedRetryIds.size === 0 ||
                  generateReviewExam.isPending ||
                  retryDone
                }
                className='gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 cursor-pointer disabled:opacity-60'
                onClick={async () => {
                  try {
                    await generateReviewExam.mutateAsync({
                      setId,
                      examId,
                      body: { questionIds: Array.from(selectedRetryIds) },
                    });
                    setRetryDone(true);
                    toast.success(
                      'Đã tạo Exam ôn tập! Kiểm tra trong tab Review của Set.',
                    );
                    setTimeout(() => {
                      setRetryOpen(false);
                      navigate(`/sets/${setId}/review`);
                    }, 1500);
                  } catch {
                    toast.error('Tạo Exam thất bại. Vui lòng thử lại.');
                  }
                }}
              >
                {generateReviewExam.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : retryDone ? (
                  <CheckCircle className='w-4 h-4' />
                ) : (
                  <RotateCcw className='w-4 h-4' />
                )}
                {retryDone ? 'Đã tạo!' : 'Tạo bài ôn tập'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
