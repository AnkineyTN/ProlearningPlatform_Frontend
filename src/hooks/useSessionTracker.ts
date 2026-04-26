import { useEffect, useRef, useCallback } from "react";
import type { ContentType } from "@/services/types/activityLog.types";
import { activityLogAPI } from "@/services/endpoints/activityLog";

const IDLE_THRESHOLDS: Record<ContentType, number> = {
  NOTE: 120,
  FLASHCARD: 60,
  EXAM: 180,
  EDIT: 90,
};

const FLUSH_INTERVAL_MS = 60_000;
const PENDING_KEY = "pendingActivity";

type SessionOptions = {
  contentType: ContentType;
  setId?: number | null;
  todoId?: number | null;
};

type PendingPayload = {
  contentType: ContentType;
  setId?: number | null;
  todoId?: number | null;
  activeDuration: number;
  rawDuration: number;
  score?: number | null;
  itemsCount: number;
  clientTimestamp: string;
};

function savePending(payload: PendingPayload) {
  try {
    const existing: PendingPayload[] = JSON.parse(
      localStorage.getItem(PENDING_KEY) ?? "[]",
    );
    existing.push(payload);
    localStorage.setItem(PENDING_KEY, JSON.stringify(existing));
  } catch {
    // ignore storage errors
  }
}

async function flushPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const pending: PendingPayload[] = JSON.parse(raw);
    if (pending.length === 0) return;
    localStorage.removeItem(PENDING_KEY);
    await Promise.allSettled(pending.map((p) => activityLogAPI.logActivity(p)));
  } catch {
    // ignore
  }
}

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

  const flush = useCallback(
    async (finalScore?: number) => {
      if (hasFlushed.current) return;
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
      if (!hasFlushed.current) {
        const payload = buildPayload();
        if (payload.activeDuration >= 30) {
          activityLogAPI.logActivity(payload).catch(() => savePending(payload));
          // Reset accumulators after periodic flush (don't mark as fully flushed)
          activeDuration.current = 0;
          rawDuration.current = 0;
          itemsCount.current = 0;
          startTimestamp.current = new Date().toISOString();
        }
      }
    }, FLUSH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    const onBeforeUnload = () => {
      const payload = buildPayload();
      if (payload.activeDuration >= 30) {
        navigator.sendBeacon &&
          navigator.sendBeacon(
            "/api/activity-log",
            JSON.stringify(payload),
          );
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
  }, [flush, recordEvent, buildPayload]);

  return { recordEvent, recordItem, flush };
}
