import { ArrowLeft, ArrowRight, BookmarkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

interface ExamTakingFooterProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  isFlagged: boolean;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onSubmit: () => void;
}

export default function ExamTakingFooter({
  currentQuestionIndex,
  totalQuestions,
  isFlagged,
  isSubmitting,
  onPrev,
  onNext,
  onToggleFlag,
  onSubmit,
}: ExamTakingFooterProps) {
  const { t } = useTranslation();
  const isLast = currentQuestionIndex >= totalQuestions - 1;

  return (
    <div
      className='sticky bottom-0 flex items-center justify-between px-10 py-4'
      style={{
        borderTop: '1px solid var(--pl-border)',
        background: 'var(--pl-bg-elev)',
      }}
    >
      <Button
        onClick={onPrev}
        disabled={currentQuestionIndex === 0}
        variant={'outline'}
        className='px-4! rounded-full'
        style={{
          border: '1px solid var(--pl-border)',
          color: 'var(--pl-text-muted)',
        }}
      >
        <ArrowLeft size={12} /> {t('exam.taking.previous')}
      </Button>

      <button
        onClick={onToggleFlag}
        className='flex items-center cursor-pointer gap-2 text-[12.5px] transition-opacity hover:opacity-70'
        style={{
          color: isFlagged ? 'var(--pl-accent-strong)' : 'var(--pl-text-faint)',
        }}
      >
        <BookmarkIcon size={12} fill={isFlagged ? 'currentColor' : 'none'} />
        {t('exam.taking.flagForReview')}
      </button>

      {!isLast ? (
        <Button
          onClick={onNext}
          className='rounded-full px-4!'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
        >
          {t('exam.taking.next')} <ArrowRight size={12} />
        </Button>
      ) : (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className='rounded-full px-4!'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
        >
          {isSubmitting
            ? t('exam.taking.submitting')
            : t('exam.taking.submitExam')}{' '}
          <ArrowRight size={12} />
        </Button>
      )}
    </div>
  );
}
