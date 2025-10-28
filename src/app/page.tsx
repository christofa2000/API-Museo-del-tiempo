"use client";

import ArtworkGrid from "@/app/components/ArtworkGrid";
import AudioPlayer from "@/app/components/AudioPlayer";
import MagicBento from "@/app/components/MagicBento";
import { artByDecade, searchRandomSongByDecade } from "@/lib/apis";
import { decadeSummaries } from "@/lib/decadeSummaries";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Song = Awaited<ReturnType<typeof searchRandomSongByDecade>>;
type Art = Awaited<ReturnType<typeof artByDecade>>;

const sectionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" } },
};

export default function Page() {
  const [decade, setDecade] = useState<number>(1980);
  const [loading, setLoading] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false);
  const [song, setSong] = useState<Song>(null);
  const [artworks, setArtworks] = useState<Art>([]);

  // ref del video del DeLorean
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1) Al montar: quedar pausado en el último frame (frame final) para usarlo como "poster"
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const showLastFrame = () => {
      // Ir al último frame disponible y pausar
      if (!isFinite(el.duration) || el.duration === 0) return;
      // Un pequeño epsilon evita que algunos navegadores no muestren el último fotograma
      el.currentTime = Math.max(el.duration - 0.05, 0);
      el.pause();
    };

    const onLoadedMeta = () => {
      showLastFrame();
    };

    el.addEventListener("loadedmetadata", onLoadedMeta);

    // Si ya está cargado al llegar aquí:
    if (el.readyState >= 1) showLastFrame();

    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMeta);
    };
  }, []);

  // 2) Al cambiar de década: reproducir 1 vez y volver a pausar en el último frame
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const showLastFrame = () => {
      if (!isFinite(el.duration) || el.duration === 0) return;
      el.currentTime = Math.max(el.duration - 0.05, 0);
      el.pause();
    };

    const handleEnded = () => {
      // Al terminar, quedarnos en el último frame (sin resetear al poster)
      showLastFrame();
    };

    el.removeEventListener("ended", handleEnded);
    el.addEventListener("ended", handleEnded);

    if (reduce) {
      // Si el usuario prefiere menos animación: nos quedamos en el frame final
      if (el.readyState >= 1) showLastFrame();
      else el.addEventListener("loadedmetadata", showLastFrame, { once: true });
      return () => el.removeEventListener("ended", handleEnded);
    }

    // Reproducir 1 vez desde el inicio
    const playOnce = () => {
      el.pause();
      el.currentTime = 0;
      // muted + playsInline ayuda con autoplay policies
      el.muted = true;
      // Aseguramos un repaint con requestAnimationFrame antes de play (evita glitches)
      requestAnimationFrame(() => {
        el.play().catch(() => {
          // Si el autoplay es bloqueado, al menos quedamos en el frame final
          showLastFrame();
        });
      });
    };

    if (el.readyState >= 1) playOnce();
    else el.addEventListener("loadedmetadata", playOnce, { once: true });

    return () => {
      el.removeEventListener("ended", handleEnded);
    };
  }, [decade]);

  // carga por década (canción + obras)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [s, arts] = await Promise.all([
          searchRandomSongByDecade(decade),
          artByDecade(decade),
        ]);
        if (!mounted) return;
        setSong(s);
        setArtworks(arts);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [decade]);

  // re-sortear canción
  async function rerollSong() {
    try {
      setLoadingSong(true);
      const s = await searchRandomSongByDecade(decade);
      setSong(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSong(false);
    }
  }

  return (
    <section className="space-y-12 py-8 w-full overflow-x-hidden">
      {/* ======= HERO con DeLorean a la derecha ======= */}
      <motion.header
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Izquierda: título + bajada + Cards de décadas */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-balance">
                🕰️ Museo del Tiempo
              </h1>
              <p className="max-w-3xl text-lg text-white/80 leading-relaxed text-balance">
                Del vinilo al pixel: elegí una época y descubrí su banda sonora,
                sus obras icónicas y el contexto que la definió
              </p>
            </div>
            {/* Magic Bento para seleccionar década */}
            <MagicBento
              cards={[1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010].map(
                (year) => ({
                  id: `decade-${year}`,
                  title: "",
                  year: year,
                  gradient:
                    year === decade
                      ? "from-cosmic-500/40 to-purple-600/40"
                      : "from-violet-500/10 to-purple-600/10",
                  icon:
                    year === 1940
                      ? "✈️"
                      : year === 1950
                      ? "🎸"
                      : year === 1960
                      ? "✌️"
                      : year === 1970
                      ? "🎤"
                      : year === 1980
                      ? "🎮"
                      : year === 1990
                      ? "🌐"
                      : year === 2000
                      ? "📱"
                      : "🚀",
                  className:
                    year === decade
                      ? "ring-2 ring-cosmic-500/50 scale-105"
                      : "",
                  content: (
                    <div className="flex flex-col items-center justify-center h-full gap-1">
                      <div className="text-3xl">
                        {year === 1940
                          ? "✈️"
                          : year === 1950
                          ? "🎸"
                          : year === 1960
                          ? "✌️"
                          : year === 1970
                          ? "🎤"
                          : year === 1980
                          ? "🎮"
                          : year === 1990
                          ? "🌐"
                          : year === 2000
                          ? "📱"
                          : "🚀"}
                      </div>
                      <div className="text-sm font-bold text-white">{year}</div>
                    </div>
                  ),
                })
              )}
              onCardClick={(card) => {
                const year = card.year;
                if (year) setDecade(year);
              }}
              columns={{ base: 2, sm: 4, lg: 4 }}
            />
          </div>

          {/* Derecha: Video controlado (quieto por defecto, 1 reproducción por cambio) */}
          <div className="relative mx-auto md:mx-0 w-full max-w-[520px]">
            {/* Contenedor con tamaño fijo para evitar saltos de layout */}
            <div className="h-[260px] md:h-[300px] w-full rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-xl shadow-violet-500/20 bg-black/20 backdrop-blur">
              <video
                ref={videoRef}
                playsInline
                preload="auto"
                // mantenemos tamaño controlado; el video se contiene dentro del alto fijo
                className="h-full w-full object-contain"
                // debug opcional:
                // onError={(e) => console.error("Video error:", e.currentTarget.error)}
              >
                <source src="/delorean.mp4" type="video/mp4" />
                Tu navegador no soporta video HTML5.
              </video>
            </div>

            {/* Glow sutil detrás */}
            <div
              className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-30"
              style={{
                background:
                  "radial-gradient(40% 40% at 70% 50%, rgba(139,92,246,0.6), transparent 70%)",
              }}
            />
          </div>
        </div>
      </motion.header>

      {loading ? (
        <motion.div
          className="rounded-2xl glass p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-cosmic-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/80 font-medium">
            Cargando contenido de los {decade}s...
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {/* key por década para montar/desmontar con animación */}
          <motion.div
            key={decade}
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            {/* 🎵 Música */}
            <section id="musica" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">
                  Canción aleatoria de los {decade}s
                </h2>
                <motion.button
                  onClick={rerollSong}
                  disabled={loadingSong}
                  className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:glass-2 focus-ring transition-all duration-200 disabled:opacity-50"
                  aria-busy={loadingSong}
                  aria-label="Otra canción"
                  title="Otra canción"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loadingSong ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      <span>Buscando…</span>
                    </>
                  ) : (
                    <>
                      <span>🎲</span>
                      <span>Otra canción</span>
                    </>
                  )}
                </motion.button>
              </div>

              {song ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <AudioPlayer
                    src={song.previewUrl ?? undefined}
                    title={song.trackName}
                    artist={song.artistName}
                    artUrl={song.artworkUrl100?.replace("100x100", "300x300")}
                  />
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    {song.country && (
                      <span className="flex items-center gap-1">
                        <span>🌍</span>
                        <span>País: {song.country}</span>
                      </span>
                    )}
                    {song.year && (
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>Año: {song.year}</span>
                      </span>
                    )}
                    {song.primaryGenreName && (
                      <span className="flex items-center gap-1">
                        <span>🎼</span>
                        <span>Género: {song.primaryGenreName}</span>
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="rounded-2xl glass p-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-white/80 font-medium">
                    No se encontró una canción para esta década.
                  </p>
                </motion.div>
              )}
            </section>

            {/* 📜 Contexto histórico */}
            <section id="historia" className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                Contexto histórico
              </h2>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="rounded-2xl glass p-6"
              >
                <p className="text-base leading-relaxed text-white/90 text-balance">
                  {decadeSummaries[decade] ??
                    "Información no disponible para esta década."}
                </p>
              </motion.div>
            </section>

            {/* 🖼️ Arte */}
            <section id="arte" className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Obras icónicas</h2>
              <ArtworkGrid items={artworks} />
            </section>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
