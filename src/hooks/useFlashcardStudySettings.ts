import { useCallback, useEffect, useState } from "react";

export type FlashcardStudySettings = {
  isFrontCardTerm: boolean;
  isProgressTrackingEnabled: boolean;
  autoFlipDelay: number | null; // seconds; null = disabled
  matchingCardCount: number; // number of cards used in the matching game
};

const STORAGE_KEY = "flashcard-study-settings";

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
    } catch {
      // ignore
    }
  }, [settings]);

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
