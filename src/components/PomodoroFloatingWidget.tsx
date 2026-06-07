import { animate, motion, type PanInfo, useMotionValue } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  SkipForward,
  Volume2,
  VolumeX,
  ExternalLink,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { usePomodoroContext } from '@/contexts/PomodoroContext';
import { formatTime } from '@/pages/Pomodoro/constants';

import { Button } from './ui/button';

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const SESSION_TYPE_COLORS: Record<string, string> = {
  POMODORO: 'text-[var(--pl-danger)]',
  SHORT_BREAK: 'text-[var(--pl-success)]',
  LONG_BREAK: 'text-[var(--pl-accent)]',
};

const STORAGE_CORNER = 'pomodoro-widget-corner';
const STORAGE_COLLAPSED = 'pomodoro-widget-collapsed';
const PAD = 20;

function cornerToXY(c: Corner, w: number, h: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: c.includes('right') ? vw - w - PAD : PAD,
    y: c.includes('bottom') ? vh - h - PAD : PAD,
  };
}

const PomodoroFloatingWidget = () => {
  const { engine, sessionEndCount, activeSounds, setActiveSounds } =
    usePomodoroContext();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const [isShaking, setIsShaking] = useState(false);
  const prevSessionEndCount = useRef(sessionEndCount);

  const [corner, setCornerState] = useState<Corner>(
    () => (localStorage.getItem(STORAGE_CORNER) as Corner) ?? 'bottom-right',
  );
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_COLLAPSED) === 'true',
  );

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const widgetRef = useRef<HTMLDivElement>(null);
  const cornerRef = useRef(corner);
  cornerRef.current = corner;
  const wasDragging = useRef(false);

  useEffect(() => {
    if (sessionEndCount !== prevSessionEndCount.current) {
      prevSessionEndCount.current = sessionEndCount;
      setIsShaking(true);
    }
  }, [sessionEndCount]);

  useEffect(() => {
    if (!isShaking) return;
    const id = setTimeout(() => setIsShaking(false), 1800);
    return () => clearTimeout(id);
  }, [isShaking]);

  const snapTo = useCallback(
    (c: Corner, animated = true) => {
      const el = widgetRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const { x, y } = cornerToXY(c, width, height);
      if (animated) {
        animate(mx, x, { type: 'spring', stiffness: 380, damping: 32 });
        animate(my, y, { type: 'spring', stiffness: 380, damping: 32 });
      } else {
        mx.set(x);
        my.set(y);
      }
    },
    [mx, my],
  );

  const setCorner = useCallback(
    (c: Corner) => {
      setCornerState(c);
      localStorage.setItem(STORAGE_CORNER, c);
      snapTo(c);
    },
    [snapTo],
  );

  // Place at correct corner before first paint (no flash)
  useLayoutEffect(() => {
    snapTo(cornerRef.current, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-snap after collapsed height change
  useEffect(() => {
    requestAnimationFrame(() => snapTo(cornerRef.current));
  }, [collapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-snap on window resize
  useEffect(() => {
    const onResize = () => snapTo(cornerRef.current, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [snapTo]);

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) < 4 && Math.abs(info.offset.y) < 4) return;

    wasDragging.current = true;
    setTimeout(() => {
      wasDragging.current = false;
    }, 150);

    const el = widgetRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h =
      rect.left + rect.width / 2 > window.innerWidth / 2 ? 'right' : 'left';
    const v =
      rect.top + rect.height / 2 > window.innerHeight / 2 ? 'bottom' : 'top';
    setCorner(`${v}-${h}` as Corner);
  };

  const hasActiveSession = engine.running || engine.remaining < engine.planned;
  if (!hasActiveSession || pathname === '/pomodoro') return null;

  const typeColor = SESSION_TYPE_COLORS[engine.type] ?? 'text-white';
  const hasAudio = activeSounds.length > 0;
  const allAudioPaused = hasAudio && activeSounds.every((s) => s.paused);

  const toggleAudio = () => {
    setActiveSounds(
      activeSounds.map((s) => ({ ...s, paused: !allAudioPaused })),
    );
  };

  return (
    <motion.div
      ref={widgetRef}
      className={`fixed top-0 left-0 z-50 select-none w-52 ${isShaking ? 'pl-animate-shake' : ''}`}
      style={{ x: mx, y: my }}
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, zIndex: 60 }}
      onAnimationEnd={() => setIsShaking(false)}
    >
      <div className='rounded-2xl bg-[var(--pl-bg)]/20 backdrop-blur-md border border-[var(--pl-border)] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing'>
        {/* Header */}
        <div className='flex items-center justify-between gap-2 hover:bg-[var(--pl-accent)]/10 transition-colors ps-4 pe-2 py-1.5'>
          <Link
            to='/pomodoro'
            draggable={false}
            className='flex items-center gap-1 text-sm font-medium text-[var(--pl-text)]'
            onClick={(e) => {
              if (wasDragging.current) e.preventDefault();
            }}
          >
            <span
              className={`text-xs font-semibold uppercase flex items-center gap-1.5 tracking-wide ${typeColor}`}
            >
              {t(`pomodoro.types.${engine.type}`)}
              <ExternalLink className='size-3' />
            </span>
          </Link>

          {collapsed && (
            <span className='text-sm font-bold tabular-nums text-[var(--pl-text)] shrink-0'>
              {formatTime(engine.remaining)}
            </span>
          )}

          <Button
            variant='ghost'
            size='xs'
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem(STORAGE_COLLAPSED, String(next));
            }}
            className='rounded-full'
          >
            {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>

        {!collapsed && (
          <>
            <div className='px-3 pt-3 pb-2 text-center'>
              <span
                className='text-4xl font-bold tabular-nums text-[var(--pl-text)]'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {formatTime(engine.remaining)}
              </span>
            </div>

            <div className='flex items-center justify-center gap-2 px-3 pb-3'>
              <Button
                size='xs'
                onClick={engine.toggle}
                className='rounded-full'
              >
                {engine.running ? <Pause size={12} /> : <Play size={12} />}
              </Button>
              <Button
                variant='outline'
                size='xs'
                className='rounded-full'
                onClick={engine.skip}
                title={t('pomodoro.skip')}
              >
                <SkipForward size={14} />
              </Button>
              {hasAudio && (
                <Button
                  variant='outline'
                  size='xs'
                  className='rounded-full'
                  onClick={toggleAudio}
                  title={
                    allAudioPaused
                      ? t('pomodoro.resumeAudio') || 'Resume audio'
                      : t('pomodoro.pauseAudio') || 'Pause audio'
                  }
                >
                  {allAudioPaused ? (
                    <VolumeX size={14} />
                  ) : (
                    <Volume2 size={14} />
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default PomodoroFloatingWidget;
