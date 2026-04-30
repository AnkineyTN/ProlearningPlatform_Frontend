import { useEffect, useRef } from "react";
import type { SoundDto } from "@/services/types/pomodoro.types";

export interface ActiveSound {
  sound: SoundDto;
  volume: number;
}

interface Props {
  activeSounds: ActiveSound[];
  paused: boolean;
}

const SoundLayer = ({ activeSounds, paused }: Props) => {
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());

  useEffect(() => {
    // Drop refs for sounds removed from the active list.
    const activeIds = new Set(activeSounds.map((a) => a.sound.id));
    audioRefs.current.forEach((el, id) => {
      if (!activeIds.has(id)) {
        el.pause();
        audioRefs.current.delete(id);
      }
    });
  }, [activeSounds]);

  useEffect(() => {
    audioRefs.current.forEach((el) => {
      if (paused) {
        el.pause();
      } else if (el.paused) {
        el.play().catch(() => {});
      }
    });
  }, [paused, activeSounds]);

  return (
    <>
      {activeSounds.map(({ sound, volume }) => (
        <audio
          key={sound.id}
          ref={(el) => {
            if (!el) return;
            audioRefs.current.set(sound.id, el);
            el.volume = volume;
            if (!paused && el.paused) {
              el.play().catch(() => {});
            }
          }}
          src={sound.assetUrl}
          loop
          preload="auto"
          // The volume prop here only sets initial volume — keep ref updated below.
        />
      ))}
      <VolumeSync activeSounds={activeSounds} audioRefs={audioRefs} />
    </>
  );
};

const VolumeSync = ({
  activeSounds,
  audioRefs,
}: {
  activeSounds: ActiveSound[];
  audioRefs: React.MutableRefObject<Map<number, HTMLAudioElement>>;
}) => {
  useEffect(() => {
    activeSounds.forEach(({ sound, volume }) => {
      const el = audioRefs.current.get(sound.id);
      if (el) el.volume = volume;
    });
  }, [activeSounds, audioRefs]);
  return null;
};

export default SoundLayer;
