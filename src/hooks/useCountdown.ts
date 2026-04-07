import { useEffect, useMemo, useState } from "react";

type Options = {
  seconds: number;
  autoStart?: boolean;
};

export function useCountdown({ seconds, autoStart = true }: Options) {
  const [remaining, setRemaining] = useState(seconds);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) return;
    if (remaining <= 0) return;

    const id = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    return () => window.clearInterval(id);
  }, [isRunning, remaining]);

  const api = useMemo(
    () => ({
      remaining,
      isRunning,
      isDone: remaining <= 0,
      start: () => setIsRunning(true),
      stop: () => setIsRunning(false),
      reset: (nextSeconds?: number) => {
        setRemaining(typeof nextSeconds === "number" ? nextSeconds : seconds);
        setIsRunning(true);
      },
      format: () => {
        const mm = Math.floor(remaining / 60)
          .toString()
          .padStart(2, "0");
        const ss = (remaining % 60).toString().padStart(2, "0");
        return `${mm}:${ss}`;
      },
    }),
    [isRunning, remaining, seconds],
  );

  return api;
}

