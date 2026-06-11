import { useState } from 'react';

export type StatsTimeFormat = 'minutes' | 'compact';
export type ProgressStyle = 'ring' | 'bar' | 'none';

export interface PomodoroUiPrefs {
  statsTimeFormat: StatsTimeFormat;
  progressStyle: ProgressStyle;
}

const STORAGE_KEY = 'pl-pomodoro-ui-prefs';

const DEFAULT_UI_PREFS: PomodoroUiPrefs = {
  statsTimeFormat: 'minutes',
  progressStyle: 'ring',
};

export const formatStatDuration = (
  minutes: number,
  format: StatsTimeFormat,
): string => {
  if (format === 'compact') {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
  }
  return `${minutes}m`;
};

export const usePomodoroUiPrefs = () => {
  const [prefs, setPrefs] = useState<PomodoroUiPrefs>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored
        ? { ...DEFAULT_UI_PREFS, ...JSON.parse(stored) }
        : DEFAULT_UI_PREFS;
    } catch {
      return DEFAULT_UI_PREFS;
    }
  });

  const updatePrefs = (patch: Partial<PomodoroUiPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return [prefs, updatePrefs] as const;
};