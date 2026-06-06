import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Exam } from '../../types';
import type { ResultHelpers } from './utils';

interface QuestionNavigatorProps {
  exam: Exam;
  helpers: ResultHelpers;
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const BASE_CLASS = {
  correct: 'text-[var(--pl-accent)]',
  wrong:   'text-[var(--pl-danger-text)]',
  pending: 'text-[var(--pl-warning-text)]',
} as const;

const SELECTED_CLASS = {
  correct: 'bg-[var(--pl-accent-soft-2)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] font-semibold',
  wrong:   'bg-[var(--pl-danger-soft)] border-[var(--pl-danger-border)] text-[var(--pl-danger-text)] font-semibold',
  pending: 'bg-[var(--pl-warning-soft)] border-[var(--pl-warning-border)] text-[var(--pl-warning-text)] font-semibold',
} as const;

export default function QuestionNavigator({
  exam,
  helpers,
  selectedIndex,
  onSelect,
}: QuestionNavigatorProps) {
  const { t } = useTranslation();

  return (
    <div className='rounded-xl border border-border overflow-hidden'>
      <div className='px-3 py-2 border-b border-border bg-[var(--pl-bg-hover)]'>
        <p className='text-[10px] tracking-[0.15em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
          {t('exam.results.navigatorTitle').toUpperCase()}
        </p>
      </div>

      <div className='max-h-[60vh] overflow-y-auto p-2 space-y-0.5'>
        {exam.questions.map((question, index) => {
          const correct = helpers.isAnswerCorrect(question.id);
          const isSelected = index === selectedIndex;
          const status = correct === true ? 'correct' : correct === false ? 'wrong' : 'pending';

          const icon =
            correct === true ? <CheckCircle className='w-3.5 h-3.5 flex-shrink-0' />
            : correct === false ? <XCircle className='w-3.5 h-3.5 flex-shrink-0' />
            : <Clock className='w-3.5 h-3.5 flex-shrink-0' />;

          return (
            <button
              key={question.id}
              onClick={() => onSelect(index)}
              title={question.questionText}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all text-left hover:opacity-80 ${
                isSelected
                  ? SELECTED_CLASS[status]
                  : `border-transparent ${BASE_CLASS[status]}`
              }`}
            >
              {icon}
              <span className='truncate'>Q{index + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
