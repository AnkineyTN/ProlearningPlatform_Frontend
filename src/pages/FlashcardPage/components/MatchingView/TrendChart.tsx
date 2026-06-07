import { TrendingDown, TrendingUp } from 'lucide-react';

interface TrendPoint {
  x: number;
  y: number;
}

interface MatchingTrendChartProps {
  trendValues: number[];
  trendPoints: TrendPoint[];
  improving: boolean;
  trendW: number;
  trendH: number;
  padY: number;
  formatSeconds: (seconds: number) => string;
}

const MatchingTrendChart = ({
  trendValues,
  trendPoints,
  improving,
  trendW,
  trendH,
  padY,
  formatSeconds,
}: MatchingTrendChartProps) => {
  if (trendValues.length < 2) return null;

  return (
    <div className='rounded-2xl border border-border bg-[var(--pl-bg)] p-5'>
      <div className='flex items-start justify-between mb-2'>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)] mb-1'>
            LAST {trendValues.length} RUNS · TIME TO COMPLETE
          </p>
          <p className='text-sm text-muted-foreground'>
            {improving
              ? 'Trending down — keep at it.'
              : 'Time creeping up — focus on the cards you miss most.'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border ${
            improving
              ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
              : 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'
          }`}
        >
          {improving ? (
            <TrendingDown className='w-3 h-3' />
          ) : (
            <TrendingUp className='w-3 h-3' />
          )}
          {improving ? 'Improving' : 'Watch out'}
        </span>
      </div>

      <div className='relative h-28 mt-4'>
        <svg
          width='100%'
          height='100%'
          viewBox={`0 0 ${trendW} ${trendH}`}
          preserveAspectRatio='none'
        >
          <defs>
            <linearGradient id='trendFill' x1='0' x2='0' y1='0' y2='1'>
              <stop offset='0%' stopColor='#22c55e' stopOpacity='0.25' />
              <stop offset='100%' stopColor='#22c55e' stopOpacity='0' />
            </linearGradient>
          </defs>
          <path
            d={`M ${trendPoints[0].x},${trendH - padY} ${trendPoints
              .map((p) => `L ${p.x},${p.y}`)
              .join(' ')} L ${
              trendPoints[trendPoints.length - 1].x
            },${trendH - padY} Z`}
            fill='url(#trendFill)'
          />
          <path
            d={trendPoints
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
              .join(' ')}
            fill='none'
            stroke='#22c55e'
            strokeWidth='2'
          />
          {trendPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === trendPoints.length - 1 ? 5 : 3}
              fill={i === trendPoints.length - 1 ? '#22c55e' : 'var(--pl-bg)'}
              stroke='#22c55e'
              strokeWidth='2'
            />
          ))}
        </svg>
        <span className='absolute right-1 bottom-1 text-xs font-[family-name:var(--font-mono-pl)] text-[var(--pl-accent)]'>
          {formatSeconds(trendValues[trendValues.length - 1])}
        </span>
      </div>
    </div>
  );
};

export default MatchingTrendChart;
