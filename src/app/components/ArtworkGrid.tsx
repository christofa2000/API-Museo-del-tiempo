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

        {/* Botón de mezcla aleatoria mejorado */}
        <motion.button
          type="button"
          onClick={reshuffle}
          className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:glass-2 focus-ring transition-all duration-200"
          aria-label="Mostrar otras obras al azar"
          title="Mostrar otras obras al azar"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Shuffle className="w-4 h-4" />
          <span>🎲 Otras obras</span>
        </motion.button>
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
              className="group overflow-hidden rounded-2xl glass hover:glass-2 transition-all duration-300"
            >
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSelectedIndex(idx);
                }}
                className="block w-full text-left focus-ring rounded-2xl"
                aria-label={`Ver en grande: ${a.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image ?? "/placeholder.png"}
                    alt={a.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Overlay para mejor legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 font-semibold text-white group-hover:text-white transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-sm text-white/70 line-clamp-1">
                    {a.artist ?? "Artista desconocido"}
                  </p>
                  <p className="text-xs text-white/50">{a.date}</p>
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
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div
                className="relative w-full max-w-6xl overflow-hidden rounded-3xl glass-2 shadow-[var(--glow-lg)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón cerrar mejorado */}
                <motion.button
                  onClick={() => setSelectedIndex(null)}
                  className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full glass hover:glass-2 focus-ring transition-all duration-200"
                  aria-label="Cerrar"
                  title="Cerrar (Escape)"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Flechas mejoradas */}
                {count > 1 && (
                  <>
                    <motion.button
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full glass hover:glass-2 focus-ring transition-all duration-200"
                      aria-label="Anterior"
                      title="Anterior (←)"
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      onClick={goNext}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full glass hover:glass-2 focus-ring transition-all duration-200"
                      aria-label="Siguiente"
                      title="Siguiente (→)"
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </motion.button>
                  </>
                )}

                <div className="grid gap-0 md:grid-cols-2">
                  {/* Imagen grande */}
                  <div className="relative bg-gradient-to-br from-cosmic-900/50 to-cosmic-800/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selected.image ?? "/placeholder.png"}
                      alt={selected.title}
                      className="h-full w-full max-h-[80vh] object-contain p-4"
                      loading="lazy"
                    />
                  </div>

                  {/* Información de la obra mejorada */}
                  <div className="space-y-4 p-6 md:p-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {selected.title}
                      </h3>
                      <p className="text-lg text-white/80 font-medium">
                        {selected.artist ?? "Artista desconocido"}
                      </p>
                      <p className="text-sm text-white/60 font-mono">
                        {selected.date}
                      </p>
                    </div>

                    {selected.description && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-sm leading-relaxed text-white/85 text-balance">
                          {selected.description}
                        </p>
                      </div>
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
