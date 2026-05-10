/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  usePomodoroSetting,
  useRecordSession,
  useSoundsSearch,
} from '@/hooks/usePomodoro';
import { DEFAULT_SETTING, STORAGE_KEYS } from '@/pages/Pomodoro/constants';
import { usePomodoroEngine } from '@/pages/Pomodoro/usePomodoroEngine';

import type { SoundDto } from '@/services/types/pomodoro.types';
export interface ActiveSound {
  sound: SoundDto;
  volume: number;
  paused?: boolean;
}

type StoredSound = { id: number; volume: number };

interface PomodoroContextValue {
  engine: ReturnType<typeof usePomodoroEngine>;
  activeSounds: ActiveSound[];
  setActiveSounds: (sounds: ActiveSound[]) => void;
  /** Increments each time a session ends naturally — widgets can watch this to trigger animations. */
  sessionEndCount: number;
}

const PomodoroContext = createContext<PomodoroContextValue | null>(null);

export const usePomodoroContext = () => {
  const ctx = useContext(PomodoroContext);
  if (!ctx)
    throw new Error('usePomodoroContext must be used inside PomodoroProvider');
  return ctx;
};

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { data: serverSetting } = usePomodoroSetting();
  const recordSession = useRecordSession();
  const setting = serverSetting ?? DEFAULT_SETTING;

  const [sessionEndCount, setSessionEndCount] = useState(0);

  const engine = usePomodoroEngine({
    setting,
    onSessionEnd: (s) => {
      recordSession.mutate(s);
      if (s.completed) setSessionEndCount((n) => n + 1);
    },
  });

  const [activeSounds, setActiveSounds] = useState<ActiveSound[]>([]);
  const [storedSoundIds, setStoredSoundIds] = useState<StoredSound[]>(() => {
    const v = localStorage.getItem(STORAGE_KEYS.sounds);
    if (!v) return [];
    try {
      return JSON.parse(v) as StoredSound[];
    } catch {
      return [];
    }
  });

  // Persist sound IDs + volumes
  useEffect(() => {
    const compact: StoredSound[] = activeSounds.map((a) => ({
      id: a.sound.id,
      volume: a.volume,
    }));
    localStorage.setItem(STORAGE_KEYS.sounds, JSON.stringify(compact));
  }, [activeSounds]);

  return (
    <PomodoroContext.Provider
      value={{ engine, activeSounds, setActiveSounds, sessionEndCount }}
    >
      {children}
      {/* Hydrate sounds once catalog is available */}
      <SoundHydrator
        storedSoundIds={storedSoundIds}
        activeSounds={activeSounds}
        setActiveSounds={setActiveSounds}
        clearStored={() => setStoredSoundIds([])}
      />
    </PomodoroContext.Provider>
  );
};

const SoundHydrator = ({
  storedSoundIds,
  activeSounds,
  setActiveSounds,
  clearStored,
}: {
  storedSoundIds: StoredSound[];
  activeSounds: ActiveSound[];
  setActiveSounds: (s: ActiveSound[]) => void;
  clearStored: () => void;
}) => {
  const { data } = useSoundsSearch({ tab: 'ALL', page: 0, size: 50 });
  useEffect(() => {
    if (storedSoundIds.length === 0) return;
    if (activeSounds.length > 0) return;
    if (!data?.data) return;
    const next: ActiveSound[] = [];
    for (const s of storedSoundIds) {
      const found = data.data.find((x) => x.id === s.id);
      if (found) next.push({ sound: found, volume: s.volume });
    }
    if (next.length > 0) {
      setActiveSounds(next);
      clearStored();
    }
  }, [data, storedSoundIds, activeSounds.length, setActiveSounds, clearStored]);
  return null;
};
