import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Sign-plate buttons. `primary` is a lit cyan plate (bevel, halo, hover sheen: .plate-* in
 * globals.css); `ghost` an unlit glass plate that lights on hover.
 * Color follows meaning: only use `danger` for destructive / 5xx actions.
 */
const button = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-sans font-semibold tracking-[0.01em] whitespace-nowrap",
    "rounded-md transition-[background-color,box-shadow,color,transform,border-color]",
    "duration-(--bc-dur-2) ease-out active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary: "plate plate-cyan text-on-neon hover:-translate-y-px",
        ghost:
          "plate-ghost border border-line-strong text-text-1 hover:border-cyan/60 hover:text-cyan",
        quiet: "text-text-2 hover:bg-bg-3 hover:text-text-1",
        success: "plate plate-green text-on-neon hover:-translate-y-px",
        danger: "plate plate-red text-on-neon hover:-translate-y-px",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-13 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof button> {
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  icon,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function buttonClasses({
  className,
  ...variants
}: VariantProps<typeof button> & { className?: string } = {}) {
  return cn(button(variants), className);
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}
