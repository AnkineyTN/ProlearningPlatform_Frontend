import { isAxiosError } from 'axios';

const STALE_DAYS = 30;
export const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

export type AccuracyBand = 'strong' | 'medium' | 'weak';

export function bandFor(accuracy: number): AccuracyBand {
  if (accuracy >= 0.75) return 'strong';
  if (accuracy >= 0.5) return 'medium';
  return 'weak';
}

export function bandColors(band: AccuracyBand) {
  switch (band) {
    case 'strong':
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'medium':
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
      };
    case 'weak':
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
      };
  }
}

export function extractApiMessage(error: unknown): string | null {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? null;
  }
  return null;
}

export function isNoTopicsError(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;
  const msg = extractApiMessage(error)?.toLowerCase() ?? '';
  return msg.includes('topic');
}

export function isSetEmptyError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 400;
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}
