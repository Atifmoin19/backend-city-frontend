"use client";

import { motion } from "motion/react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { CharacterProps } from "./types";

/**
 * The Librarian, keeper of the Data Vaults: an owl archivist with round glasses and a ledger.
 * Thinking tilts the head; happy lifts the ledger; blinks behind the glasses.
 */
export function Librarian({ state = "idle", size = 96, className, label }: CharacterProps) {
  const still = useReducedMotion();
  const tilt = state === "thinking" ? -8 : state === "worried" ? 5 : 0;
  const pleased = state === "happy" || state === "celebrating";
  return (
    <svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      overflow="visible"
    >
      <ellipse cx="60" cy="124" rx="30" ry="4.5" fill="black" opacity="0.35" />
      {/* body + wings */}
      <path
        d="M30 118 Q24 70 60 64 Q96 70 90 118 Z"
        fill="var(--bc-bg-3)"
        stroke="var(--bc-purple)"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <path d="M44 84 Q60 78 76 84 Q74 108 60 112 Q46 108 44 84 Z" fill="var(--bc-bg-2)" />
      {/* ledger */}
      <motion.g
        animate={{ y: pleased ? -6 : 0, rotate: pleased ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        style={{ transformOrigin: "60px 100px" }}
      >
        <rect x="40" y="92" width="40" height="22" rx="3" fill="var(--bc-purple)" opacity="0.85" />
        <path d="M60 92 V114" stroke="var(--bc-bg-0)" strokeWidth="1.5" />
        <path
          d="M45 99 H56 M45 104 H55 M64 99 H75 M64 104 H73"
          stroke="var(--bc-bg-0)"
          strokeOpacity="0.6"
        />
      </motion.g>
      {/* head */}
      <motion.g
        animate={{ rotate: tilt }}
        transition={{ type: "spring", stiffness: 160, damping: 12 }}
        style={{ transformOrigin: "60px 60px" }}
      >
        <path d="M34 30 L42 18 L48 30 Z M86 30 L78 18 L72 30 Z" fill="var(--bc-bg-3)" />
        <ellipse
          cx="60"
          cy="44"
          rx="30"
          ry="24"
          fill="var(--bc-bg-3)"
          stroke="var(--bc-purple)"
          strokeOpacity="0.6"
          strokeWidth="1.5"
        />
        {/* glasses */}
        <g stroke="var(--bc-amber)" strokeWidth="2.5" fill="var(--bc-bg-0)">
          <circle cx="47" cy="44" r="10" />
          <circle cx="73" cy="44" r="10" />
          <path d="M57 44 H63" fill="none" />
        </g>
        <motion.g
          animate={still ? { scaleY: 1 } : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 5, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
          style={{ transformOrigin: "60px 44px" }}
          fill="var(--bc-amber)"
        >
          <circle cx="47" cy={state === "thinking" ? 41 : 44} r="3.5" />
          <circle cx="73" cy={state === "thinking" ? 41 : 44} r="3.5" />
        </motion.g>
        <path d="M56 56 L60 62 L64 56 Z" fill="var(--bc-amber)" />
      </motion.g>
    </svg>
  );
}
