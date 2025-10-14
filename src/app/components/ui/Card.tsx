"use client";

import { motion } from "framer-motion";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type CardVariant = "default" | "glass" | "elevated";

// Toma las props correctas desde motion.div (incluye drag/onDrag tipados)
type MotionDivProps = ComponentPropsWithoutRef<typeof motion.div>;

interface CardProps extends Omit<MotionDivProps, "ref" | "children"> {
  variant?: CardVariant;
  hover?: boolean;
  children: ReactNode;
}

const cardVariants: Record<CardVariant, string> = {
  default: "bg-white/5 border-white/10",
  glass: "glass",
  elevated: "bg-white/10 border-white/20 shadow-[var(--glow)]",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { variant = "default", hover = false, className = "", children, ...props },
    ref
  ) => {
    const baseClasses = "rounded-2xl border transition-all duration-300";
    const variantClasses = cardVariants[variant];
    const hoverClasses = hover
      ? "hover:bg-white/10 hover:border-white/20 hover:shadow-[var(--glow)]"
      : "";

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${hoverClasses} ${className}`}
        whileHover={hover ? { y: -2 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
