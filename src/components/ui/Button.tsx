import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Sign-plate buttons. `primary` is a lit cyan plate; `ghost` an unlit plate that lights on hover.
 * Color follows meaning: only use `danger` for destructive / 5xx actions.
 */
const button = cva(
  [
    "relative inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap",
    "rounded-md transition-[background-color,box-shadow,color,transform,border-color]",
    "duration-(--bc-dur-2) ease-out active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-cyan text-on-neon shadow-glow-cyan hover:bg-[#7ff0ff] hover:shadow-[0_0_0_1px_rgb(62_230_255/0.5),0_10px_40px_-6px_rgb(62_230_255/0.75)]",
        ghost:
          "border border-line-strong bg-bg-2/60 text-text-1 hover:border-cyan/60 hover:text-cyan hover:shadow-glow-cyan",
        quiet: "text-text-2 hover:bg-bg-3 hover:text-text-1",
        success: "bg-green text-on-neon shadow-glow-green hover:bg-[#8affbd]",
        danger: "bg-red text-on-neon shadow-glow-red hover:bg-[#ff7a92]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-13 px-6 text-base",
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
