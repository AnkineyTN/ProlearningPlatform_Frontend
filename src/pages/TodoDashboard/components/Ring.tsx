const Ring = ({ percent, size = 64 }: { percent: number; size?: number }) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div
      className='relative grid place-items-center'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke='var(--pl-border)'
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke='var(--pl-accent)'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 360ms ease' }}
        />
      </svg>
      <div className='absolute text-center'>
        <div className='text-[15px] font-display leading-none text-[var(--pl-text)]'>
          {percent}
        </div>
        <div className='text-[8.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
          %
        </div>
      </div>
    </div>
  );
};

export default Ring;
