"use client";

import ArtworkGrid from "@/app/components/ArtworkGrid";
import AudioPlayer from "@/app/components/AudioPlayer";
import DecadePicker from "@/app/components/DecadePicker";
import {
  artByDecade,
  searchRandomSongByDecade,
  wikipediaSummary,
} from "@/lib/apis";
import { useEffect, useState } from "react";

type Wiki = { title: string; extract: string; url?: string };
type Song = Awaited<ReturnType<typeof searchRandomSongByDecade>>;
type Art = Awaited<ReturnType<typeof artByDecade>>;

export default function Page() {
  const [decade, setDecade] = useState<number>(1980);
  const [loading, setLoading] = useState(false);
  const [loadingSong, setLoadingSong] = useState(false); // 👈 para el botón
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [song, setSong] = useState<Song>(null);
  const [artworks, setArtworks] = useState<Art>([]);

  // carga inicial por década
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [w, s, arts] = await Promise.all([
          wikipediaSummary(`${decade}s`),
          searchRandomSongByDecade(decade),
          artByDecade(decade),
        ]);
        if (!mounted) return;
        setWiki(w);
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

  // handler para re-sortear canción
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
    <section className="space-y-8">
      <header className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Museo del Tiempo
        </h1>
        <p className="max-w-2xl opacity-80">
          Explorá arte, historia y música según la década. Elegí un período y
          disfrutá una experiencia audiovisual curada automáticamente.
        </p>
        <DecadePicker value={decade} onChange={setDecade} />
      </header>

      {loading ? (
        <div className="rounded-xl bg-white/10 p-6 text-sm opacity-80">
          Cargando…
        </div>
      ) : (
        <>
          {/* 🎵 Música */}
          <section id="musica" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">
                Canción aleatoria de los {decade}s
              </h2>
              <button
                onClick={rerollSong}
                disabled={loadingSong}
                className="rounded-full px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 ring-1 ring-white/10 hover:ring-white/20 transition disabled:opacity-50"
                aria-busy={loadingSong}
                aria-label="Otra canción"
                title="Otra canción"
              >
                {loadingSong ? "Buscando…" : "🎲 Otra canción"}
              </button>
            </div>

            {song ? (
              <div className="rounded-xl bg-white/10 p-4">
                <AudioPlayer
                  src={song.previewUrl ?? undefined}
                  title={song.trackName}
                  artist={song.artistName}
                  artUrl={song.artworkUrl100?.replace("100x100", "300x300")}
                />
                <div className="mt-2 text-xs opacity-70">
                  {song.country ? `🌍 País: ${song.country}` : null}
                  {song.year ? ` · 📅 Año: ${song.year}` : null}
                  {song.primaryGenreName
                    ? ` · 🎼 Género: ${song.primaryGenreName}`
                    : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-white/10 p-4 text-sm opacity-80">
                No se encontró una canción para esta década.
              </div>
            )}
          </section>

          {/* 📜 Historia */}
          <section id="historia" className="space-y-3">
            <h2 className="text-xl font-semibold">Contexto histórico</h2>
            {wiki ? (
              <div className="rounded-xl bg-white/10 p-4">
                <h3 className="font-medium">{wiki.title}</h3>
                <p className="mt-1 text-sm opacity-85">{wiki.extract}</p>
                {wiki.url && (
                  <a
                    className="mt-2 inline-block text-sm text-cosmic-300 underline"
                    href={wiki.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver más en Wikipedia
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-white/10 p-4 text-sm opacity-80">
                No se encontró resumen para esta década.
              </div>
            )}
          </section>

          {/* 🖼️ Arte */}
          <section id="arte" className="space-y-3">
            <h2 className="text-xl font-semibold">Obras icónicas</h2>
            <ArtworkGrid items={artworks} />
          </section>
        </>
      )}
    </section>
  );
}
