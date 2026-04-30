import type {
  PomodoroSetting,
  SessionType,
} from "@/services/types/pomodoro.types";

export const DEFAULT_SETTING: PomodoroSetting = {
  pomodoroDuration: 1500,
  shortBreak: 300,
  longBreak: 900,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartPomodoro: false,
};

export const DURATION_LIMITS = {
  pomodoroDuration: { min: 60, max: 7200 },
  shortBreak: { min: 60, max: 3600 },
  longBreak: { min: 60, max: 3600 },
  longBreakInterval: { min: 1, max: 10 },
};

export const STORAGE_KEYS = {
  spaceId: "pl-pomodoro-space-id",
  sounds: "pl-pomodoro-sounds",
};

export const sessionTypeFromDuration = (
  type: SessionType,
  setting: PomodoroSetting,
): number => {
  if (type === "POMODORO") return setting.pomodoroDuration;
  if (type === "SHORT_BREAK") return setting.shortBreak;
  return setting.longBreak;
};

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.max(0, seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const PRESET_SOUND_VOLUME = 0.6;
