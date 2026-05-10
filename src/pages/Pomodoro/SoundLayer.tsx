import { useEffect, useRef } from "react";
import type { ActiveSound } from "@/contexts/PomodoroContext";

interface Props {
  activeSounds: ActiveSound[];
}

const SoundLayer = ({ activeSounds }: Props) => (
  <>
    {activeSounds.map(({ sound, volume, paused }) => (
      <AudioTrack key={sound.id} src={sound.assetUrl} volume={volume} paused={paused} />
    ))}
  </>
);

// One stable component per sound — only mounts/unmounts when a sound is added/removed.
const AudioTrack = ({ src, volume, paused }: { src: string; volume: number; paused?: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play/pause based on the paused prop; also pause on unmount.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (paused) {
      el.pause();
    } else {
      el.play().catch(() => {});
    }
    return () => {
      el.pause();
    };
  }, [paused]);

  // Sync volume without restarting.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return <audio ref={audioRef} src={src} loop preload="auto" />;
};

export default SoundLayer;
