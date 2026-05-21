import { Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatTime } from './utils';

interface ExamTakingHeaderProps {
  title: string;
  timeRemaining: number;
  timeLimitSeconds: number;
  isUrgent: boolean;
  isSubmitting: boolean;
  onExit: () => void;
  onSubmit: () => void;
}

export default function ExamTakingHeader({
  title,
  timeRemaining,
  timeLimitSeconds,
  isUrgent,
  isSubmitting,
  onExit,
  onSubmit,
}: ExamTakingHeaderProps) {
  const { t } = useTranslation();

  return (
    <div
      className='sticky top-0 z-10 flex items-center justify-between px-10 py-4'
      style={{
        borderBottom: '1px solid var(--pl-border)',
        background: 'var(--pl-bg)',
      }}
    >
      <div className='flex items-center gap-4'>
        <button
          onClick={onExit}
          disabled={isSubmitting}
          className='flex items-center gap-2 text-[12.5px] transition-opacity hover:opacity-70'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          <X size={14} /> Exit exam
        </button>
        <div
          className='h-[18px] w-px'
          style={{ background: 'var(--pl-border)' }}
        />
        <span
          className='text-[11px] uppercase tracking-[0.14em]'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          {title} · Practice Exam
        </span>
      </div>

      <div className='flex items-center gap-5'>
        <div
          className='flex items-center gap-2 px-4 py-2 rounded-lg text-[13px]'
          style={{
            background: isUrgent
              ? 'oklch(0.65 0.2 25 / 0.12)'
              : 'var(--pl-bg-elev)',
            border: `1px solid ${isUrgent ? 'oklch(0.65 0.2 25 / 0.4)' : 'var(--pl-border)'}`,
            color: isUrgent ? 'oklch(0.65 0.2 25)' : 'var(--pl-text-muted)',
            fontFamily: 'var(--font-mono-pl)',
          }}
        >
          <Clock size={13} />
          <span className='font-[500]'>{formatTime(timeRemaining)}</span>
          <span style={{ color: 'var(--pl-text-faint)' }}>
            / {formatTime(timeLimitSeconds)}
          </span>
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className='px-5 py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
        >
          {isSubmitting
            ? t('exam.taking.submitting')
            : t('exam.taking.submitExam')}
        </button>
      </div>
    </div>
  );
}
