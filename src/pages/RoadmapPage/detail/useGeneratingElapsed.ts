import { createContext, useContext, useEffect, useRef, useState } from 'react';

import type { Roadmap } from '@/services/types/roadmap.types';

export const SLOW_GENERATING_THRESHOLD_SEC = 120;

export const GeneratingContext = createContext<Map<number, number>>(new Map());

export const useTopicElapsed = (topicId: number) =>
  useContext(GeneratingContext).get(topicId) ?? 0;

export const useGeneratingTracker = (roadmap?: Roadmap) => {
  const startsRef = useRef<Map<number, number>>(new Map());
  const [, setTick] = useState(0);

  const generatingIds: number[] = [];
  if (roadmap) {
    for (const chapter of roadmap.chapters) {
      for (const topic of chapter.topics) {
        if (topic.contentStatus === 'GENERATING') generatingIds.push(topic.id);
      }
    }
  }

  useEffect(() => {
    const map = startsRef.current;
    const seen = new Set(generatingIds);
    const now = Date.now();
    for (const id of seen) {
      if (!map.has(id)) map.set(id, now);
    }
    for (const id of Array.from(map.keys())) {
      if (!seen.has(id)) map.delete(id);
    }
  }, [generatingIds.join(',')]);

  useEffect(() => {
    if (generatingIds.length === 0) return;
    const id = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(id);
  }, [generatingIds.length === 0]);

  const elapsed = new Map<number, number>();
  const now = Date.now();
  for (const [topicId, start] of startsRef.current) {
    elapsed.set(topicId, Math.floor((now - start) / 1000));
  }
  return elapsed;
};
