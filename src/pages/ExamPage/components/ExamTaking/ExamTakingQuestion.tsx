import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import type { ExamQuestion, ExamSubmission } from '../../types';
import { OPTION_LABELS } from './utils';

interface ExamTakingQuestionProps {
  question: ExamQuestion;
  submission: ExamSubmission | undefined;
  isAnswered: boolean;
  onSelectAnswer: (
    questionId: string | number,
    answerId: string,
    isChecked: boolean,
  ) => void;
  onEssayChange: (questionId: string | number, text: string) => void;
}

export default function ExamTakingQuestion({
  question,
  submission,
  isAnswered,
  onSelectAnswer,
  onEssayChange,
}: ExamTakingQuestionProps) {
  const { t } = useTranslation();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const questionTypeLabel =
    question.type === 'MULTIPLE_CHOICE'
      ? t('exam.common.multipleChoice')
      : question.type === 'TRUE_FALSE'
        ? t('exam.common.trueFalse')
        : t('exam.common.essay');

  return (
    <div className='flex-1 overflow-auto flex items-start justify-center px-10 py-12'>
      <div style={{ maxWidth: 760, width: '100%' }}>
        <div
          className='flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] mb-3'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          <span>{questionTypeLabel}</span>
          <span>·</span>
          <span style={{ color: 'var(--pl-text-faint)' }}>
            {question.type === 'MULTIPLE_CHOICE'
              ? 'Multiple answers'
              : question.type === 'TRUE_FALSE'
                ? 'Single answer'
                : 'Written response'}
          </span>
          <span>·</span>
          <span style={{ color: 'var(--pl-accent-strong)' }}>
            +{question.score} {question.score === 1 ? 'point' : 'points'}
          </span>
        </div>

        <h2
          className='text-[28px] font-[400] leading-[1.28] mb-8'
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            color: 'var(--pl-text)',
          }}
        >
          {question.questionText}
        </h2>

        {question.type !== 'ESSAY' ? (
          <div className='flex flex-col gap-[10px]'>
            {question.answers.map((answer, idx) => {
              const sel =
                submission?.selectedAnswers.includes(answer.id) ?? false;
              const letter = OPTION_LABELS[idx] ?? String(idx + 1);
              return (
                <button
                  key={answer.id}
                  onClick={() => onSelectAnswer(question.id, answer.id, !sel)}
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
            value={submission?.essayAnswer || ''}
            onChange={(e) => onEssayChange(question.id, e.target.value)}
            placeholder={t('exam.taking.essayPlaceholder')}
            className='w-full min-h-[200px] resize-none'
            style={{
              background: 'var(--pl-bg-elev)',
              border: '1px solid var(--pl-border)',
              color: 'var(--pl-text)',
            }}
          />
        )}

        {!isAnswered && question.type !== 'ESSAY' && (
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
  );
}
