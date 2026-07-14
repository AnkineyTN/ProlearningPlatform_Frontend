import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  isFlipped: boolean;
  frontText: string;
  backText: string;
  frontLabel: string;
  backLabel: string;
  cardNumber: string;
  imageUrl?: string | null;
  isDraggingRight: boolean;
  isDraggingLeft: boolean;
  dragProgress: number;
  flashColor: 'correct' | 'incorrect' | null;
  autoFlipDelay: number | null;
  cardKey: number;
  onCardClick: () => void;
};

const Kbd = ({ children }: { children: ReactNode }) => (
  <kbd
    className='text-[10px] px-[6px] py-[2px] rounded bg-[var(--pl-bg-hover)] border border-[var(--pl-border)]'
    style={{ fontFamily: 'var(--font-mono-pl)' }}
  >
    {children}
  </kbd>
);

const FlashcardCard = ({
  isFlipped,
  frontText,
  backText,
  frontLabel,
  backLabel,
  cardNumber,
  imageUrl,
  isDraggingRight,
  isDraggingLeft,
  dragProgress,
  flashColor,
  autoFlipDelay,
  cardKey,
  onCardClick,
}: Props) => {
  const { t } = useTranslation();

  return (
  <>
    <div className='relative h-[440px] [perspective:1800px]'>
      {/* 3D flip container */}
      <div
        onClick={onCardClick}
        className='relative h-[440px] cursor-pointer [transform-style:preserve-3d]'
        style={{
          transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
        }}
      >
        {/* Front face */}
        <div
          className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-[0_30px_80px_oklch(0_0_0_/_0.1)]'
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className='flex justify-between items-start'>
            <span className='text-[11px] uppercase tracking-[0.16em] text-[var(--pl-text-faint)]'>
              {frontLabel} · {t('flashcard.study.card.tapToReveal')}
            </span>
            <span className='text-[10.5px] px-[10px] py-[3px] rounded-full uppercase tracking-[0.08em] font-[500] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
              {t('flashcard.study.card.difficultyMedium')}
            </span>
          </div>

          <div className='flex-1 flex items-center justify-center text-center py-5'>
            <div>
              <div
                className='text-[13px] mb-4 text-[var(--pl-text-faint)]'
                style={{ fontFamily: 'var(--font-mono-pl)' }}
              >
                {t('flashcard.study.card.questionLabel', { number: cardNumber })}
              </div>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt='Card'
                  className='max-w-full max-h-36 object-contain rounded mb-4 mx-auto'
                />
              )}
              <div
                className='text-[32px] font-[400] leading-[1.25] tracking-[-0.02em] text-[var(--pl-text)]'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {frontText}
              </div>
            </div>
          </div>

          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-[5px] text-[11px] text-[var(--pl-text-faint)]'>
              <Kbd>←</Kbd>
              <Kbd>→</Kbd>
              <span className='ml-1'>{t('flashcard.study.card.navigate')}</span>
            </div>
            <div className='flex items-center gap-2 text-[11.5px] text-[var(--pl-text-faint)]'>
              <span>{t('flashcard.study.card.pressLabel')}</span>
              <Kbd>Space</Kbd>
              <span>{t('flashcard.study.card.toFlipLabel')}</span>
            </div>
          </div>
        </div>

        {/* Back face */}
        <div
          className='absolute inset-0 rounded-[20px] p-[44px_48px] flex flex-col bg-[var(--pl-bg-elev)] border border-[var(--pl-accent-border)] shadow-[0_30px_80px_oklch(0_0_0_/_0.1)]'
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className='text-[11px] uppercase tracking-[0.16em] mb-5 text-[var(--pl-accent-strong)]'>
            {backLabel}
          </div>
          <div className='flex-1 overflow-auto'>
            <div
              className='text-[22px] font-[400] leading-[1.4] tracking-[-0.01em] text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {backText}
            </div>
          </div>
          <div className='flex justify-end items-center mt-4'>
            <div className='flex items-center gap-[5px] text-[11px] text-[var(--pl-text-faint)]'>
              <Kbd>1</Kbd>
              <span className='mr-2'>{t('flashcard.study.again')}</span>
              <Kbd>2</Kbd>
              <span>{t('flashcard.study.good')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag: right → Good */}
      {isDraggingRight && (
        <div
          className='absolute inset-0 rounded-[20px] pointer-events-none flex items-center justify-end pr-10 z-10'
          style={{
            background: `oklch(0.7 0.18 145 / ${dragProgress * 0.14})`,
            border: `2px solid oklch(0.65 0.18 145 / ${dragProgress * 0.55})`,
          }}
        >
          <span
            className='text-[13px] font-[600] tracking-[0.04em]'
            style={{ opacity: dragProgress, color: 'oklch(0.45 0.2 145)' }}
          >
            {t('flashcard.study.card.dragGoodHint')}
          </span>
        </div>
      )}

      {/* Drag: left → Again */}
      {isDraggingLeft && (
        <div
          className='absolute inset-0 rounded-[20px] pointer-events-none flex items-center justify-start pl-10 z-10'
          style={{
            background: `oklch(0.65 0.2 25 / ${dragProgress * 0.14})`,
            border: `2px solid oklch(0.6 0.2 25 / ${dragProgress * 0.55})`,
          }}
        >
          <span
            className='text-[13px] font-[600] tracking-[0.04em]'
            style={{ opacity: dragProgress, color: 'oklch(0.45 0.2 25)' }}
          >
            {t('flashcard.study.card.dragAgainHint')}
          </span>
        </div>
      )}

      {/* Answer flash overlay */}
      {flashColor && (
        <div
          className='absolute inset-0 rounded-[20px] pointer-events-none z-20 [animation:flash-answer_0.42s_ease-out_forwards]'
          style={{
            background:
              flashColor === 'correct'
                ? 'oklch(0.7 0.2 145 / 0.22)'
                : 'oklch(0.6 0.22 25 / 0.22)',
          }}
        />
      )}
    </div>

    {/* Auto-flip countdown bar */}
    {autoFlipDelay !== null && !isFlipped && (
      <div className='mt-3 h-[3px] rounded-full overflow-hidden bg-[var(--pl-border)]'>
        <div
          key={cardKey}
          className='h-full w-full rounded-full bg-[var(--pl-accent)]'
          style={{ animation: `auto-flip-countdown ${autoFlipDelay}s linear forwards` }}
        />
      </div>
    )}
  </>
  );
};

export default FlashcardCard;
