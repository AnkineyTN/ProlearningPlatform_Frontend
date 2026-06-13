import { activityLogAPI } from "./endpoints/activityLog";
import type { ActivityLogRequest } from "./types/activityLog.types";

const PENDING_KEY = "pendingActivity";

export type PendingPayload = ActivityLogRequest;

export function savePending(payload: PendingPayload) {
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

export async function flushPending() {
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

// Fire-and-forget a single activity log; queue it for retry if the request fails.
export async function logActivityOnce(payload: PendingPayload) {
  try {
    await activityLogAPI.logActivity(payload);
  } catch {
    savePending(payload);
  }
}
