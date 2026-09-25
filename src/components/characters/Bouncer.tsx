"use client";

import { motion } from "motion/react";

import type { CharacterProps } from "./types";

/** The Bouncer: gate guard of the Gatehouse (placeholder art). */
export function Bouncer({ state = "idle", size = 96, className, label }: CharacterProps) {
  const visor =
    state === "happy" || state === "celebrating"
      ? "var(--bc-green)"
      : state === "worried" || state === "sad"
        ? "var(--bc-amber)"
        : "var(--bc-cyan)";
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      animate={{ rotate: state === "worried" ? [0, -3, 3, 0] : 0 }}
      transition={{ duration: 0.5 }}
    >
      <rect
        x="20"
        y="40"
        width="60"
        height="52"
        rx="14"
        fill="#22305c"
        stroke="var(--bc-line-strong)"
        strokeWidth="2"
      />
      <rect
        x="28"
        y="12"
        width="44"
        height="36"
        rx="12"
        fill="#2c3c70"
        stroke="var(--bc-line-strong)"
        strokeWidth="2"
      />
      <rect
        x="32"
        y="24"
        width="36"
        height="9"
        rx="4.5"
        fill={visor}
        style={{ filter: `drop-shadow(0 0 6px ${visor})` }}
      />
      <rect x="38" y="58" width="24" height="10" rx="3" fill="#10182f" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fontSize="7"
        fontFamily="var(--font-jetbrains)"
        fill="var(--bc-amber)"
      >
        422
      </text>
    </motion.svg>
  );
}
