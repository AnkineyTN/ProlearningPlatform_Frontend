import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const RECALL_BUTTONS = [
  { labelKey: 'again', correct: false, color: 'var(--pl-danger)' },
  { labelKey: 'good', correct: true, color: 'var(--pl-accent)' },
] as const;

type Props = {
  onAnswer: (isCorrect: boolean) => void;
};

const FlashcardRecallButtons = ({ onAnswer }: Props) => {
  const { t } = useTranslation();
  const [hoveredBtn, setHoveredBtn] = useState<number | null>(null);

  return (
    <div className='mt-7'>
      <p className='text-[11px] uppercase tracking-[0.16em] text-center mb-3 text-[var(--pl-text-faint)]'>
        {t('flashcard.study.recallPrompt')}
      </p>
      <div className='grid grid-cols-2 gap-[10px]'>
        {RECALL_BUTTONS.map((btn, i) => (
          <button
            key={btn.labelKey}
            type='button'
            onClick={() => onAnswer(btn.correct)}
            onMouseEnter={() => setHoveredBtn(i)}
            onMouseLeave={() => setHoveredBtn(null)}
            className='py-[14px] px-4 rounded-[10px] flex items-center gap-2 transition-all cursor-pointer'
            style={{
              background: hoveredBtn === i ? 'var(--pl-bg-hover)' : 'var(--pl-bg-elev)',
              border:
                hoveredBtn === i
                  ? `1px solid ${btn.color}`
                  : '1px solid var(--pl-border)',
            }}
          >
            <span
              className='w-[6px] h-[6px] rounded-full shrink-0'
              style={{ background: btn.color }}
            />
            <span className='text-[13.5px] font-[500] text-[var(--pl-text)]'>
              {t(`flashcard.study.${btn.labelKey}`)}
            </span>
            <span
              className='ml-auto text-[10px] px-[6px] py-[1px] rounded bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]'
              style={{ fontFamily: 'var(--font-mono-pl)' }}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FlashcardRecallButtons;
