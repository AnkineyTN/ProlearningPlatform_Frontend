import { ArrowLeft, ArrowRight, BookmarkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      <button
        onClick={onPrev}
        disabled={currentQuestionIndex === 0}
        className='flex items-center gap-2 px-[18px] py-[10px] rounded-full text-[13px] transition-opacity disabled:opacity-30'
        style={{
          border: '1px solid var(--pl-border)',
          color: 'var(--pl-text-muted)',
        }}
      >
        <ArrowLeft size={12} /> {t('exam.taking.previous')}
      </button>

      <button
        onClick={onToggleFlag}
        className='flex items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
        style={{
          color: isFlagged ? 'var(--pl-accent-strong)' : 'var(--pl-text-faint)',
        }}
      >
        <BookmarkIcon size={12} fill={isFlagged ? 'currentColor' : 'none'} />
        Flag for review
      </button>

      {!isLast ? (
        <button
          onClick={onNext}
          className='flex items-center gap-2 px-[22px] py-[10px] rounded-full text-[13px] font-[500] transition-colors'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
        >
          {t('exam.taking.next')} <ArrowRight size={12} />
        </button>
      ) : (
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className='flex items-center gap-2 px-[22px] py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
        >
          {isSubmitting
            ? t('exam.taking.submitting')
            : t('exam.taking.submitExam')}{' '}
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}
