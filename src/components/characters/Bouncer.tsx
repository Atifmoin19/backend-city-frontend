"use client";

import { motion } from "motion/react";
import { useId } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { CharacterProps } from "./types";

/**
 * The Bouncer, guard of the Gatehouse. Shaded armour, lit visor that changes with mood,
 * bevelled 422 badge, floor shadow.
 */
export function Bouncer({ state = "idle", size = 96, className, label }: CharacterProps) {
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion();
  const visor =
    state === "happy" || state === "celebrating"
      ? "#4dff9a"
      : state === "worried" || state === "sad"
        ? "#ffb547"
        : "#3ee6ff";
  return (
    <motion.svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      overflow="visible"
      animate={{ rotate: state === "worried" && !still ? [0, -3, 3, 0] : 0 }}
      transition={{ duration: 0.5 }}
    >
      <defs>
        <linearGradient id={`${id}-armor`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4c62b0" />
          <stop offset="55%" stopColor="#223268" />
          <stop offset="100%" stopColor="#0c1432" />
        </linearGradient>
        <radialGradient id={`${id}-pad`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#6a80d0" />
          <stop offset="100%" stopColor="#16214a" />
        </radialGradient>
        <linearGradient id={`${id}-helm`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5a70c0" />
          <stop offset="100%" stopColor="#18234d" />
        </linearGradient>
        <linearGradient id={`${id}-badge`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1b2548" />
          <stop offset="100%" stopColor="#070b18" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="60" cy="125" rx="36" ry="5" fill="#000" opacity="0.45" />

      {/* torso */}
      <path d="M22 62 Q60 50 98 62 L92 118 Q60 126 28 118 Z" fill={`url(#${id}-armor)`} />
      <path
        d="M22 62 Q60 50 98 62"
        fill="none"
        stroke="#9fb3ff"
        strokeOpacity="0.35"
        strokeWidth="1.5"
      />
      <path d="M92 64 L86 118" stroke="#3ee6ff" strokeOpacity="0.35" strokeWidth="2" />

      {/* crossed arms */}
      <path d="M28 86 Q60 100 92 86 L92 98 Q60 112 28 98 Z" fill="#1a2656" />
      <path d="M28 86 Q60 100 92 86" fill="none" stroke="#8fa6ff" strokeOpacity="0.3" />

      {/* shoulder pads */}
      <ellipse cx="24" cy="64" rx="14" ry="11" fill={`url(#${id}-pad)`} />
      <ellipse cx="96" cy="64" rx="14" ry="11" fill={`url(#${id}-pad)`} />
      <ellipse cx="20" cy="60" rx="6" ry="2.5" fill="#fff" opacity="0.18" />

      {/* badge */}
      <rect
        x="46"
        y="70"
        width="28"
        height="14"
        rx="3"
        fill={`url(#${id}-badge)`}
        stroke="#ffb547"
        strokeOpacity="0.55"
      />
      <text
        x="60"
        y="80.5"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fontFamily="var(--font-jetbrains), monospace"
        fill="#ffb547"
      >
        422
      </text>

      {/* helmet */}
      <rect x="36" y="14" width="48" height="42" rx="16" fill={`url(#${id}-helm)`} />
      <rect
        x="36.75"
        y="14.75"
        width="46.5"
        height="40.5"
        rx="15.3"
        fill="none"
        stroke="#9fb3ff"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <ellipse
        cx="50"
        cy="21"
        rx="9"
        ry="3"
        fill="#fff"
        opacity="0.16"
        transform="rotate(-10 50 21)"
      />
      {/* visor band */}
      <rect x="40" y="29" width="40" height="10" rx="5" fill="#03060f" />
      <motion.rect
        x="42"
        y="31"
        width="36"
        height="6"
        rx="3"
        fill={visor}
        filter={`url(#${id}-glow)`}
        // the visor pulses and, now and then, blinks shut
        animate={
          still ? { opacity: 1, scaleY: 1 } : { opacity: [1, 0.75, 1, 1], scaleY: [1, 1, 0.15, 1] }
        }
        transition={{ duration: 4.8, times: [0, 0.5, 0.95, 1], repeat: Infinity }}
        style={{ transformOrigin: "60px 34px" }}
      />
      <rect x="44" y="31.5" width="12" height="1.5" rx="0.75" fill="#fff" opacity="0.6" />
    </motion.svg>
  );
}
