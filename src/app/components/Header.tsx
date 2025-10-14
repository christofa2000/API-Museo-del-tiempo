"use client";

import { BookOpen, Github, Image as ImageIcon, Music } from "lucide-react";

const nav = [
  { href: "#musica", label: "Música", icon: Music },
  { href: "#historia", label: "Historia", icon: BookOpen },
  { href: "#arte", label: "Arte", icon: ImageIcon },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 header-electric bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo tipográfico */}
          <a href="#" className="group inline-flex items-center gap-2">
            <span className="text-sm uppercase tracking-widest opacity-80">
              Museo
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-cosmic-300 ring-1 ring-white/10 group-hover:ring-white/20 transition">
              del Tiempo
            </span>
          </a>

          {/* Navegación */}
          <nav className="hidden gap-1 md:flex">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 transition"
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>

          {/* CTA GitHub (opcional, reemplazá el href) */}
          <a
            href="https://github.com/tu-usuario/museo-del-tiempo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm bg-cosmic-500/90 hover:bg-cosmic-500 shadow-[0_0_10px_rgba(106,90,205,0.35)] transition"
            title="Ver repositorio"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
