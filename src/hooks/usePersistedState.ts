import { useCallback, useEffect, useState } from 'react';

function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Same API as `useState`, but the value is persisted to `localStorage` under
 * `key` and restored on mount. Falls back to `defaultValue` when storage is
 * unavailable, empty, or holds unparseable data (e.g. private browsing,
 * corrupted JSON from an older app version).
 *
 * Re-reads storage whenever `key` changes, so callers can scope persistence
 * per-entity (e.g. `` `notes-sort-${setId}` ``) even if the component isn't
 * remounted when navigating between entities.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => readStorage(key, defaultValue));

  useEffect(() => {
    setValue(readStorage(key, defaultValue));
    // Only re-sync when the storage key itself changes — re-running this on
    // every `defaultValue` identity change would clobber user selections.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setPersistedValue = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore (storage full / disabled)
      }
    },
    [key],
  );

  return [value, setPersistedValue];
}
