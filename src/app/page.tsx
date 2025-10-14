"use client";

import ArtworkGrid from "@/app/components/ArtworkGrid";
import AudioPlayer from "@/app/components/AudioPlayer";
import DecadePicker from "@/app/components/DecadePicker";
import { artByDecade, searchRandomSongByDecade } from "@/lib/apis";
import { decadeSummaries } from "@/lib/decadeSummaries";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
    <section className="space-y-12 py-8">
      <motion.header
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white text-balance">
            Museo del Tiempo
          </h1>
          <p className="max-w-3xl text-lg text-white/80 leading-relaxed text-balance">
            Explorá arte, historia y música según la década. Elegí un período y
            disfrutá una experiencia audiovisual curada automáticamente.
          </p>
        </div>
        <DecadePicker value={decade} onChange={setDecade} />
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

            {/* 📜 Contexto histórico (resumen corto local) */}
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
