import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import KnowledgeAnalysisDialog from '@/components/analysis/KnowledgeAnalysisDialog';
import AnalysisHistoryDialog from '@/components/analysis/AnalysisHistoryDialog';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { examAPI } from '@/services/endpoints/exam';

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

import type { Exam, ExamResult } from '../../types';
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

  const helpers = useMemo(
    () => createResultHelpers(exam, result),
    [exam, result],
  );

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(() => {
    const firstWrong = exam.questions.findIndex((q) => {
      const graded = result.gradedByBackend?.find(
        (g) => String(g.questionId) === String(q.id),
      );
      if (graded) return !graded.isCorrect;
      const correctIds = q.answers.filter((a) => a.isCorrect).map((a) => a.id);
      const sub = result.submissions.find((s) => s.questionId === q.id);
      const selected = sub?.selectedAnswers ?? [];
      return !(
        correctIds.length === selected.length &&
        correctIds.every((id) => selected.includes(id))
      );
    });
    return firstWrong >= 0 ? firstWrong : 0;
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
  const [analysisHistoryOpen, setAnalysisHistoryOpen] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);

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
        language: i18n.language?.startsWith('en') ? 'English' : 'Vietnamese',
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

  const selectedQuestion =
    exam.questions[selectedQuestionIndex] ?? exam.questions[0];

  return (
    <TooltipProvider>
      <div style={{ background: 'var(--pl-bg)', minHeight: '100dvh' }}>
        <ResultsHeader setId={setId} examId={examId} />

        <div className='max-w-4xl mx-auto px-6 py-10 space-y-5'>
          <ResultsSummaryCard
            result={result}
            correctCount={correctCount}
            totalNonEssay={totalNonEssay}
          />

          {/* Question review */}
          <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
            {/* Header */}
            <div className='flex items-center justify-between mb-5'>
              <div>
                <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-0.5'>
                  QUESTION REVIEW
                </p>
                <p className='font-medium flex items-center gap-2'>
                  {exam.questions.length} questions
                  <Badge variant='outline' className='text-xs font-normal'>
                    {t('exam.results.correctBadge', {
                      correct: correctCount,
                      total: exam.questions.length,
                    })}
                  </Badge>
                </p>
              </div>
              <BarChart3 className='w-5 h-5 text-muted-foreground' />
            </div>

            {/* Split: sidebar + question detail */}
            <div className='flex gap-4 items-start'>
              {/* Sticky sidebar navigator */}
              <div className='w-44 flex-shrink-0 sticky top-[57px]'>
                <QuestionNavigator
                  exam={exam}
                  helpers={helpers}
                  selectedIndex={selectedQuestionIndex}
                  onSelect={setSelectedQuestionIndex}
                />
              </div>

              {/* Selected question detail */}
              <div className='flex-1 min-w-0'>
                <QuestionReviewItem
                  key={selectedQuestion.id}
                  question={selectedQuestion}
                  index={selectedQuestionIndex}
                  helpers={helpers}
                  isOpen={true}
                  forceOpen={true}
                  onOpenChange={() => {}}
                  onExplainAi={handleExplainWithAI}
                />
              </div>
            </div>
          </div>

          <ResultsActions
            setId={setId}
            attemptId={attemptId}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenAnalysis={() => setAnalysisOpen(true)}
            onOpenAnalysisHistory={() => setAnalysisHistoryOpen(true)}
            onOpenRetry={() => setRetryOpen(true)}
          />
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
        onOpenChange={(open) => setAiDialog((prev) => ({ ...prev, open }))}
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

      {analysisHistoryOpen && (
        <AnalysisHistoryDialog
          open={analysisHistoryOpen}
          onOpenChange={setAnalysisHistoryOpen}
          target={{ kind: 'exam', setId, examId }}
        />
      )}
    </TooltipProvider>
  );
}
