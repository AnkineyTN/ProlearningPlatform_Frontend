import { forwardRef } from 'react';
import {
  CheckCircle,
  CheckCircle2,
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
  forceOpen?: boolean;
  onOpenChange: (open: boolean) => void;
  onExplainAi: (questionId: string | number) => void;
}

const CARD_CLASS = {
  correct: 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft-2)]',
  wrong:   'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)]',
  pending: 'border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)]',
} as const;

const ICON_CLASS = {
  correct: 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]',
  wrong:   'bg-[var(--pl-danger)] text-white',
  pending: 'bg-[var(--pl-warning)] text-white',
} as const;

const QuestionReviewItem = forwardRef<HTMLDivElement, QuestionReviewItemProps>(
  function QuestionReviewItem(
    { question, index, helpers, isOpen, forceOpen, onOpenChange, onExplainAi },
    ref,
  ) {
    const { t } = useTranslation();
    const submission = helpers.getSubmissionForQuestion(question.id);
    const graded = helpers.getGradedForQuestion(question.id);
    const correct = helpers.isAnswerCorrect(question.id);
    const score = helpers.getQuestionScore(question.id);

    const status = correct === true ? 'correct' : correct === false ? 'wrong' : 'pending';

    return (
      <div
        ref={ref}
        className={`rounded-2xl border transition-all duration-200 ${CARD_CLASS[status]}`}
      >
        <Collapsible open={forceOpen ? true : isOpen} onOpenChange={onOpenChange}>
          <div className='flex items-center gap-3 p-4'>
            <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${ICON_CLASS[status]}`}>
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
                    className='text-xs text-[var(--pl-warning)] border-[var(--pl-warning-border)]'
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
              <span className={`text-sm font-bold whitespace-nowrap ${correct === true ? 'text-[var(--pl-accent-strong)]' : ''}`}>
                {score}/{question.score}{' '}
                <span className='font-normal text-muted-foreground text-xs'>
                  {t('exam.common.points')}
                </span>
              </span>
              {!forceOpen && (
                <CollapsibleTrigger asChild>
                  <Button variant='ghost' size='icon' className='h-7 w-7'>
                    {isOpen ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className='px-4 pb-4 space-y-3'>
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

                    const optionClass = isCorrectAnswer
                      ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)]'
                      : isSelected
                        ? 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)]'
                        : 'border-border bg-[var(--pl-bg-elev)]';

                    const textClass = isCorrectAnswer
                      ? 'font-semibold text-[var(--pl-accent-strong)]'
                      : isSelected
                        ? 'text-[var(--pl-danger-text)]'
                        : '';

                    return (
                      <div
                        key={answer.id}
                        className={`p-3 rounded-xl border text-sm transition-colors ${optionClass}`}
                      >
                        <div className='flex items-center gap-2'>
                          {isCorrectAnswer ? (
                            <CheckCircle2 className='w-4 h-4 flex-shrink-0 text-[var(--pl-accent)]' />
                          ) : isSelected ? (
                            <XCircle className='w-4 h-4 flex-shrink-0 text-[var(--pl-danger)]' />
                          ) : null}
                          <span className={textClass}>{answer.text}</span>
                          {isCorrectAnswer && (
                            <span className='ml-auto text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'>
                              {t('exam.common.correct')}
                            </span>
                          )}
                          {!isCorrectAnswer && isSelected && (
                            <span className='ml-auto text-[11px] px-2 py-0.5 rounded-full border whitespace-nowrap border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger-text)]'>
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
                  <div className='rounded-xl border border-border bg-[var(--pl-bg-hover)] p-4'>
                    <p className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.15em] text-muted-foreground mb-2'>
                      {t('exam.results.yourAnswerLabel').toUpperCase()}
                    </p>
                    <p className='text-sm whitespace-pre-wrap'>
                      {graded?.studentAnswer ?? submission?.essayAnswer}
                    </p>
                  </div>
                )}

              {graded?.expectedAnswer &&
                question.type !== 'ESSAY' &&
                !graded.isCorrect && (
                  <div className='rounded-xl border border-border bg-[var(--pl-bg-hover)] p-3 text-sm'>
                    <p className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.15em] text-muted-foreground mb-1'>
                      {t('exam.results.expectedAnswer').toUpperCase()}
                    </p>
                    <p className='whitespace-pre-wrap'>{graded.expectedAnswer}</p>
                  </div>
                )}

              {graded?.feedback?.trim() && (
                <div className='rounded-xl border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] p-3 text-sm'>
                  <p className='text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.15em] text-muted-foreground mb-1'>
                    {t('exam.results.feedback').toUpperCase()}
                  </p>
                  <p className='whitespace-pre-wrap'>{graded.feedback}</p>
                </div>
              )}

              {helpers.showExplainAi(question.id) && (
                <div className='pt-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='gap-1.5 text-xs h-8'
                    onClick={() => onExplainAi(question.id)}
                  >
                    <Sparkles className='w-3.5 h-3.5 text-[var(--pl-accent)]' />
                    {t('exam.results.explainAI')}
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
);

export default QuestionReviewItem;
