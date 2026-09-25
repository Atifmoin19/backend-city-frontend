"use client";

import { motion } from "motion/react";

import type { CharacterProps, CharacterState } from "./types";

const EYES: Record<CharacterState, { ry: number; y: number; color: string }> = {
  idle: { ry: 5, y: 0, color: "var(--bc-cyan)" },
  happy: { ry: 2.2, y: -1, color: "var(--bc-green)" },
  celebrating: { ry: 2.2, y: -2, color: "var(--bc-green)" },
  sad: { ry: 3, y: 2, color: "var(--bc-text-2)" },
  worried: { ry: 5.5, y: 1, color: "var(--bc-amber)" },
  thinking: { ry: 4, y: -2, color: "var(--bc-purple)" },
};

/** Byte, the robot guide (placeholder art; swap for Rive via the CharacterProps contract). */
export function Byte({ state = "idle", size = 96, className, label }: CharacterProps) {
  const eye = EYES[state];
  const bob = state === "celebrating" ? [0, -8, 0] : state === "sad" ? [0, 2, 0] : [0, -3, 0];
  return (
    <motion.svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      animate={{ y: bob }}
      transition={{
        duration: state === "celebrating" ? 0.6 : 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <defs>
        <radialGradient id="byte-body" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#2a3766" />
          <stop offset="100%" stopColor="#121a33" />
        </radialGradient>
      </defs>
      {/* antenna */}
      <line
        x1="50"
        y1="14"
        x2="50"
        y2="24"
        stroke="var(--bc-line-strong)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.circle
        cx="50"
        cy="11"
        r="4.5"
        fill={eye.color}
        animate={{ opacity: state === "thinking" ? [1, 0.3, 1] : 1 }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ filter: `drop-shadow(0 0 6px ${eye.color})` }}
      />
      {/* head */}
      <rect
        x="18"
        y="24"
        width="64"
        height="50"
        rx="18"
        fill="url(#byte-body)"
        stroke="var(--bc-line-strong)"
        strokeWidth="2"
      />
      {/* visor */}
      <rect x="26" y="34" width="48" height="26" rx="11" fill="#070b16" />
      <motion.g animate={{ y: eye.y }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
        <motion.ellipse
          cx="40"
          cy="47"
          rx="5"
          initial={{ ry: eye.ry }}
          animate={{ ry: eye.ry }}
          fill={eye.color}
          style={{ filter: `drop-shadow(0 0 5px ${eye.color})` }}
        />
        <motion.ellipse
          cx="60"
          cy="47"
          rx="5"
          initial={{ ry: eye.ry }}
          animate={{ ry: eye.ry }}
          fill={eye.color}
          style={{ filter: `drop-shadow(0 0 5px ${eye.color})` }}
        />
      </motion.g>
      {/* body */}
      <rect
        x="34"
        y="76"
        width="32"
        height="14"
        rx="6"
        fill="#121a33"
        stroke="var(--bc-line-strong)"
        strokeWidth="2"
      />
      <circle cx="50" cy="83" r="2.5" fill={eye.color} />
    </motion.svg>
  );
}
