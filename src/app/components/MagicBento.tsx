"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

export interface BentoCard {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  className?: string;
  gradient?: string;
  year?: number;
  content?: ReactNode;
}

interface MagicBentoProps {
  cards: BentoCard[];
  onCardClick?: (card: BentoCard) => void;
  columns?: {
    base?: 1 | 2 | 3 | 4;
    sm?: 2 | 3 | 4;
    md?: 3 | 4;
    lg?: 3 | 4;
  };
}

const getGridClassName = (columns: MagicBentoProps["columns"]) => {
  const base = columns?.base || 1;
  const sm = columns?.sm;
  const md = columns?.md;
  const lg = columns?.lg;

  const baseClass =
    base === 1
      ? "grid-cols-1"
      : base === 2
      ? "grid-cols-2"
      : base === 3
      ? "grid-cols-3"
      : "grid-cols-4";
  const smClass =
    sm === 2
      ? "sm:grid-cols-2"
      : sm === 3
      ? "sm:grid-cols-3"
      : sm === 4
      ? "sm:grid-cols-4"
      : "";
  const mdClass =
    md === 3 ? "md:grid-cols-3" : md === 4 ? "md:grid-cols-4" : "";
  const lgClass =
    lg === 3 ? "lg:grid-cols-3" : lg === 4 ? "lg:grid-cols-4" : "";

  return `${baseClass} ${smClass} ${mdClass} ${lgClass}`.trim();
};

function BentoCardComponent({
  card,
  onCardClick,
}: {
  card: BentoCard;
  onCardClick?: (card: BentoCard) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D Tilt effect - movimiento más pronunciado
  const rotateX = useTransform(mouseY, [-150, 150], [8, -8]);
  const rotateY = useTransform(mouseX, [-150, 150], [-8, 8]);

  // Transform suave de la card
  const cardTranslateX = useTransform(mouseX, (val) => val * 0.05);
  const cardTranslateY = useTransform(mouseY, (val) => val * 0.05);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleClick = () => {
    onCardClick?.(card);
  };

  const gradient = card.gradient || "from-violet-500/10 to-purple-600/10";

  return (
    <motion.div
      ref={cardRef}
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
          },
        },
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        x: cardTranslateX,
        y: cardTranslateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative group overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
        card.className || ""
      }`}
    >
      {/* Base background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

      {/* Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-white/10 group-hover:border-white/30 transition-colors duration-300" />

      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
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

      {/* Content */}
      <div className="relative p-2 h-full flex flex-col z-10">
        {card.content ? (
          card.content
        ) : (
          <>
            {card.icon && (
              <motion.div
                className="text-2xl mb-2"
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {card.icon}
              </motion.div>
            )}
            {card.year && (
              <div className="absolute top-3 right-3 text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                {card.year}
              </div>
            )}
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-white transition-colors">
              {card.title}
            </h3>
            {card.description && (
              <p className="text-xs text-white/70 group-hover:text-white/90 transition-colors leading-relaxed line-clamp-2">
                {card.description}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

const MagicBento = ({
  cards,
  onCardClick,
  columns = { base: 1, sm: 2, lg: 4 },
}: MagicBentoProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={`grid gap-3 ${getGridClassName(columns)}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card) => (
        <BentoCardComponent
          key={card.id}
          card={card}
          onCardClick={onCardClick}
        />
      ))}
    </motion.div>
  );
};

export default MagicBento;
