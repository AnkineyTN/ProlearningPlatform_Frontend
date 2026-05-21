import { BarChart3 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { examAPI } from '@/services/endpoints/exam';
import KnowledgeAnalysisDialog from '@/components/analysis/KnowledgeAnalysisDialog';
import type { Exam, ExamResult } from '../../types';
import AiExplanationDialog from './AiExplanationDialog';
import AttemptDetailDialog from './AttemptDetailDialog';
import AttemptHistoryDialog from './AttemptHistoryDialog';
import QuestionNavigator from './QuestionNavigator';
import QuestionReviewItem from './QuestionReviewItem';
import ResultsActions from './ResultsActions';
import ResultsHeader from './ResultsHeader';
import ResultsSummaryCard from './ResultsSummaryCard';
import RetryWrongAnswersDialog from './RetryWrongAnswersDialog';
import { createResultHelpers } from './utils';

interface ExamResultsProps {
  setId: number;
  examId: number;
  exam: Exam;
  result: ExamResult;
  attemptId?: number;
}

export default function ExamResults({
  setId,
  examId,
  exam,
  result,
  attemptId,
}: ExamResultsProps) {
  const { t, i18n } = useTranslation();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const helpers = useMemo(() => createResultHelpers(exam, result), [exam, result]);

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
  const [detailAttemptId, setDetailAttemptId] = useState<number | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);

  const scrollToQuestion = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    const qId = exam.questions[index].id;
    setOpenQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const handleExplainWithAI = async (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return;
    const submission = helpers.getSubmissionForQuestion(questionId);
    const graded = helpers.getGradedForQuestion(questionId);

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

  const totalNonEssay = exam.questions.filter((q) => q.type !== 'ESSAY').length;
  const correctCount = exam.questions.filter(
    (q) => helpers.isAnswerCorrect(q.id) === true,
  ).length;

  return (
    <TooltipProvider>
      <div className='bg-background flex h-[calc(100dvh-35px)] min-h-0 flex-col overflow-hidden'>
        <ResultsHeader setId={setId} examId={examId} />

        <div className='flex min-h-0 min-w-0 flex-1'>
          <QuestionNavigator
            exam={exam}
            helpers={helpers}
            onSelect={scrollToQuestion}
          />

          <main className='min-h-0 min-w-0 flex-1 overflow-y-auto'>
            <div className='max-w-3xl mx-auto px-6 py-8 space-y-6'>
              <ResultsSummaryCard
                result={result}
                correctCount={correctCount}
                totalNonEssay={totalNonEssay}
              />

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
                  {exam.questions.map((question, index) => (
                    <QuestionReviewItem
                      key={question.id}
                      ref={(el) => {
                        questionRefs.current[index] = el;
                      }}
                      question={question}
                      index={index}
                      helpers={helpers}
                      isOpen={openQuestions[question.id] ?? true}
                      onOpenChange={(open) =>
                        setOpenQuestions((prev) => ({
                          ...prev,
                          [question.id]: open,
                        }))
                      }
                      onExplainAi={handleExplainWithAI}
                    />
                  ))}
                </div>
              </div>

              <ResultsActions
                setId={setId}
                attemptId={attemptId}
                onOpenHistory={() => setHistoryOpen(true)}
                onOpenAnalysis={() => setAnalysisOpen(true)}
                onOpenRetry={() => setRetryOpen(true)}
              />
            </div>
          </main>
        </div>
      </div>

      <AttemptHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        setId={setId}
        examId={examId}
        onSelectAttempt={setDetailAttemptId}
      />

      <AttemptDetailDialog
        open={detailAttemptId != null}
        onOpenChange={(open) => {
          if (!open) setDetailAttemptId(null);
        }}
        setId={setId}
        examId={examId}
        attemptId={detailAttemptId}
      />

      <AiExplanationDialog
        open={aiDialog.open}
        onOpenChange={(open) =>
          setAiDialog((prev) => ({ ...prev, open }))
        }
        loading={aiDialog.loading}
        explanation={aiDialog.explanation}
      />

      <RetryWrongAnswersDialog
        open={retryOpen}
        onOpenChange={setRetryOpen}
        setId={setId}
        examId={examId}
      />

      {attemptId != null && analysisOpen && (
        <KnowledgeAnalysisDialog
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
          target={{ kind: 'exam', setId, examId, attemptId }}
        />
      )}
    </TooltipProvider>
  );
}
