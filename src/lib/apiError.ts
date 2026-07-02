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
 * Cleans up a raw backend message for display: strips a leading field-name
 * prefix (e.g. "email: must be a well-formed email address" → "must be a
 * well-formed email address") and capitalises the first letter.
 */
export function prettifyApiMessage(msg?: string): string | undefined {
  if (!msg) return undefined;
  const withoutPrefix = msg.replace(/^\s*[\w.]+:\s*/, '').trim();
  const cleaned = withoutPrefix || msg.trim();
  if (!cleaned) return undefined;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
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
