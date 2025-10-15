"use client";

import { motion } from "framer-motion";
import { BookOpen, Clock, Image as ImageIcon, Music } from "lucide-react";
import { useEffect, useState } from "react";

const nav = [
  { href: "#musica", label: "Música", icon: Music },
  { href: "#historia", label: "Historia", icon: BookOpen },
  { href: "#arte", label: "Arte", icon: ImageIcon },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Detectar sección activa basada en scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = nav.map((item) => item.href.slice(1));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(`#${section}`);
            return;
          }
        }
      }
      setActiveSection(null);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // estado inicial
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 header-electric glass border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + icono estático */}
          <motion.a
            href="#"
            className="group inline-flex items-center gap-3 focus-ring rounded-xl p-2 -m-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icono estático (sin Date, sin efectos de hidratación) */}
            <div className="relative">
              <Clock aria-hidden className="w-7 h-7 text-white/80" />
              {/* halo suave para integración cosmic */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full shadow-[0_0_10px_rgba(124,107,255,0.25)]"
              />
            </div>

            <span className="text-lg font-bold tracking-tight text-white">
              Museo
            </span>
            <span className="rounded-full bg-cosmic-500/20 px-3 py-1 text-sm font-semibold text-cosmic-300 ring-1 ring-cosmic-500/30 group-hover:bg-cosmic-500/30 group-hover:ring-cosmic-500/50 transition-all duration-200">
              del Tiempo
            </span>
          </motion.a>

          {/* Navegación */}
          <nav className="hidden gap-2 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.href;

              return (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-ring ${
                    isActive
                      ? "text-white bg-cosmic-500/20 ring-1 ring-cosmic-500/30"
                      : "text-white/80 hover:text-white bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-cosmic-500/10"
                      layoutId="activeNav"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.a>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
