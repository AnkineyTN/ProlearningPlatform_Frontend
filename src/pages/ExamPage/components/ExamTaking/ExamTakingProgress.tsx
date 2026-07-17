interface ExamTakingProgressProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  answeredQuestions: Set<number>;
  flagged: Set<number>;
  onSelect: (index: number) => void;
}

export default function ExamTakingProgress({
  totalQuestions,
  currentQuestionIndex,
  answeredQuestions,
  flagged,
  onSelect,
}: ExamTakingProgressProps) {
  return (
    <div
      className='flex items-center gap-3 px-10 py-[14px]'
      style={{ borderBottom: '1px solid var(--pl-border)' }}
    >
      <span
        className='text-[11px] uppercase tracking-[0.14em] flex-shrink-0'
        style={{ color: 'var(--pl-text-faint)' }}
      >
        Question {currentQuestionIndex + 1}/{totalQuestions}
      </span>
      <div className='flex-1 flex gap-1 items-center'>
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const done = answeredQuestions.has(i);
          const curr = i === currentQuestionIndex;
          const isFlagged = flagged.has(i);
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              title={`Question ${i + 1}${isFlagged ? ' · Flagged' : ''}`}
              className='flex-1 cursor-pointer flex flex-col items-center gap-[3px] py-2 transition-opacity hover:opacity-80'
            >
              <div
                className='w-full h-1.5 rounded-full transition-all'
                style={{
                  background: curr
                    ? 'var(--pl-accent)'
                    : done
                      ? 'var(--pl-success)'
                      : 'var(--pl-border)',
                  opacity: done && !curr ? 0.7 : 1,
                }}
              />
              <div
                className='w-1 h-1 rounded-full transition-all'
                style={{
                  background: isFlagged ? '#f59e0b' : 'transparent',
                }}
              />
            </button>
          );
        })}
      </div>
      <span
        className='text-[11.5px] flex-shrink-0'
        style={{
          color: 'var(--pl-text-faint)',
          fontFamily: 'var(--font-mono-pl)',
        }}
      >
        {answeredQuestions.size}/{totalQuestions} answered
        {flagged.size > 0 && (
          <span style={{ color: '#f59e0b' }}> · {flagged.size} flagged</span>
        )}
      </span>
    </div>
  );
}
