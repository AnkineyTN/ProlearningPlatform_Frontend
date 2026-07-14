import axios from 'axios';
import type { ApiErrorResponse } from '@/services/types/auth.types';

export type ExtractedApiError = {
  /** Backend `metadata.code`, e.g. 'ACCOUNT_BLOCKED', 'EMAIL_NOT_VERIFIED'. */
  code?: string;
  /** Human-readable message from the backend, if any. */
  message?: string;
  /** HTTP status code, if a response was received. */
  status?: number;
  /** True when the request never reached the server (offline, CORS, timeout). */
  isNetwork: boolean;
};

/**
 * Normalises any thrown value from an Axios call into a predictable shape so
 * callers can branch on `code` / `status` and fall back to the backend
 * `message` instead of showing a single hardcoded error.
 */
export function getApiError(err: unknown): ExtractedApiError {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data as ApiErrorResponse | undefined;
    return {
      code: payload?.metadata?.code,
      message:
        typeof payload?.message === 'string' && payload.message.trim()
          ? payload.message
          : undefined,
      status: err.response?.status,
      isNetwork: !err.response,
    };
  }
  return { isNetwork: false };
}

/**
 * Cleans up a raw backend message for display: turns a leading field-name
 * prefix into a readable subject instead of discarding it (e.g. "title: must
 * not be blank" → "Title must not be blank") and capitalises the first letter.
 */
export function prettifyApiMessage(msg?: string): string | undefined {
  if (!msg) return undefined;
  const trimmed = msg.trim();
  if (!trimmed) return undefined;

  const fieldMatch = trimmed.match(/^([\w]+(?:\.[\w]+)*):\s*(.+)$/);
  if (fieldMatch) {
    const [, field, rest] = fieldMatch;
    const fieldName = field.split('.').pop() ?? field;
    const capitalizedField =
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    return `${capitalizedField} ${rest.trim()}`;
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Resolves the message to show the user for a failed API call: the cleaned-up
 * backend message when the server sent one, otherwise the provided localized
 * fallback. Use this for `toast.error(...)` in catch blocks / mutation
 * `onError` so real backend errors surface instead of a single generic string.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const { message } = getApiError(err);
  return prettifyApiMessage(message) ?? fallback;
}
