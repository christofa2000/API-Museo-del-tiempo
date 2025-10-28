"use client";

import { motion } from "framer-motion";
import { Pause, Play, Volume2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    // Detener si cambia el src
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setPlaying(false);
      setCurrentTime(0);
    }
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
    };
  }, []);

  const handlePlayPause = async () => {
    const el = audioRef.current;
    if (!el) return;

    // Marcar que el usuario ha interactuado (requerido para Safari/iPhone)
    if (!userInteracted) {
      setUserInteracted(true);
    }

    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        // Para Safari/iPhone: requerir interacción del usuario antes de reproducir
        await el.play();
        setPlaying(true);
      } catch (error) {
        console.warn("Error al reproducir audio:", error);
        // En caso de error (autoplay bloqueado), mostrar mensaje al usuario
        setPlaying(false);
      }
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className="relative flex items-center gap-4 rounded-xl glass p-4 w-full min-w-0 group overflow-hidden border-2 border-white/10 group-hover:border-white/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>

      {/* Glow effect mejorado - mucho más violeta */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-80 blur-2xl transition-opacity duration-300 pointer-events-none rounded-xl z-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124,107,255,0.8), rgba(156,99,206,0.4), transparent)",
        }}
      />

      {/* Glow adicional */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-60 blur-3xl transition-opacity duration-300 pointer-events-none rounded-xl z-0"
        style={{
          background:
            "radial-gradient(circle at center, var(--color-cosmic-400), transparent)",
        }}
      />

      <div className="relative z-10 flex items-center gap-4 w-full min-w-0">
        {/* Artwork */}
        <div className="relative">
          {artUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artUrl}
              alt={title ?? "artwork"}
              className="w-16 h-16 rounded-xl object-cover shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cosmic-500/20 to-cosmic-600/20 flex items-center justify-center">
              <Volume2 className="w-6 h-6 text-cosmic-300" />
            </div>
          )}
          {playing && (
            <motion.div
              className="absolute inset-0 rounded-xl bg-cosmic-500/20"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white/70 truncate">{artist ?? "—"}</div>
          <div className="font-semibold text-white truncate">
            {title ?? "Sin pista"}
          </div>

          {/* Barra de progreso */}
          {src && duration > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cosmic-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>
                  {Math.floor(currentTime / 60)}:
                  {(currentTime % 60).toFixed(0).padStart(2, "0")}
                </span>
                <span>
                  {Math.floor(duration / 60)}:
                  {(duration % 60).toFixed(0).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}

          <audio
            ref={audioRef}
            src={src ?? undefined}
            preload="none"
            playsInline
            controls={false}
            webkit-playsinline="true"
          />
        </div>

        {/* Botón de play/pause */}
        <motion.button
          disabled={!src || loading}
          onClick={handlePlayPause}
          className="rounded-full bg-cosmic-500 p-3 transition-all duration-200 hover:bg-cosmic-600 disabled:opacity-50 disabled:cursor-not-allowed focus-ring shadow-[var(--glow)]"
          aria-label={playing ? "Pausar" : "Reproducir"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : playing ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
