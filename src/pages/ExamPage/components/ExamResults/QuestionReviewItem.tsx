import { forwardRef } from 'react';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ExamQuestion } from '../../types';
import type { ResultHelpers } from './utils';

interface QuestionReviewItemProps {
  question: ExamQuestion;
  index: number;
  helpers: ResultHelpers;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExplainAi: (questionId: string | number) => void;
}

const QuestionReviewItem = forwardRef<HTMLDivElement, QuestionReviewItemProps>(
  function QuestionReviewItem(
    { question, index, helpers, isOpen, onOpenChange, onExplainAi },
    ref,
  ) {
    const { t } = useTranslation();
    const submission = helpers.getSubmissionForQuestion(question.id);
    const graded = helpers.getGradedForQuestion(question.id);
    const correct = helpers.isAnswerCorrect(question.id);
    const score = helpers.getQuestionScore(question.id);

    const borderColor =
      correct === true
        ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800'
        : correct === false
          ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800'
          : 'border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-700';

    const iconBg =
      correct === true
        ? 'bg-green-500 text-white'
        : correct === false
          ? 'bg-red-500 text-white'
          : 'bg-yellow-500 text-white';

    return (
      <div
        ref={ref}
        className={`border-2 rounded-lg transition-all duration-200 ${borderColor}`}
      >
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
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
                <span className='font-semibold text-sm'>Q{index + 1}</span>
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
                {score}/{question.score} {t('exam.common.points')}
              </span>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='icon' className='h-7 w-7'>
                  {isOpen ? (
                    <ChevronUp className='w-4 h-4' />
                  ) : (
                    <ChevronDown className='w-4 h-4' />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent>
            <div className='px-4 pb-4 space-y-4'>
              <p className='font-medium text-sm'>{question.questionText}</p>

              {question.type !== 'ESSAY' && (
                <div className='space-y-2'>
                  {question.answers.map((answer) => {
                    const isSelected = helpers.isOptionSelected(
                      answer.id,
                      graded,
                      submission?.selectedAnswers.includes(answer.id) ?? false,
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

              {question.type === 'ESSAY' &&
                (graded?.studentAnswer || submission?.essayAnswer) && (
                  <div className='bg-background border border-border rounded-lg p-4'>
                    <p className='text-xs font-medium text-muted-foreground mb-2'>
                      {t('exam.results.yourAnswerLabel')}
                    </p>
                    <p className='text-sm whitespace-pre-wrap'>
                      {graded?.studentAnswer ?? submission?.essayAnswer}
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
                  <p className='whitespace-pre-wrap'>{graded.feedback}</p>
                </div>
              )}

              <div className='flex items-center gap-2 pt-1'>
                {helpers.showExplainAi(question.id) && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1.5 text-xs h-8'
                    onClick={() => onExplainAi(question.id)}
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
  },
);

export default QuestionReviewItem;
