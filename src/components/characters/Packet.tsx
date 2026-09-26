"use client";

import { motion } from "motion/react";

import { useReducedMotion } from "@/lib/useReducedMotion";

import type { CharacterProps } from "./types";

/**
 * Packet, a request on its way through the city: a glowing envelope with a light trail.
 * Its colour tells its fate like the city's traffic: cyan travelling, green served,
 * amber bounced (worried), red crashed (sad).
 */
export function Packet({ state = "idle", size = 96, className, label }: CharacterProps) {
  const still = useReducedMotion();
  const color =
    state === "happy" || state === "celebrating"
      ? "var(--bc-green)"
      : state === "worried"
        ? "var(--bc-amber)"
        : state === "sad"
          ? "var(--bc-red)"
          : "var(--bc-cyan)";
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
      <ellipse cx="62" cy="118" rx="22" ry="4" fill="black" opacity="0.35" />
      {/* trail */}
      {[0, 1, 2].map((i) => (
        <motion.rect
          key={i}
          x={8 + i * 10}
          y={68 + i * 2}
          width={14 - i * 2}
          height="4"
          rx="2"
          fill={color}
          animate={still ? { opacity: 0.4 } : { opacity: [0.1, 0.6, 0.1], x: [0, -6, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <motion.g
        animate={
          still
            ? { y: 0 }
            : { y: state === "celebrating" ? [0, -14, 0] : state === "sad" ? 4 : [0, -5, 0] }
        }
        transition={{
          duration: state === "celebrating" ? 0.5 : 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <rect
          x="34"
          y="48"
          width="56"
          height="40"
          rx="8"
          fill="var(--bc-bg-3)"
          stroke={color}
          strokeWidth="3"
        />
        <path
          d="M36 52 L62 72 L88 52"
          stroke={color}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        {/* face */}
        <motion.g
          animate={still ? { scaleY: 1 } : { scaleY: [1, 1, 0.1, 1] }}
          transition={{ duration: 3.6, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
          style={{ transformOrigin: "62px 76px" }}
          fill={color}
        >
          <circle cx="54" cy="77" r="3" />
          <circle cx="70" cy="77" r="3" />
        </motion.g>
        <path
          d={state === "sad" || state === "worried" ? "M56 86 Q62 82 68 86" : "M56 84 Q62 89 68 84"}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}
