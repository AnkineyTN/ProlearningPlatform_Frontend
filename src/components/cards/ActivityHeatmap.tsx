import { useState, useMemo } from 'react';
import { useHeatmap } from '@/hooks/useActivityLog';
import type { HeatmapDay, HeatmapMode } from '@/services/types/activityLog.types';

// Cell colour: empty → var(--pl-border); filled → accent at 4 opacity levels
function cellBg(level: number, mode: HeatmapMode): string {
  if (level === 0) return 'var(--pl-border)';
  const opacity = 0.25 + level * 0.18;
  if (mode === 'sessions')
    return `oklch(0.62 0.16 230 / ${opacity})`; // blue
  if (mode === 'score')
    return `oklch(0.68 0.18 40 / ${opacity})`; // orange
  // time — use the theme accent
  return `oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / ${opacity})`;
}

function minuteLevel(m: number) {
  if (m === 0) return 0;
  if (m <= 20) return 1;
  if (m <= 60) return 2;
  if (m <= 120) return 3;
  return 4;
}
function sessionLevel(s: number) {
  if (s === 0) return 0;
  if (s <= 1) return 1;
  if (s <= 2) return 2;
  if (s <= 4) return 3;
  return 4;
}
function scoreLevel(sc: number | null) {
  if (sc == null) return 0;
  if (sc < 50) return 1;
  if (sc < 70) return 2;
  if (sc < 90) return 3;
  return 4;
}

function level(day: HeatmapDay | undefined, mode: HeatmapMode): number {
  if (!day) return 0;
  if (mode === 'time') return minuteLevel(day.totalMinutes);
  if (mode === 'sessions') return sessionLevel(day.sessions);
  return scoreLevel(day.bestScore);
}

function buildWeekGrid(months: number): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setMonth(start.getMonth() - months);
  const dow = (start.getDay() + 6) % 7; // rewind to Monday
  start.setDate(start.getDate() - dow);

  const weeks: Date[][] = [];
  const cur = new Date(start);
  while (cur <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DOW_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

type Tooltip = { x: number; y: number; day: HeatmapDay; date: string } | null;

const MODE_OPTS: { value: HeatmapMode; label: string }[] = [
  { value: 'time', label: 'Time' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'score', label: 'Score' },
];

const CELL = 16;
const GAP = 3;

const ActivityHeatmap = ({ months = 6 }: { months?: number }) => {
  const { data: heatmapData, isLoading } = useHeatmap(months);
  const [mode, setMode] = useState<HeatmapMode>('time');
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const todayKey = toKey(new Date());

  const dayMap = useMemo(() => {
    const m = new Map<string, HeatmapDay>();
    heatmapData?.forEach((d) => m.set(d.date, d));
    return m;
  }, [heatmapData]);

  const weeks = useMemo(() => buildWeekGrid(months), [months]);

  const monthLabels = useMemo(() => {
    const labels: { weekIdx: number; label: string }[] = [];
    let last = -1;
    weeks.forEach((week, wi) => {
      const m = week[0].getMonth();
      if (m !== last) { labels.push({ weekIdx: wi, label: MONTH_LABELS[m] }); last = m; }
    });
    return labels;
  }, [weeks]);

  if (isLoading) {
    return (
      <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden'>
        <div className='px-6 pt-[18px] pb-[14px]'>
          <div className='h-[10px] w-16 rounded bg-[var(--pl-border)] mb-2' />
          <div className='h-[18px] w-28 rounded bg-[var(--pl-border)]' />
        </div>
        <div className='px-5 pb-[18px] h-24 bg-[var(--pl-border)] mx-5 rounded-[6px] animate-pulse' />
      </section>
    );
  }

  return (
    <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden'>
      {/* Header */}
      <div className='px-6 pt-[18px] pb-[14px] flex items-end justify-between gap-3'>
        <div>
          <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'>
            {months * 4} weeks
          </div>
          <div className='text-[18px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'>
            Study activity
          </div>
        </div>

        {/* Mode toggle */}
        <div className='flex gap-[3px] p-[3px] bg-[var(--pl-bg-hover)] rounded-[8px] border border-[var(--pl-border)]'>
          {MODE_OPTS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              style={{
                fontSize: 11,
                padding: '3px 9px',
                borderRadius: 5,
                border: 0,
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: mode === value ? 'var(--pl-bg-elev)' : 'transparent',
                color: mode === value ? 'var(--pl-text)' : 'var(--pl-text-faint)',
                boxShadow: mode === value ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                fontWeight: mode === value ? 600 : 400,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className='px-5 pt-1 pb-[18px]'>
        <div style={{ display: 'flex', gap: 0 }}>
          {/* Day-of-week labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, marginTop: 18, marginRight: 5, width: 22 }}>
            {DOW_LABELS.map((lbl, i) => (
              <div
                key={i}
                style={{ height: CELL, fontSize: 8, color: 'var(--pl-text-faint)', lineHeight: `${CELL}px` }}
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* Columns */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {/* Month label row */}
            <div style={{ display: 'flex', height: 16, position: 'relative', marginBottom: 2 }}>
              {monthLabels.map(({ weekIdx, label }) => (
                <div
                  key={weekIdx}
                  style={{
                    position: 'absolute',
                    left: weekIdx * (CELL + GAP),
                    fontSize: 8,
                    color: 'var(--pl-text-faint)',
                    lineHeight: '12px',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div style={{ display: 'flex', gap: GAP }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: GAP }}>
                  {week.map((date, di) => {
                    const key = toKey(date);
                    const day = dayMap.get(key);
                    const lv = level(day, mode);
                    const isToday = key === todayKey;
                    return (
                      <div
                        key={di}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          background: cellBg(lv, mode),
                          outline: isToday ? '1.5px solid var(--pl-accent)' : undefined,
                          outlineOffset: isToday ? '1px' : undefined,
                          cursor: day ? 'pointer' : 'default',
                        }}
                        onMouseEnter={(e) => day && setTooltip({ x: e.clientX, y: e.clientY, day, date: key })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className='flex justify-between items-center mt-3 text-[10px] text-[var(--pl-text-faint)]'>
          <span>Less</span>
          <div style={{ display: 'flex', gap: GAP }}>
            {[0, 1, 2, 3, 4].map((lv) => (
              <div
                key={lv}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRadius: 2,
                  background: cellBg(lv, mode),
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x + 12,
            top: tooltip.y - 64,
            zIndex: 50,
            pointerEvents: 'none',
          }}
          className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[8px] shadow-lg px-3 py-2'
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--pl-text)', margin: 0 }}>
            {tooltip.date}
          </p>
          {mode === 'time' && (
            <p style={{ fontSize: 11, color: 'var(--pl-text-muted)', margin: '2px 0 0' }}>
              {tooltip.day.totalMinutes} min
            </p>
          )}
          {mode === 'sessions' && (
            <p style={{ fontSize: 11, color: 'var(--pl-text-muted)', margin: '2px 0 0' }}>
              {tooltip.day.sessions} sessions
            </p>
          )}
          {mode === 'score' && (
            <p style={{ fontSize: 11, color: 'var(--pl-text-muted)', margin: '2px 0 0' }}>
              {tooltip.day.bestScore != null ? `${tooltip.day.bestScore}/100` : 'No exam'}
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default ActivityHeatmap;
