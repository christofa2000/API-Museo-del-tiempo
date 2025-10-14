"use client";

import { motion } from "framer-motion";

type Props = { value: number; onChange: (v: number) => void };
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

export default function DecadePicker({ value, onChange }: Props) {
  return (
    <motion.div
      className="relative inline-flex flex-wrap gap-2 rounded-2xl glass p-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {DECADES.map((d) => {
        const active = value === d;
        return (
          <motion.button
            key={d}
            variants={itemVariants}
            onClick={() => onChange(d)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-ring ${
              active
                ? "text-white font-semibold"
                : "text-white/70 hover:text-white"
            }`}
            aria-pressed={active}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(d);
              }
            }}
          >
            {/* Píldora animada mejorada */}
            {active && (
              <motion.span
                layoutId="decade-pill"
                className="absolute inset-0 rounded-full bg-cosmic-500 shadow-[var(--glow)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{d}s</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
