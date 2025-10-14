"use client";

import { motion } from "framer-motion";
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

// Toma las props nativas de motion.button (incluye drag/onDrag correctos)
type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, "ref" | "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-cosmic-500 hover:bg-cosmic-600 text-white shadow-[var(--glow)]",
  secondary: "glass hover:glass-2 text-white border-white/20",
  tertiary: "bg-white/10 hover:bg-white/20 text-white border-white/10",
  ghost: "text-white/80 hover:text-white hover:bg-white/5",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = buttonVariants[variant];
    const sizeClasses = buttonSizes[size];

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        whileHover={disabled || loading ? {} : { scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...props}
      >
        {loading && (
          <motion.span
            role="status"
            aria-label="Cargando"
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
