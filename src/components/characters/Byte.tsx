"use client";

import { motion } from "motion/react";
import { useId } from "react";

import type { CharacterProps, CharacterState } from "./types";

const EYES: Record<CharacterState, { ry: number; y: number; color: string }> = {
  idle: { ry: 5, y: 0, color: "#3ee6ff" },
  happy: { ry: 2.4, y: -1, color: "#4dff9a" },
  celebrating: { ry: 2.4, y: -2, color: "#4dff9a" },
  sad: { ry: 3, y: 2, color: "#aab5d3" },
  worried: { ry: 5.5, y: 1, color: "#ffb547" },
  thinking: { ry: 4, y: -2, color: "#b27cff" },
};

/**
 * Byte, the robot guide. Lit and shaded to sit in the 3D city (key light top-left,
 * cyan rim light right, glass visor, floor shadow). Swappable for Rive via CharacterProps.
 */
export function Byte({ state = "idle", size = 96, className, label }: CharacterProps) {
  const id = useId().replace(/:/g, "");
  const eye = EYES[state];
  const lift = state === "celebrating" ? -9 : state === "sad" ? 2 : -4;
  const dur = state === "celebrating" ? 0.6 : 3;
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
      <defs>
        <radialGradient id={`${id}-shell`} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#5d74c4" />
          <stop offset="45%" stopColor="#2a3a78" />
          <stop offset="100%" stopColor="#0e1638" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="60%" stopColor="#3ee6ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#3ee6ff" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#101a3c" />
          <stop offset="100%" stopColor="#03060f" />
        </linearGradient>
        <radialGradient id={`${id}-pod`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#4a5fa8" />
          <stop offset="100%" stopColor="#111a3c" />
        </radialGradient>
        <radialGradient id={`${id}-jet`} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor={eye.color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={eye.color} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* floor shadow breathes with the hover */}
      <motion.ellipse
        cx="60"
        cy="124"
        rx="26"
        ry="4.5"
        fill="#000"
        initial={{ opacity: 0.45, scaleX: 1 }}
        animate={{ opacity: [0.45, 0.28, 0.45], scaleX: [1, 0.82, 1] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "60px 124px" }}
      />

      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, lift, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* hover jet */}
        <ellipse cx="60" cy="112" rx="14" ry="10" fill={`url(#${id}-jet)`} />

        {/* antenna */}
        <rect x="58" y="10" width="4" height="14" rx="2" fill="#2a3a78" />
        <motion.circle
          cx="60"
          cy="9"
          r="5"
          fill={eye.color}
          filter={`url(#${id}-glow)`}
          animate={{ opacity: state === "thinking" ? [1, 0.35, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <circle cx="58.5" cy="7.5" r="1.4" fill="#fff" opacity="0.8" />

        {/* side pods (ears) */}
        <ellipse cx="17" cy="52" rx="7" ry="11" fill={`url(#${id}-pod)`} />
        <ellipse cx="103" cy="52" rx="7" ry="11" fill={`url(#${id}-pod)`} />
        <rect x="100" y="47" width="4" height="10" rx="2" fill={eye.color} opacity="0.7" />

        {/* head shell */}
        <rect x="20" y="22" width="80" height="62" rx="24" fill={`url(#${id}-shell)`} />
        <rect
          x="20"
          y="22"
          width="80"
          height="62"
          rx="24"
          fill={`url(#${id}-rim)`}
          opacity="0.55"
        />
        <rect
          x="20.75"
          y="22.75"
          width="78.5"
          height="60.5"
          rx="23.3"
          fill="none"
          stroke="#8fa6ff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
        />
        {/* specular highlight */}
        <ellipse
          cx="42"
          cy="32"
          rx="16"
          ry="5"
          fill="#fff"
          opacity="0.18"
          transform="rotate(-12 42 32)"
        />

        {/* visor */}
        <rect
          x="30"
          y="36"
          width="60"
          height="34"
          rx="14"
          fill={`url(#${id}-visor)`}
          stroke="#000"
          strokeOpacity="0.6"
        />
        <path
          d="M36 42 Q50 37 70 39"
          stroke="#fff"
          strokeOpacity="0.14"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* eyes */}
        <motion.g
          animate={{ y: eye.y }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          filter={`url(#${id}-glow)`}
        >
          <motion.ellipse
            cx="48"
            cy="53"
            rx="6"
            initial={{ ry: eye.ry }}
            animate={{ ry: eye.ry }}
            fill={eye.color}
          />
          <motion.ellipse
            cx="72"
            cy="53"
            rx="6"
            initial={{ ry: eye.ry }}
            animate={{ ry: eye.ry }}
            fill={eye.color}
          />
        </motion.g>

        {/* body */}
        <path
          d="M40 88 h40 a8 8 0 0 1 8 8 v4 a12 12 0 0 1 -12 12 h-32 a12 12 0 0 1 -12 -12 v-4 a8 8 0 0 1 8 -8 z"
          fill={`url(#${id}-shell)`}
        />
        <path
          d="M40 88 h40 a8 8 0 0 1 8 8 v4 a12 12 0 0 1 -12 12 h-32 a12 12 0 0 1 -12 -12 v-4 a8 8 0 0 1 8 -8 z"
          fill={`url(#${id}-rim)`}
          opacity="0.45"
        />
        <circle cx="60" cy="100" r="4" fill={eye.color} filter={`url(#${id}-glow)`} />
      </motion.g>
    </svg>
  );
}
