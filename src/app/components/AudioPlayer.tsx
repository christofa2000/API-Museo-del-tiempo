"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  src?: string | null;
  title?: string;
  artist?: string;
  artUrl?: string;
};

export default function AudioPlayer({ src, title, artist, artUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Detener si cambia el src
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setPlaying(false);
    }
  }, [src]);

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">
      {artUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artUrl}
          alt={title ?? "artwork"}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/10" />
      )}

      <div className="flex-1">
        <div className="text-sm opacity-80">{artist ?? "—"}</div>
        <div className="font-medium">{title ?? "Sin pista"}</div>
        <audio ref={audioRef} src={src ?? undefined} preload="none" />
      </div>

      <button
        disabled={!src}
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          if (playing) {
            el.pause();
            setPlaying(false);
          } else {
            el.play();
            setPlaying(true);
          }
        }}
        className="rounded-full bg-cosmic-500/90 p-3 transition hover:bg-cosmic-500 disabled:opacity-50"
        aria-label={playing ? "Pausar" : "Reproducir"}
      >
        {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </div>
  );
}
