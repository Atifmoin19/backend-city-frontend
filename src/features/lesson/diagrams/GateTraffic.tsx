"use client";

import { motion } from "motion/react";

import { useReducedMotion } from "@/lib/useReducedMotion";

const PACKETS = [
  { y: 40, bad: false, delay: 0 },
  { y: 70, bad: true, delay: 0.7 },
  { y: 100, bad: false, delay: 1.4 },
  { y: 55, bad: true, delay: 2.1 },
];

/** Requests arrive; real ones pass the gate, fakes bounce. */
export function GateTraffic() {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 400 140"
      className="w-full"
      role="img"
      aria-label="Requests arrive at a gate. Valid ones pass to the server, invalid ones bounce back."
    >
      <text x="8" y="134" className="fill-text-2 font-mono text-[10px]">
        internet
      </text>
      <rect x="196" y="20" width="8" height="100" rx="2" className="fill-amber" opacity="0.85" />
      <text x="186" y="134" className="fill-text-2 font-mono text-[10px]">
        gate
      </text>
      <rect x="320" y="24" width="64" height="96" rx="4" className="fill-bg-3 stroke-line-strong" />
      {[0, 1, 2, 3].map((r) => (
        <rect
          key={r}
          x="334"
          y={36 + r * 20}
          width="36"
          height="8"
          rx="1"
          className="fill-green/40"
        />
      ))}
      <text x="318" y="134" className="fill-text-2 font-mono text-[10px]">
        your server
      </text>
      {PACKETS.map((p, i) =>
        reduced ? (
          <circle
            key={i}
            cx={p.bad ? 180 : 300}
            cy={p.y}
            r="6"
            className={p.bad ? "fill-amber" : "fill-green"}
          />
        ) : (
          <motion.circle
            key={i}
            r="6"
            cy={p.y}
            className={p.bad ? "fill-amber" : "fill-cyan"}
            initial={{ cx: 20, opacity: 0 }}
            animate={
              p.bad
                ? { cx: [20, 186, 120], opacity: [0, 1, 0] }
                : { cx: [20, 186, 316], opacity: [0, 1, 1, 0] }
            }
            transition={{
              duration: 2.2,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeOut",
            }}
          />
        ),
      )}
    </svg>
  );
}
