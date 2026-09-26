"use client";

import { motion } from "motion/react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { CharacterProps } from "./types";

/**
 * Glitch, the villain who floods the streets with bad requests: a cracked red cube with a
 * split (misregistered) outline that jitters. Beaten (sad / worried), the glow drains out.
 */
export function Glitch({ state = "idle", size = 96, className, label }: CharacterProps) {
  const still = useReducedMotion();
  const beaten = state === "sad" || state === "worried";
  const gleeful = state === "happy" || state === "celebrating";
  const jitter = still || beaten ? 0 : gleeful ? 3 : 1.6;
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
      <ellipse cx="60" cy="124" rx="28" ry="4.5" fill="black" opacity="0.35" />
      <motion.g
        animate={
          still ? { y: beaten ? 6 : 0 } : { y: beaten ? 6 : gleeful ? [0, -10, 0] : [0, -3, 0] }
        }
        transition={{ duration: gleeful ? 0.7 : 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* misregistered copies: cyan left, red right, twitching out of step */}
        {[
          { color: "var(--bc-cyan)", dx: -jitter },
          { color: "var(--bc-red)", dx: jitter },
        ].map(({ color, dx }, i) => (
          <motion.rect
            key={i}
            x="26"
            y="30"
            width="68"
            height="68"
            rx="10"
            fill="none"
            stroke={color}
            strokeWidth="3"
            opacity={beaten ? 0.25 : 0.7}
            animate={jitter ? { x: [0, dx, 0, -dx / 2, 0] } : { x: 0 }}
            transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 1.2 + i * 0.4 }}
          />
        ))}
        <rect
          x="28"
          y="32"
          width="64"
          height="64"
          rx="9"
          fill="var(--bc-bg-3)"
          stroke="var(--bc-red)"
          strokeWidth="2"
          opacity={beaten ? 0.6 : 1}
        />
        {/* crack */}
        <path
          d="M52 32 L58 50 L50 60 L60 74 L55 96"
          stroke="var(--bc-red)"
          strokeWidth="2"
          fill="none"
          opacity={beaten ? 0.4 : 0.9}
        />
        {/* eyes: angry slants, or X X when beaten */}
        {beaten ? (
          <g stroke="var(--bc-text-3)" strokeWidth="3" strokeLinecap="round">
            <path d="M42 54 l10 10 M52 54 l-10 10" />
            <path d="M68 54 l10 10 M78 54 l-10 10" />
          </g>
        ) : (
          <g fill="var(--bc-red)">
            <path d="M40 56 L54 60 L54 66 L40 64 Z" />
            <path d="M80 56 L66 60 L66 66 L80 64 Z" />
          </g>
        )}
        {/* mouth: a jagged grin, flat when beaten */}
        <path
          d={beaten ? "M46 82 H74" : "M44 78 L50 84 L56 78 L62 84 L68 78 L74 84"}
          stroke={beaten ? "var(--bc-text-3)" : "var(--bc-red)"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* stray error bits */}
        {!beaten
          ? [
              [18, 40],
              [100, 50],
              [96, 92],
            ].map(([x, y], i) => (
              <motion.rect
                key={i}
                x={x}
                y={y}
                width="6"
                height="3"
                fill="var(--bc-red)"
                animate={still ? { opacity: 0.7 } : { opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
              />
            ))
          : null}
      </motion.g>
    </svg>
  );
}
