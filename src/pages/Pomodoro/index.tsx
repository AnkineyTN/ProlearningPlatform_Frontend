import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Image as ImageIcon,
  Music,
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  SkipForward,
  VolumeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  usePomodoroSetting,
  useSpacesSearch,
  useUpdatePomodoroSetting,
} from '@/hooks/usePomodoro';
import type { SessionType, SpaceDto } from '@/services/types/pomodoro.types';
import { DEFAULT_SETTING, STORAGE_KEYS, formatTime } from './constants';
import { usePomodoroContext } from '@/contexts/PomodoroContext';
import SpaceBackground from './SpaceBackground';
import SpacePicker from './SpacePicker';
import SoundMixer from './SoundMixer';
import SettingsModal from './SettingsModal';
import StatsModal from './StatsModal';

const Pomodoro = () => {
  const { t } = useTranslation();
  const { data: serverSetting } = usePomodoroSetting();
  const updateSetting = useUpdatePomodoroSetting();

  const setting = serverSetting ?? DEFAULT_SETTING;

  const { engine, activeSounds, setActiveSounds } = usePomodoroContext();

  // ── Persisted space pick ─────────────────────────────────────
  const [selectedSpaceId, setSelectedSpaceId] = useState<number | null>(() => {
    const v = localStorage.getItem(STORAGE_KEYS.spaceId);
    return v ? Number(v) : null;
  });
  const [selectedSpace, setSelectedSpace] = useState<SpaceDto | null>(null);

  const { data: spacesData } = useSpacesSearch({
    tab: 'ALL',
    page: 0,
    size: 50,
  });
  const { data: favSpacesData } = useSpacesSearch({
    tab: 'FAVORITES',
    page: 0,
    size: 50,
  });
  const { data: mySpacesData } = useSpacesSearch({
    tab: 'MY_UPLOADS',
    page: 0,
    size: 50,
  });

  useEffect(() => {
    if (selectedSpace || selectedSpaceId === null) return;
    const all: SpaceDto[] = [
      ...(spacesData?.data ?? []),
      ...(favSpacesData?.data ?? []),
      ...(mySpacesData?.data ?? []),
    ];
    const found = all.find((s) => s.id === selectedSpaceId);
    if (found) setSelectedSpace(found);
  }, [spacesData, favSpacesData, mySpacesData, selectedSpaceId, selectedSpace]);

  useEffect(() => {
    if (selectedSpaceId !== null) {
      localStorage.setItem(STORAGE_KEYS.spaceId, String(selectedSpaceId));
    } else {
      localStorage.removeItem(STORAGE_KEYS.spaceId);
    }
  }, [selectedSpaceId]);

  // ── UI state ────────────────────────────────────────────────
  const [spacePickerOpen, setSpacePickerOpen] = useState(false);
  const [soundMixerOpen, setSoundMixerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Tab title shows remaining time when running.
  useEffect(() => {
    if (engine.running) {
      document.title = `${formatTime(engine.remaining)} · ${t(
        `pomodoro.types.${engine.type}`,
      )}`;
    } else {
      document.title = 'ProLearning · Pomodoro';
    }
    return () => {
      document.title = 'ProLearning';
    };
  }, [engine.remaining, engine.running, engine.type, t]);

  const tabs: { type: SessionType; label: string }[] = useMemo(
    () => [
      { type: 'POMODORO', label: t('pomodoro.types.POMODORO') },
      { type: 'SHORT_BREAK', label: t('pomodoro.types.SHORT_BREAK') },
      { type: 'LONG_BREAK', label: t('pomodoro.types.LONG_BREAK') },
    ],
    [t],
  );

  return (
    <div className='relative min-h-screen overflow-hidden isolate'>
      <SpaceBackground space={selectedSpace} />

      {/* Dim overlay over background (only when a space is set) */}
      {selectedSpace && (
        <div className='absolute inset-0 z-[1] bg-[var(--pl-bg)] pointer-events-none' />
      )}

      {/* Top toolbar */}
      <div className='absolute top-3 right-3 z-20 flex flex-wrap gap-2'>
        <ToolbarButton
          icon={<ImageIcon size={14} />}
          label={t('pomodoro.spaces.button')}
          onClick={() => setSpacePickerOpen(true)}
        />
        <ToolbarButton
          icon={<Music size={14} />}
          label={t('pomodoro.sounds.button')}
          onClick={() => setSoundMixerOpen(true)}
          badge={activeSounds.length || undefined}
        />
        <ToolbarButton
          icon={<BarChart3 size={14} />}
          label={t('pomodoro.stats.button')}
          onClick={() => setStatsOpen(true)}
        />
        <ToolbarButton
          icon={<SettingsIcon size={14} />}
          label={t('pomodoro.settings.button')}
          onClick={() => setSettingsOpen(true)}
        />
      </div>

      {/* Centered timer card */}
      <div className='relative z-10 min-h-[calc(100vh-2rem)] flex items-center justify-center p-6'>
        <div className='w-full max-w-md rounded-2xl bg-black/35 backdrop-blur-md border border-white/10 p-6 sm:p-8 text-white shadow-2xl'>
          {/* Mode tabs */}
          <div className='flex gap-1 p-1 rounded-lg bg-white/10 mb-6'>
            {tabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => engine.setType(tab.type)}
                className={cn(
                  'flex-1 text-xs sm:text-sm font-medium py-1.5 rounded-md transition-all cursor-pointer',
                  engine.type === tab.type
                    ? 'bg-white/95 text-black'
                    : 'text-white/80 hover:bg-white/10',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Big digits */}
          <div
            className='text-center font-bold tracking-tight tabular-nums my-4'
            style={{
              fontSize: 'clamp(72px, 18vw, 128px)',
              lineHeight: 1,
              fontFamily: 'var(--font-display)',
            }}
          >
            {formatTime(engine.remaining)}
          </div>

          {/* Pomodoro count */}
          <div className='text-center text-xs text-white/70 mb-5'>
            {t('pomodoro.completedToday', { count: engine.pomodoroCount })}
          </div>

          {/* Controls */}
          <div className='flex items-center justify-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='text-white/80 hover:bg-white/10 hover:text-white'
              onClick={engine.reset}
              title={t('pomodoro.reset')}
            >
              <RotateCcw size={18} />
            </Button>
            <Button
              size='lg'
              className='bg-white text-black hover:bg-white/90 px-8 h-12 text-base font-bold rounded-full'
              onClick={engine.toggle}
            >
              {engine.running ? <Pause size={18} /> : <Play size={18} />}
              {engine.running ? t('pomodoro.pause') : t('pomodoro.start')}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='text-white/80 hover:bg-white/10 hover:text-white'
              onClick={engine.skip}
              title={t('pomodoro.skip')}
            >
              <SkipForward size={18} />
            </Button>
          </div>

          {selectedSpace && (
            <div className='mt-5 text-center text-[11px] text-white/60'>
              {selectedSpace.name}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — active sounds */}
      {activeSounds.length > 0 && (
        <div className='absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-wrap gap-2 px-3 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs max-w-[90vw]'>
          {activeSounds.map((a) => {
            const isPaused = !!a.paused;
            return (
              <div
                key={a.sound.id}
                className='flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10'
              >
                <Music size={11} className={isPaused ? 'opacity-40' : ''} />
                <span
                  className={`truncate max-w-[120px] ${isPaused ? 'opacity-40' : ''}`}
                >
                  {a.sound.name}
                </span>
                <button
                  type='button'
                  title={
                    isPaused
                      ? t('pomodoro.sounds.resume')
                      : t('pomodoro.sounds.pause')
                  }
                  onClick={() =>
                    setActiveSounds(
                      activeSounds.map((s) =>
                        s.sound.id === a.sound.id
                          ? { ...s, paused: !s.paused }
                          : s,
                      ),
                    )
                  }
                  className='ml-0.5 hover:text-white/60 transition-colors'
                >
                  {isPaused ? <Play size={10} /> : <VolumeOff size={10} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SpacePicker
        open={spacePickerOpen}
        selectedId={selectedSpaceId}
        onClose={() => setSpacePickerOpen(false)}
        onSelect={(s) => {
          setSelectedSpace(s);
          setSelectedSpaceId(s.id);
        }}
        onReset={() => {
          setSelectedSpace(null);
          setSelectedSpaceId(null);
        }}
      />

      <SoundMixer
        open={soundMixerOpen}
        activeSounds={activeSounds}
        onClose={() => setSoundMixerOpen(false)}
        onChange={setActiveSounds}
      />

      <SettingsModal
        open={settingsOpen}
        setting={setting}
        onClose={() => setSettingsOpen(false)}
        saving={updateSetting.isPending}
        onSave={async (next) => {
          await updateSetting.mutateAsync(next);
        }}
      />

      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} />
    </div>
  );
};

const ToolbarButton = ({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    title={label}
    className='cursor-pointer relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs hover:bg-black/60'
  >
    {icon}
    <span className='hidden sm:inline'>{label}</span>
    {badge !== undefined && (
      <span className='ml-0.5 min-w-[16px] h-[16px] rounded-full bg-white text-black text-[10px] font-bold grid place-items-center px-1'>
        {badge}
      </span>
    )}
  </button>
);

export default Pomodoro;
