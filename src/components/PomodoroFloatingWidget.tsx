import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { formatTime } from '@/pages/Pomodoro/constants';

const SESSION_TYPE_COLORS: Record<string, string> = {
  POMODORO: 'text-red-400',
  SHORT_BREAK: 'text-emerald-400',
  LONG_BREAK: 'text-sky-400',
};

const PomodoroFloatingWidget = () => {
  const { engine, sessionEndCount } = usePomodoroContext();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const [isShaking, setIsShaking] = useState(false);
  const prevSessionEndCount = useRef(sessionEndCount);

  // Trigger shake when a session ends naturally
  useEffect(() => {
    if (sessionEndCount !== prevSessionEndCount.current) {
      prevSessionEndCount.current = sessionEndCount;
      setIsShaking(true);
    }
  }, [sessionEndCount]);

  // Reset shake class after animation completes (3 × 0.55s ≈ 1.7s)
  useEffect(() => {
    if (!isShaking) return;
    const id = setTimeout(() => setIsShaking(false), 1800);
    return () => clearTimeout(id);
  }, [isShaking]);

  // Only show when a session is active and user is elsewhere in the app
  const hasActiveSession = engine.running || engine.remaining < engine.planned;
  if (!hasActiveSession || pathname === '/pomodoro') return null;

  const typeColor = SESSION_TYPE_COLORS[engine.type] ?? 'text-white';

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 ${isShaking ? 'pl-animate-shake' : ''}`}
      onAnimationEnd={() => setIsShaking(false)}
    >
      <div className='w-52 rounded-2xl bg-[var(--pl-bg-elevated)] border border-[var(--pl-border)] shadow-xl overflow-hidden'>
        {/* Header */}
        <Link
          to='/pomodoro'
          className='flex items-center justify-between px-3 py-2 bg-black/10 hover:bg-black/20 transition-colors'
        >
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${typeColor}`}
          >
            {t(`pomodoro.types.${engine.type}`)}
          </span>
          <span className='text-[10px] text-[var(--pl-text-faint)] hover:text-[var(--pl-text-muted)]'>
            {t('pomodoro.backToTimer') || 'Open timer →'}
          </span>
        </Link>

        {/* Countdown */}
        <div className='px-3 pt-3 pb-2 text-center'>
          <span
            className='text-4xl font-bold tabular-nums text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {formatTime(engine.remaining)}
          </span>
        </div>

        {/* Controls */}
        <div className='flex items-center justify-center gap-2 px-3 pb-3'>
          <button
            type='button'
            onClick={engine.toggle}
            className='flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--pl-accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity'
          >
            {engine.running ? <Pause size={12} /> : <Play size={12} />}
            {engine.running ? t('pomodoro.pause') : t('pomodoro.start')}
          </button>
          <button
            type='button'
            onClick={engine.skip}
            title={t('pomodoro.skip')}
            className='p-1.5 rounded-full text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] transition-colors'
          >
            <SkipForward size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroFloatingWidget;
