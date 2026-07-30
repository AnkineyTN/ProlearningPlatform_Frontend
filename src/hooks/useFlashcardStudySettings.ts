import { useCallback, useEffect, useState } from "react";

export type FlashcardStudySettings = {
  isFrontCardTerm: boolean;
  isProgressTrackingEnabled: boolean;
  autoFlipDelay: number | null; // seconds; null = disabled
  matchingCardCount: number; // number of cards used in the matching game
};

const STORAGE_KEY = "flashcard-study-settings";
const SETTINGS_CHANGED_EVENT = "flashcard-study-settings-changed";

const DEFAULTS: FlashcardStudySettings = {
  isFrontCardTerm: true,
  isProgressTrackingEnabled: true,
  autoFlipDelay: null,
  matchingCardCount: 6,
};

function read(): FlashcardStudySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<FlashcardStudySettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function useFlashcardStudySettings() {
  const [settings, setSettings] = useState<FlashcardStudySettings>(() => read());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    const syncSettings = () => {
      const next = read();
      setSettings((current) =>
        JSON.stringify(current) === JSON.stringify(next) ? current : next,
      );
    };
    window.addEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  const setIsFrontCardTerm = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, isFrontCardTerm: v }));
  }, []);

  const setIsProgressTrackingEnabled = useCallback((v: boolean) => {
    setSettings((s) => ({ ...s, isProgressTrackingEnabled: v }));
  }, []);

  const setAutoFlipDelay = useCallback((v: number | null) => {
    setSettings((s) => ({ ...s, autoFlipDelay: v }));
  }, []);

  const setMatchingCardCount = useCallback((v: number) => {
    setSettings((s) => ({ ...s, matchingCardCount: v }));
  }, []);

  return {
    ...settings,
    setIsFrontCardTerm,
    setIsProgressTrackingEnabled,
    setAutoFlipDelay,
    setMatchingCardCount,
  };
}
