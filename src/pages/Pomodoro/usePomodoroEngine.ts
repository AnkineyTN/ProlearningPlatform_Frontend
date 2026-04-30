import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PomodoroSetting,
  SessionType,
} from "@/services/types/pomodoro.types";
import { sessionTypeFromDuration } from "./constants";

interface EngineOptions {
  setting: PomodoroSetting;
  onSessionEnd: (s: {
    type: SessionType;
    duration: number;
    planned: number;
    completed: boolean;
    startedAt: string;
    endedAt: string;
  }) => void;
}

interface EngineState {
  type: SessionType;
  remaining: number;
  running: boolean;
  pomodoroCount: number;
}

export const usePomodoroEngine = ({ setting, onSessionEnd }: EngineOptions) => {
  const [state, setState] = useState<EngineState>(() => ({
    type: "POMODORO",
    remaining: setting.pomodoroDuration,
    running: false,
    pomodoroCount: 0,
  }));

  const startedAtRef = useRef<string | null>(null);
  const plannedRef = useRef<number>(setting.pomodoroDuration);
  const settingRef = useRef(setting);
  const intervalRef = useRef<number | null>(null);
  const pausedReadinessRef = useRef(false);

  // Keep the latest setting in a ref so the running tick reads fresh values.
  useEffect(() => {
    settingRef.current = setting;
  }, [setting]);

  // Reset remaining when type changes externally OR setting changes & timer not running
  useEffect(() => {
    if (!state.running) {
      const planned = sessionTypeFromDuration(state.type, setting);
      plannedRef.current = planned;
      setState((s) => ({ ...s, remaining: planned }));
    }
    // We intentionally only react to type/setting changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.type, setting.pomodoroDuration, setting.shortBreak, setting.longBreak]);

  const clearTick = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const finishSession = useCallback(
    (completed: boolean) => {
      const endedAt = new Date().toISOString();
      const startedAt = startedAtRef.current ?? endedAt;
      const planned = plannedRef.current;
      const elapsed = Math.max(
        0,
        Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000),
      );
      const finalDuration = completed ? planned : Math.min(elapsed, planned);
      const finishedType = state.type;
      onSessionEnd({
        type: finishedType,
        duration: finalDuration,
        planned,
        completed,
        startedAt,
        endedAt,
      });
      startedAtRef.current = null;

      const cur = settingRef.current;
      // Decide what comes next.
      let nextType: SessionType;
      let newCount = state.pomodoroCount;
      if (finishedType === "POMODORO") {
        newCount += 1;
        nextType =
          newCount % cur.longBreakInterval === 0
            ? "LONG_BREAK"
            : "SHORT_BREAK";
      } else {
        nextType = "POMODORO";
      }

      const nextPlanned = sessionTypeFromDuration(nextType, cur);
      plannedRef.current = nextPlanned;

      const shouldAutoStart = completed
        ? finishedType === "POMODORO"
          ? cur.autoStartBreak
          : cur.autoStartPomodoro
        : false;

      setState({
        type: nextType,
        remaining: nextPlanned,
        running: shouldAutoStart,
        pomodoroCount: newCount,
      });
      pausedReadinessRef.current = shouldAutoStart;
    },
    [onSessionEnd, state.pomodoroCount, state.type],
  );

  // Tick effect
  useEffect(() => {
    if (!state.running) {
      clearTick();
      return;
    }
    if (!startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
      plannedRef.current = sessionTypeFromDuration(state.type, settingRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setState((s) => {
        if (!s.running) return s;
        if (s.remaining <= 1) {
          // Finish on next tick — defer state mutation to avoid double-handling.
          window.setTimeout(() => finishSession(true), 0);
          return { ...s, remaining: 0, running: false };
        }
        return { ...s, remaining: s.remaining - 1 };
      });
    }, 1000) as unknown as number;

    return clearTick;
  }, [state.running, state.type, finishSession]);

  const start = () => setState((s) => ({ ...s, running: true }));
  const pause = () => setState((s) => ({ ...s, running: false }));
  const toggle = () => setState((s) => ({ ...s, running: !s.running }));

  const reset = () => {
    clearTick();
    if (startedAtRef.current) {
      // Treat as cancelled (incomplete) session if we were running.
      const endedAt = new Date().toISOString();
      const startedAt = startedAtRef.current;
      const elapsed = Math.max(
        0,
        Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000),
      );
      if (elapsed > 0) {
        onSessionEnd({
          type: state.type,
          duration: elapsed,
          planned: plannedRef.current,
          completed: false,
          startedAt,
          endedAt,
        });
      }
      startedAtRef.current = null;
    }
    const planned = sessionTypeFromDuration(state.type, settingRef.current);
    plannedRef.current = planned;
    setState((s) => ({ ...s, remaining: planned, running: false }));
  };

  const skip = () => {
    clearTick();
    finishSession(false);
  };

  const setType = (type: SessionType) => {
    clearTick();
    if (startedAtRef.current) {
      const endedAt = new Date().toISOString();
      const startedAt = startedAtRef.current;
      const elapsed = Math.max(
        0,
        Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000),
      );
      if (elapsed > 0) {
        onSessionEnd({
          type: state.type,
          duration: elapsed,
          planned: plannedRef.current,
          completed: false,
          startedAt,
          endedAt,
        });
      }
      startedAtRef.current = null;
    }
    const planned = sessionTypeFromDuration(type, settingRef.current);
    plannedRef.current = planned;
    setState({
      type,
      remaining: planned,
      running: false,
      pomodoroCount: state.pomodoroCount,
    });
  };

  return {
    type: state.type,
    remaining: state.remaining,
    running: state.running,
    pomodoroCount: state.pomodoroCount,
    planned: plannedRef.current,
    start,
    pause,
    toggle,
    reset,
    skip,
    setType,
  };
};
