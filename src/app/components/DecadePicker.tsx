"use client";

import { motion } from "framer-motion";

type Props = { value: number; onChange: (v: number) => void };
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

export default function DecadePicker({ value, onChange }: Props) {
  return (
    <div className="relative inline-flex flex-wrap gap-2 rounded-full bg-white/5 p-2 ring-1 ring-white/10">
      {DECADES.map((d) => {
        const active = value === d;
        return (
          <motion.button
            key={d}
            onClick={() => onChange(d)}
            whileTap={{ scale: 0.96 }}
            className={`relative rounded-full px-4 py-2 text-sm transition
              ${active ? "text-[#1c1337] font-semibold" : "text-white"}
            `}
            aria-pressed={active}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(d);
              }
            }}
          >
            {/* píldora animada detrás del activo */}
            {active && (
              <motion.span
                layoutId="decade-pill"
                className="absolute inset-0 rounded-full bg-cosmic-500 shadow-[0_0_0_1px_rgba(255,255,255,.2),0_0_20px_2px_rgba(139,92,246,.45)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{d}s</span>
          </motion.button>
        );
      })}
    </div>
  );
}
