import {
  GripVertical,
  Trash2,
  Plus,
  CheckSquare,
  ToggleLeft,
  AlignLeft,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Answer, ExamQuestion, QuestionType } from '../types';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuestionErrors } from './index';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface QuestionItemProps {
  question: ExamQuestion;
  index: number;
  errors?: QuestionErrors;
  onClearError: (field: keyof QuestionErrors, answerId?: string) => void;
  onUpdate: (id: string | number, updates: Partial<ExamQuestion>) => void;
  onDelete: (id: string | number) => void;
  onDragStart: (id: string | number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, id: string | number) => void;
  onDrop: (e: React.DragEvent, id: string | number) => void;
}

const typeIcon = (type: QuestionType) => {
  if (type === 'MULTIPLE_CHOICE')
    return <CheckSquare className='w-3.5 h-3.5' />;
  if (type === 'TRUE_FALSE') return <ToggleLeft className='w-3.5 h-3.5' />;
  return <AlignLeft className='w-3.5 h-3.5' />;
};

export default function QuestionItem({
  question,
  index,
  errors,
  onClearError,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
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

  const hasError = !!errors && Object.keys(errors).length > 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(question.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, question.id)}
      onDrop={(e) => onDrop(e, question.id)}
      className={`bg-[var(--pl-bg-elev)] border rounded-xl p-5 mb-3 transition-all ${
        hasError
          ? 'border-destructive/60 shadow-sm shadow-destructive/10'
          : 'border-border hover:shadow-sm'
      }`}
    >
      <div className='flex items-start gap-3'>
        {/* Drag handle */}
        <div
          className='cursor-grab active:cursor-grabbing pt-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors flex-shrink-0'
          title='Drag to reorder'
        >
          <GripVertical className='w-4 h-4' />
        </div>

        <div className='flex-1 space-y-4'>
          {/* Question header row */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground uppercase tracking-widest'>
                Q{String(index + 1).padStart(2, '0')}
              </span>
              <div className='flex items-center gap-1.5 text-foreground text-xs'>
                {typeIcon(question.type)}
                <span>
                  {question.type === 'MULTIPLE_CHOICE'
                    ? t('exam.common.multipleChoice')
                    : question.type === 'TRUE_FALSE'
                      ? t('exam.common.trueFalse')
                      : t('exam.common.essay')}
                </span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {/* Type selector */}
              <Select
                value={question.type}
                onValueChange={(v) => handleTypeChange(v as QuestionType)}
              >
                <SelectTrigger className='h-8 text-xs w-36'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MULTIPLE_CHOICE'>
                    {t('exam.common.multipleChoice')}
                  </SelectItem>
                  <SelectItem value='TRUE_FALSE'>
                    {t('exam.common.trueFalse')}
                  </SelectItem>
                  <SelectItem value='ESSAY'>
                    {t('exam.common.essay')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Points */}
              <div className='flex items-center gap-1.5'>
                <Input
                  type='number'
                  min='0'
                  value={question.score}
                  onChange={(e) =>
                    onUpdate(question.id, { score: Number(e.target.value) })
                  }
                  className='h-8 w-16 text-center text-xs bg-[var(--pl-bg-elev)] border-border'
                />
                <span className='text-xs text-muted-foreground'>pts</span>
              </div>

              {/* Delete */}
              <button
                onClick={() => onDelete(question.id)}
                className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
                title='Delete question'
              >
                <Trash2 className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          {/* Question text */}
          <div>
            <Textarea
              value={question.questionText}
              onChange={(e) =>
                onUpdate(question.id, { questionText: e.target.value })
              }
              placeholder={t('exam.editor.questionPlaceholder')}
              className={`w-full min-h-[80px] resize-none text-sm ${
                errors?.questionText
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'border-border'
              }`}
            />
            {errors?.questionText && (
              <p className='text-destructive text-xs mt-1'>
                {t('exam.editor.questionRequired') ||
                  'Question text is required'}
              </p>
            )}
          </div>

          {/* Answers */}
          {question.type !== 'ESSAY' && (
            <div className='space-y-2'>
              {errors?.noCorrectAnswer && (
                <p className='text-destructive text-xs'>
                  {t('exam.editor.selectCorrect')}
                </p>
              )}
              {question.answers.map((answer, idx) => {
                const answerError = errors?.emptyAnswers?.has(answer.id);
                return (
                  <div
                    key={answer.id}
                    className={`flex items-center gap-2.5 bg-[var(--pl-bg)] rounded-lg border px-3 py-2.5 transition-colors ${
                      answer.isCorrect
                        ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]!'
                        : answerError
                          ? 'border-destructive/60'
                          : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={answer.isCorrect}
                      onCheckedChange={() =>
                        handleCorrectAnswerChange(answer.id)
                      }
                      className='flex-shrink-0'
                    />
                    <div className='flex items-center justify-center w-5 h-5 rounded bg-border/50 flex-shrink-0'>
                      <span className='font-[family-name:var(--font-mono-pl)] text-[10px] font-medium text-muted-foreground'>
                        {OPTION_LABELS[idx]}
                      </span>
                    </div>
                    {question.type === 'TRUE_FALSE' ? (
                      <span className='flex-1 text-sm font-medium'>
                        {answer.text}
                      </span>
                    ) : (
                      <>
                        <div className='flex-1'>
                          <Input
                            value={answer.text}
                            onChange={(e) =>
                              handleAnswerChange(answer.id, e.target.value)
                            }
                            placeholder={t('exam.editor.answerN', {
                              n: idx + 1,
                            })}
                            className={`h-8 text-sm bg-transparent border-0 px-3 focus-visible:ring-0 ${
                              answerError
                                ? 'placeholder:text-destructive/60'
                                : ''
                            }`}
                          />
                          {answerError && (
                            <p className='text-destructive text-xs mt-0.5'>
                              {t('exam.editor.answerRequired')}
                            </p>
                          )}
                        </div>
                        {question.answers.length > 2 && (
                          <button
                            onClick={() => handleDeleteAnswer(answer.id)}
                            className='w-6 h-6 rounded flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0 cursor-pointer'
                          >
                            <Trash2 className='w-3 h-3' />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}

              {question.type === 'MULTIPLE_CHOICE' &&
                question.answers.length < 6 && (
                  <button
                    onClick={handleAddAnswer}
                    className='w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-[var(--pl-bg)] transition-colors cursor-pointer'
                  >
                    <Plus className='w-3.5 h-3.5' />
                    {t('exam.editor.addAnswer')}
                  </button>
                )}
            </div>
          )}

          {question.type === 'ESSAY' && (
            <div className='bg-[var(--pl-bg)] rounded-lg px-4 py-3 text-xs text-muted-foreground border border-border/50'>
              {t('exam.editor.essayGradingNote')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
