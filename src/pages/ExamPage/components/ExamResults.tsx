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
  BookOpen,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
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
import type { Exam, ExamResult } from '../types';
import ModeToggle from '@/components/theme/mode-toggle';

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
  const navigate = useNavigate();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openQuestions, setOpenQuestions] = useState<
    Record<string | number, boolean>
  >(() => {
    // Auto-collapse correct answers, expand wrong/essay ones
    const initial: Record<string | number, boolean> = {};
    exam.questions.forEach((q) => {
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
        initial[q.id] = !isCorrect; // expand wrong, collapse correct
      }
    });
    return initial;
  });
  const [reviewed, setReviewed] = useState<Record<string | number, boolean>>(
    {},
  );
  const [aiDialog, setAiDialog] = useState<{
    open: boolean;
    questionId: string | number | null;
    loading: boolean;
    explanation: string;
  }>({ open: false, questionId: null, loading: false, explanation: '' });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSubmissionForQuestion = (questionId: string | number) =>
    result.submissions.find((s) => s.questionId === questionId);

  const isAnswerCorrect = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const submission = getSubmissionForQuestion(questionId);
    if (!question || !submission) return false;
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
    const correct = isAnswerCorrect(questionId);
    if (!question) return 0;
    if (correct === null) return 0;
    return correct ? question.score : 0;
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

  const toggleReviewed = (questionId: string | number) => {
    setReviewed((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleExplainWithAI = async (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return;
    const submission = getSubmissionForQuestion(questionId);

    setAiDialog({ open: true, questionId, loading: true, explanation: '' });

    try {
      const correctAnswers = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.text);
      const selectedAnswers = question.answers
        .filter((a) => submission?.selectedAnswers.includes(a.id))
        .map((a) => a.text);

      const prompt =
        question.type === 'ESSAY'
          ? `Explain the ideal answer for this essay question: "${question.questionText}". The student wrote: "${submission?.essayAnswer ?? '(no answer)'}". Give constructive feedback and a model answer.`
          : `Explain why the correct answer(s) are: ${correctAnswers.join(', ')} for the question: "${question.questionText}". ${selectedAnswers.length ? `The student selected: ${selectedAnswers.join(', ')}.` : ''} Be concise and educational.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const text =
        data.content
          ?.map((c: { type: string; text?: string }) => c.text ?? '')
          .join('') ?? 'No explanation available.';
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
        explanation: 'Failed to load explanation. Please try again.',
      });
    }
  };

  const reviewedCount = Object.values(reviewed).filter(Boolean).length;
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
                  View Exam
                </Button>
                <ModeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className='flex min-h-0 min-w-0 flex-1'>
          <aside className='flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-background'>
            <div className='shrink-0 border-b border-border p-4'>
              <h2 className='font-semibold text-sm mb-1'>Question Navigator</h2>
              <p className='text-xs text-muted-foreground'>
                {reviewedCount}/{exam.questions.length} reviewed
              </p>
              {/* Mini progress bar */}
              <div className='mt-2 h-1.5 rounded-full bg-muted overflow-hidden'>
                <div
                  className='h-full bg-yellow-400 transition-all duration-500'
                  style={{
                    width: `${(reviewedCount / exam.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className='flex-1 min-h-0 overflow-y-auto p-3 space-y-1'>
              {exam.questions.map((question, index) => {
                const correct = isAnswerCorrect(question.id);
                const isReviewed = reviewed[question.id];

                let tooltipText = '';
                let bgColor = '';
                let textColor = '';
                let icon = null;

                if (isReviewed) {
                  tooltipText = 'Reviewed';
                  bgColor =
                    'bg-yellow-400/20 border-yellow-400/60 hover:bg-yellow-400/30';
                  textColor = 'text-yellow-700 dark:text-yellow-300';
                  icon = <Eye className='w-3 h-3' />;
                } else if (correct === true) {
                  tooltipText = 'Correct';
                  bgColor =
                    'bg-green-500/10 border-green-500/40 hover:bg-green-500/20';
                  textColor = 'text-green-700 dark:text-green-400';
                  icon = <CheckCircle className='w-3 h-3' />;
                } else if (correct === false) {
                  tooltipText = 'Incorrect';
                  bgColor =
                    'bg-red-500/10 border-red-500/40 hover:bg-red-500/20';
                  textColor = 'text-red-700 dark:text-red-400';
                  icon = <XCircle className='w-3 h-3' />;
                } else {
                  tooltipText = 'Essay – pending grading';
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
                        {isReviewed && (
                          <Badge
                            variant='outline'
                            className='ml-auto text-[10px] px-1 py-0 border-yellow-400 text-yellow-600'
                          >
                            ✓
                          </Badge>
                        )}
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
                    {result.passed ? 'Congratulations!' : 'Exam Completed'}
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    {result.passed
                      ? 'You passed the exam!'
                      : 'Keep practicing to improve your score'}
                  </p>
                </div>
                <div className='grid grid-cols-4 gap-3'>
                  {[
                    {
                      value: `${result.percentage.toFixed(1)}%`,
                      label: 'Percentage',
                      colored: true,
                    },
                    {
                      value: `${result.earnedScore}/${result.totalScore}`,
                      label: 'Score',
                    },
                    {
                      value: `${correctCount}/${totalNonEssay}`,
                      label: 'Correct',
                    },
                    {
                      value: formatTime(result.timeTaken),
                      label: 'Time Taken',
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
              <div className='bg-card border border-border rounded-lg p-5'>
                <div className='flex items-center gap-2 mb-5'>
                  <BarChart3 className='w-5 h-5' />
                  <h3 className='text-lg font-semibold'>Question Review</h3>
                  <Badge variant='outline' className='ml-auto text-xs'>
                    {correctCount}/{exam.questions.length} correct
                  </Badge>
                </div>

                <div className='space-y-3'>
                  {exam.questions.map((question, index) => {
                    const submission = getSubmissionForQuestion(question.id);
                    const correct = isAnswerCorrect(question.id);
                    const score = getQuestionScore(question.id);
                    const isReviewed = reviewed[question.id];
                    const isOpen = openQuestions[question.id] ?? true;

                    const borderColor = isReviewed
                      ? 'border-yellow-400 bg-yellow-50/40 dark:bg-yellow-950/20'
                      : correct === true
                        ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800'
                        : correct === false
                          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800'
                          : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-700';

                    const iconBg = isReviewed
                      ? 'bg-yellow-400 text-white'
                      : correct === true
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
                              {isReviewed ? (
                                <Eye className='w-4 h-4' />
                              ) : correct === true ? (
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
                                    ? 'Multiple Choice'
                                    : question.type === 'TRUE_FALSE'
                                      ? 'True / False'
                                      : 'Essay'}
                                </Badge>
                                {isReviewed && (
                                  <Badge className='text-xs bg-yellow-400 text-yellow-950 hover:bg-yellow-400'>
                                    Reviewed
                                  </Badge>
                                )}
                                {correct === null && !isReviewed && (
                                  <Badge
                                    variant='outline'
                                    className='text-xs text-yellow-600 border-yellow-500'
                                  >
                                    Pending Grading
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-muted-foreground truncate mt-0.5 pr-4'>
                                {question.questionText}
                              </p>
                            </div>

                            <div className='flex items-center gap-2 flex-shrink-0'>
                              <span className='text-sm font-semibold whitespace-nowrap'>
                                {score}/{question.score} pts
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
                                    const isSelected =
                                      submission?.selectedAnswers.includes(
                                        answer.id,
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
                                              Correct
                                            </span>
                                          )}
                                          {!isCorrectAnswer && isSelected && (
                                            <span className='ml-auto text-xs bg-red-600 text-white px-2 py-0.5 rounded'>
                                              Your Answer
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
                                submission?.essayAnswer && (
                                  <div className='bg-background border border-border rounded-lg p-4'>
                                    <p className='text-xs font-medium text-muted-foreground mb-2'>
                                      Your Answer:
                                    </p>
                                    <p className='text-sm whitespace-pre-wrap'>
                                      {submission.essayAnswer}
                                    </p>
                                  </div>
                                )}

                              {/* Action buttons */}
                              <div className='flex items-center gap-2 pt-1'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='gap-1.5 text-xs h-8'
                                  onClick={() =>
                                    handleExplainWithAI(question.id)
                                  }
                                >
                                  <Sparkles className='w-3.5 h-3.5 text-purple-500' />
                                  Explain with AI
                                </Button>
                                <Button
                                  variant={isReviewed ? 'default' : 'outline'}
                                  size='sm'
                                  className={`gap-1.5 text-xs h-8 ${
                                    isReviewed
                                      ? 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950 border-yellow-400'
                                      : ''
                                  }`}
                                  onClick={() => toggleReviewed(question.id)}
                                >
                                  <BookOpen className='w-3.5 h-3.5' />
                                  {isReviewed
                                    ? 'Reviewed ✓'
                                    : 'Mark as Reviewed'}
                                </Button>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className='flex justify-center gap-4 pb-8'>
                <Button
                  variant='outline'
                  onClick={() => navigate(`/sets/${setId}`)}
                >
                  Back to Set
                </Button>
                <Button
                  onClick={() => navigate(`/sets/${setId}/exams/${examId}`)}
                >
                  Review Exam
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI Explanation Dialog */}
      <Dialog
        open={aiDialog.open}
        onOpenChange={(open) => setAiDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='w-5 h-5 text-purple-500' />
              AI Explanation
            </DialogTitle>
          </DialogHeader>
          <div className='mt-2'>
            {aiDialog.loading ? (
              <div className='flex flex-col items-center gap-3 py-8 text-muted-foreground'>
                <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
                <p className='text-sm'>Generating explanation…</p>
              </div>
            ) : (
              <p className='text-sm whitespace-pre-wrap leading-relaxed'>
                {aiDialog.explanation}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
