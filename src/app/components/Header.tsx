"use client";

import { motion } from "framer-motion";
import { BookOpen, Image as ImageIcon, Music } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const nav = [
  { href: "#musica", label: "Música", icon: Music },
  { href: "#historia", label: "Historia", icon: BookOpen },
  { href: "#arte", label: "Arte", icon: ImageIcon },
];

/** Reloj analógico estilo antiguo (SVG) */
function OldClock({
  size = 28,
  accent = "rgba(124,107,255,0.7)", // cosmic-500 aprox
  border = "rgba(255,255,255,0.25)",
  face = "rgba(255,255,255,0.06)",
}: {
  size?: number;
  accent?: string;
  border?: string;
  face?: string;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Cálculo de ángulos
  const { hAngle, mAngle, sAngle } = useMemo(() => {
    const h = now.getHours() % 12;
    const m = now.getMinutes();
    const s = now.getSeconds();
    const hA = h * 30 + m * 0.5; // 30° por hora + 0.5° por minuto
    const mA = m * 6 + s * 0.1; // 6° por minuto + 0.1° por segundo
    const sA = s * 6; // 6° por segundo
    return { hAngle: hA, mAngle: mA, sAngle: sA };
  }, [now]);

  const r = size / 2;
  const cx = r;
  const cy = r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Hora: ${now.toLocaleTimeString()}`}
      role="img"
      className="shrink-0"
    >
      {/* Bisel */}
      <circle
        cx={cx}
        cy={cy}
        r={r - 1}
        fill={face}
        stroke={border}
        strokeWidth="1.5"
      />
      {/* Marcas de hora (12) */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const inner = r - 4;
        const outer = r - 1.5;
        const x1 = cx + inner * Math.cos(angle);
        const y1 = cy + inner * Math.sin(angle);
        const x2 = cx + outer * Math.cos(angle);
        const y2 = cy + outer * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 3 === 0 ? accent : "rgba(255,255,255,0.45)"}
            strokeWidth={i % 3 === 0 ? 1.5 : 1}
            strokeLinecap="round"
          />
        );
      })}
      {/* Manecilla hora */}
      <g transform={`rotate(${hAngle} ${cx} ${cy})`}>
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r * 0.45}
          stroke="rgba(255,255,255,0.95)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
      {/* Manecilla minuto */}
      <g transform={`rotate(${mAngle} ${cx} ${cy})`}>
        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={cy - r * 0.68}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
      {/* Manecilla segundo (acento) */}
      <g transform={`rotate(${sAngle} ${cx} ${cy})`}>
        <line
          x1={cx}
          y1={cy + 2}
          x2={cx}
          y2={cy - r * 0.72}
          stroke={accent}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      {/* Centro */}
      <circle cx={cx} cy={cy} r="1.8" fill={accent} />
    </svg>
  );
}

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
          {/* Logo + reloj */}
          <motion.a
            href="#"
            className="group inline-flex items-center gap-3 focus-ring rounded-xl p-2 -m-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Reloj antiguo */}
            <div className="relative">
              <OldClock />
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
