"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Artwork = {
  id: number;
  title: string;
  artist: string | null;
  date: string;
  image: string | null;
  description?: string | null;
};

const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Utilidad: sampleo aleatorio sin repetir
function sampleRandom<T>(arr: T[], size: number): T[] {
  if (size >= arr.length) {
    // shuffle completo si piden más o igual que el total
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }
  const picked = new Set<number>();
  const res: T[] = [];
  while (res.length < size && picked.size < arr.length) {
    const idx = Math.floor(Math.random() * arr.length);
    if (!picked.has(idx)) {
      picked.add(idx);
      res.push(arr[idx]);
    }
  }
  return res;
}

export default function ArtworkGrid({
  items,
  maxItems = 6, // <- cantidad máxima a mostrar por mezcla
}: {
  items: Artwork[];
  maxItems?: number;
}) {
  const [displayed, setDisplayed] = useState<Artwork[]>(
    sampleRandom(items, Math.max(1, maxItems))
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mixKey, setMixKey] = useState(0); // fuerza re-animación al mezclar

  // Cuando cambia la década (items), resetea: nuevo sampleo y cierra modal
  useEffect(() => {
    setDisplayed(sampleRandom(items, Math.max(1, maxItems)));
    setSelectedIndex(null);
    setMixKey((k) => k + 1);
  }, [items, maxItems]);

  const count = useMemo(() => displayed.length, [displayed]);
  const selected = selectedIndex !== null ? displayed[selectedIndex] : null;

  const goPrev = useCallback(() => {
    if (count === 0 || selectedIndex === null) return;
    setSelectedIndex((i) => (i! - 1 + count) % count);
  }, [count, selectedIndex]);

  const goNext = useCallback(() => {
    if (count === 0 || selectedIndex === null) return;
    setSelectedIndex((i) => (i! + 1) % count);
  }, [count, selectedIndex]);

  // Mezclar/remezclar obras visibles
  const reshuffle = useCallback(() => {
    setDisplayed(sampleRandom(items, Math.max(1, maxItems)));
    setSelectedIndex(null);
    setMixKey((k) => k + 1);
  }, [items, maxItems]);

  // Teclado: Escape para cerrar, flechas para navegar
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, goPrev, goNext]);

  // Evita scroll del body cuando modal activo
  useEffect(() => {
    if (selectedIndex !== null) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selectedIndex]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm opacity-80">
          Mostrando {count} obras{" "}
          {items.length > count ? `(de ${items.length})` : ""}
        </p>

        {/* Botón de mezcla aleatoria */}
        <button
          type="button"
          onClick={reshuffle}
          className="
            inline-flex items-center gap-2 rounded-lg
            border border-white/15 bg-white/10 px-3 py-2 text-sm
            ring-1 ring-white/10 transition hover:bg-white/20
            focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40
          "
          aria-label="Mostrar otras obras al azar"
          title="Mostrar otras obras al azar"
        >
          <Shuffle size={16} />
          🎲 Otras obras
        </button>
      </div>

      <ul
        key={mixKey} // re-render para animar set
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {displayed.map((a, idx) => (
            <motion.li
              key={a.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedIndex(idx);
                }}
                className="block w-full text-left"
                aria-label={`Ver en grande: ${a.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.image ?? "/placeholder.png"}
                  alt={a.title}
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="space-y-1 p-3">
                  <h3 className="line-clamp-1 font-semibold">{a.title}</h3>
                  <p className="text-sm opacity-80">
                    {a.artist ?? "Artista desconocido"}
                  </p>
                  <p className="text-xs opacity-60">{a.date}</p>
                </div>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Modal / Lightbox */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Overlay para cerrar al click afuera */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIndex(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 grid place-items-center p-4"
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18 }}
            >
              <div
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b17]/95 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón cerrar */}
                <button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <X size={18} />
                </button>

                {/* Flechas si hay más de una obra */}
                {count > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
                      aria-label="Anterior"
                      title="Anterior (←)"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 hover:bg-white/20"
                      aria-label="Siguiente"
                      title="Siguiente (→)"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                <div className="grid gap-0 md:grid-cols-2">
                  {/* Imagen grande */}
                  <div className="relative bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.image ?? "/placeholder.png"}
                      alt={selected.title}
                      className="h-full w-full max-h-[80vh] object-contain"
                    />
                  </div>

                  {/* Información de la obra */}
                  <div className="space-y-3 p-5 md:p-6">
                    <h3 className="text-xl font-semibold">{selected.title}</h3>
                    <p className="text-sm opacity-80">
                      {selected.artist ?? "Artista desconocido"}
                    </p>
                    <p className="text-xs opacity-60">{selected.date}</p>

                    {selected.description && (
                      <p className="pt-2 text-sm leading-relaxed text-white/85">
                        {selected.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
