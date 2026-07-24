import { Trash2, Plus, Copy, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Answer, ExamQuestion, QuestionType } from '../../types';
import type { QuestionErrors } from './index';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface QuestionItemProps {
  question: ExamQuestion;
  index: number;
  errors?: QuestionErrors;
  onClearError: (field: keyof QuestionErrors, answerId?: string) => void;
  onUpdate: (id: string | number, updates: Partial<ExamQuestion>) => void;
  onDelete: (id: string | number) => void;
  onDuplicate: (id: string | number) => void;
}

export default function QuestionItem({
  question,
  index,
  errors,
  onClearError,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionItemProps) {
  const { t } = useTranslation();

  const handleTypeChange = (type: QuestionType) => {
    let newAnswers: Answer[] = [];
    if (type === 'MULTIPLE_CHOICE') {
      newAnswers = [
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
        { id: crypto.randomUUID(), text: '', isCorrect: false },
      ];
    } else if (type === 'TRUE_FALSE') {
      newAnswers = [
        { id: 'true', text: 'True', isCorrect: false },
        { id: 'false', text: 'False', isCorrect: false },
      ];
    }
    onUpdate(question.id, { type, answers: newAnswers });
  };

  const handleAddAnswer = () => {
    if (question.type === 'MULTIPLE_CHOICE' && question.answers.length < 6) {
      onUpdate(question.id, {
        answers: [
          ...question.answers,
          { id: crypto.randomUUID(), text: '', isCorrect: false },
        ],
      });
    }
  };

  const handleAnswerChange = (answerId: string, text: string) => {
    const updated = question.answers.map((a) =>
      a.id === answerId ? { ...a, text } : a,
    );
    onUpdate(question.id, { answers: updated });
    if (text.trim()) onClearError('emptyAnswers', answerId);
  };

  const handleCorrectAnswerChange = (answerId: string) => {
    const updated = question.answers.map((a) =>
      a.id === answerId
        ? { ...a, isCorrect: !a.isCorrect }
        : question.type === 'TRUE_FALSE'
          ? { ...a, isCorrect: false }
          : a,
    );
    onUpdate(question.id, { answers: updated });
    onClearError('noCorrectAnswer');
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (question.answers.length > 2) {
      onUpdate(question.id, {
        answers: question.answers.filter((a) => a.id !== answerId),
      });
    }
  };

  return (
    <div className='rounded-2xl border border-[var(--pl-border)] bg-[var(--pl-bg)] overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between gap-3 p-4 bg-[var(--pl-bg-elev)] border-b border-[var(--pl-border)]'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='inline-flex items-center justify-center px-2 py-1 rounded-lg bg-[var(--pl-accent-soft-2)] text-[var(--pl-accent-strong)] font-[family-name:var(--font-mono-pl)] text-xs font-semibold flex-shrink-0'>
            {String(index + 1).padStart(2, '0')}
          </span>
          <Select
            value={question.type}
            onValueChange={(v) => handleTypeChange(v as QuestionType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='MULTIPLE_CHOICE'>
                {t('exam.common.multipleChoice')}
              </SelectItem>
              <SelectItem value='TRUE_FALSE'>
                {t('exam.common.trueFalse')}
              </SelectItem>
              <SelectItem value='ESSAY'>{t('exam.common.essay')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2 flex-shrink-0'>
          <div className='flex items-center gap-1.5 bg-[var(--pl-bg)] border border-[var(--pl-border)] rounded-lg px-2'>
            <Input
              type='number'
              min='0'
              value={question.score}
              onChange={(e) =>
                onUpdate(question.id, { score: Number(e.target.value) })
              }
              className='my-1 h-6 w-14 text-center text-xs border-0 bg-transparent shadow-none px-0 py-0 focus-visible:ring-0'
            />
            <span className='text-xs text-[var(--pl-text-muted)]'>pts</span>
          </div>

          <div className='w-px h-5 bg-[var(--pl-border)]' />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onDuplicate(question.id)}
                variant={'ghost'}
                size='xs'
                className='w-7'
              >
                <Copy className='w-3 h-3' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('exam.editor.duplicateQuestion')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => onDelete(question.id)}
                size='xs'
                variant={'ghost'}
                className='w-7 hover:text-destructive hover:bg-[var(--pl-danger)]/10'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('exam.editor.deleteQuestion')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className='p-6 space-y-5'>
        {/* Question text */}
        <div>
          <Textarea
            value={question.questionText}
            onChange={(e) =>
              onUpdate(question.id, { questionText: e.target.value })
            }
            placeholder={t('exam.editor.questionPlaceholder')}
            className={`w-full min-h-[56px] resize-none border-0 bg-[var(--pl-bg-elev)]! py-2 px-3 shadow-none font-[family-name:var(--font-display)] text-lg leading-snug focus-visible:ring-0 ${
              errors?.questionText ? 'text-[var(--pl-danger)]' : ''
            }`}
          />
          {errors?.questionText && (
            <p className='text-[var(--pl-danger-text)] text-xs mt-1'>
              {t('exam.editor.questionRequired')}
            </p>
          )}
        </div>

        {/* Answers */}
        {question.type === 'MULTIPLE_CHOICE' && (
          <div className='space-y-2.5'>
            <p className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)] uppercase'>
              {t('exam.editor.optionsInstructionMcq')}
            </p>
            {errors?.noCorrectAnswer && (
              <p className='text-[var(--pl-danger-text)] text-xs'>
                {t('exam.editor.selectCorrect')}
              </p>
            )}
            {question.answers.map((answer, idx) => {
              const answerError = errors?.emptyAnswers?.has(answer.id);
              return (
                <div
                  key={answer.id}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    answer.isCorrect
                      ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft-2)]'
                      : answerError
                        ? 'border-[var(--pl-danger-border)] bg-[var(--pl-bg-elev)]'
                        : 'border-[var(--pl-border)] bg-[var(--pl-bg-elev)]'
                  }`}
                >
                  <button
                    onClick={() => handleCorrectAnswerChange(answer.id)}
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      answer.isCorrect
                        ? 'bg-[var(--pl-accent)] border-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
                        : 'border-[var(--pl-border-strong)]'
                    }`}
                  >
                    {answer.isCorrect && (
                      <svg
                        viewBox='0 0 24 24'
                        className='w-3 h-3'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='3'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='M20 6 9 17l-5-5' />
                      </svg>
                    )}
                  </button>
                  <span className='font-[family-name:var(--font-mono-pl)] text-xs text-[var(--pl-text-faint)] flex-shrink-0'>
                    {OPTION_LABELS[idx]}
                  </span>
                  <div className='flex-1 min-w-0'>
                    <Input
                      value={answer.text}
                      onChange={(e) =>
                        handleAnswerChange(answer.id, e.target.value)
                      }
                      placeholder={t('exam.editor.answerN', { n: idx + 1 })}
                      className='h-auto text-sm border-0 bg-transparent px-2 shadow-none focus-visible:ring-0'
                    />
                    {answerError && (
                      <p className='text-[var(--pl-danger-text)] text-xs mt-0.5'>
                        {t('exam.editor.answerRequired')}
                      </p>
                    )}
                  </div>
                  {question.answers.length > 2 && (
                    <button
                      onClick={() => handleDeleteAnswer(answer.id)}
                      className='w-6 h-6 rounded flex items-center justify-center text-[var(--pl-text-faint)] hover:text-[var(--pl-danger)] hover:bg-[var(--pl-danger-soft)] transition-colors flex-shrink-0 cursor-pointer opacity-0 group-hover:opacity-100'
                    >
                      <X className='w-3.5 h-3.5' />
                    </button>
                  )}
                </div>
              );
            })}

            {question.answers.length < 6 && (
              <button
                onClick={handleAddAnswer}
                className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-[var(--pl-border)] text-xs text-[var(--pl-text-muted)] hover:border-[var(--pl-accent)]/50 hover:text-[var(--pl-accent)] transition-colors cursor-pointer'
              >
                <Plus className='w-3.5 h-3.5' />
                {t('exam.editor.addAnswer')}
              </button>
            )}
          </div>
        )}

        {question.type === 'TRUE_FALSE' && (
          <div className='space-y-2.5'>
            <p className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)] uppercase'>
              {t('exam.editor.correctAnswerLabel')}
            </p>
            {errors?.noCorrectAnswer && (
              <p className='text-[var(--pl-danger-text)] text-xs'>
                {t('exam.editor.selectCorrect')}
              </p>
            )}
            {question.answers.map((answer) => (
              <button
                key={answer.id}
                onClick={() => handleCorrectAnswerChange(answer.id)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                  answer.isCorrect
                    ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft-2)]'
                    : 'border-[var(--pl-border)] bg-[var(--pl-bg-elev)] hover:border-[var(--pl-border-strong)]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    answer.isCorrect
                      ? 'bg-[var(--pl-accent)] border-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
                      : 'border-[var(--pl-border-strong)]'
                  }`}
                >
                  {answer.isCorrect && (
                    <svg
                      viewBox='0 0 24 24'
                      className='w-3 h-3'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M20 6 9 17l-5-5' />
                    </svg>
                  )}
                </span>
                <span className='text-sm font-medium'>{answer.text}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === 'ESSAY' && (
          <div className='rounded-xl px-4 py-3 text-xs text-[var(--pl-text-muted)] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
            {t('exam.editor.essayGradingNote')}
          </div>
        )}
      </div>
    </div>
  );
}
