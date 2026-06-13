import { useEffect, useRef, useCallback } from "react";
import type { ContentType } from "@/services/types/activityLog.types";
import { activityLogAPI } from "@/services/endpoints/activityLog";
import {
  flushPending,
  savePending,
  type PendingPayload,
} from "@/services/activityQueue";
import { usePomodoroContext } from "@/contexts/PomodoroContext";

const IDLE_THRESHOLDS: Record<ContentType, number> = {
  NOTE: 120,
  FLASHCARD: 60,
  EXAM: 180,
  EDIT: 90,
};

const FLUSH_INTERVAL_MS = 60_000;

type SessionOptions = {
  contentType: ContentType;
  setId?: number | null;
  todoId?: number | null;
};

export function useSessionTracker(opts: SessionOptions) {
  const { contentType, setId, todoId } = opts;
  const idleThreshold = IDLE_THRESHOLDS[contentType];

  const startTimestamp = useRef(new Date().toISOString());
  const activeDuration = useRef(0);
  const rawDuration = useRef(0);
  const itemsCount = useRef(0);
  const scoreRef = useRef<number | null>(null);
  const lastEventTime = useRef(Date.now());
  const hasFlushed = useRef(false);

  // While a Pomodoro focus block is running it logs the study time itself, so
  // the per-page tracker must not log too — otherwise the same minutes count
  // twice. Kept in a ref so timers/handlers read the latest value.
  const { engine } = usePomodoroContext();
  const focusRunning = engine.running && engine.type === "POMODORO";
  const focusRunningRef = useRef(focusRunning);
  useEffect(() => {
    focusRunningRef.current = focusRunning;
  }, [focusRunning]);

  const buildPayload = useCallback((): PendingPayload => ({
    contentType,
    setId: setId ?? null,
    todoId: todoId ?? null,
    activeDuration: Math.round(activeDuration.current),
    rawDuration: Math.round(rawDuration.current),
    score: scoreRef.current,
    itemsCount: itemsCount.current,
    clientTimestamp: startTimestamp.current,
  }), [contentType, setId, todoId]);

  const resetAccumulators = useCallback(() => {
    activeDuration.current = 0;
    rawDuration.current = 0;
    itemsCount.current = 0;
    startTimestamp.current = new Date().toISOString();
  }, []);

  const flush = useCallback(
    async (finalScore?: number) => {
      if (hasFlushed.current) return;
      // Pomodoro focus is logging this time slice; skip to avoid double counting.
      if (focusRunningRef.current) return;
      if (finalScore !== undefined) scoreRef.current = finalScore;

      const payload = buildPayload();
      if (payload.activeDuration < 30) return;

      hasFlushed.current = true;
      try {
        await activityLogAPI.logActivity(payload);
      } catch {
        savePending(payload);
      }
    },
    [buildPayload],
  );

  // Called from component handlers to signal an interaction
  const recordEvent = useCallback(() => {
    const now = Date.now();
    const gap = (now - lastEventTime.current) / 1000;
    rawDuration.current += gap;
    if (gap < idleThreshold) {
      activeDuration.current += gap;
    }
    lastEventTime.current = now;
  }, [idleThreshold]);

  // Called when user completes an interaction item (flip card, answer question)
  const recordItem = useCallback(() => {
    recordEvent();
    itemsCount.current += 1;
  }, [recordEvent]);

  useEffect(() => {
    // Retry any previously failed payloads on mount
    flushPending();

    const EVENTS = ["scroll", "keydown", "mousedown", "touchstart"] as const;
    const handler = () => recordEvent();
    EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }));

    const interval = setInterval(() => {
      // Discard time accrued while Pomodoro focus is running — it's logged there.
      if (focusRunningRef.current) {
        resetAccumulators();
        return;
      }
      if (!hasFlushed.current) {
        const payload = buildPayload();
        if (payload.activeDuration >= 30) {
          activityLogAPI.logActivity(payload).catch(() => savePending(payload));
          // Reset accumulators after periodic flush (don't mark as fully flushed)
          resetAccumulators();
        }
      }
    }, FLUSH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    const onBeforeUnload = () => {
      if (focusRunningRef.current) return;
      const payload = buildPayload();
      if (payload.activeDuration >= 30 && navigator.sendBeacon) {
        navigator.sendBeacon("/api/activity-log", JSON.stringify(payload));
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, handler));
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
      flush();
    };
  }, [flush, recordEvent, buildPayload, resetAccumulators]);

  return { recordEvent, recordItem, flush };
}
