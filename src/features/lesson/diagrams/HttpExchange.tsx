"use client";

import { motion } from "motion/react";

import { useReducedMotion } from "@/lib/useReducedMotion";

/** Client sends a request (cyan), server answers with a response (green). */
export function HttpExchange() {
  const reduced = useReducedMotion();
  return (
    <svg
      viewBox="0 0 520 170"
      className="w-full"
      role="img"
      aria-label="The client sends a request to the server; the server sends a response back."
    >
      <rect
        x="16"
        y="40"
        width="130"
        height="90"
        rx="10"
        className="fill-bg-3 stroke-line-strong"
      />
      <text x="81" y="80" textAnchor="middle" className="fill-text-1 text-[14px] font-semibold">
        Client
      </text>
      <text x="81" y="102" textAnchor="middle" className="fill-text-2 font-mono text-[11px]">
        your frontend
      </text>
      <rect
        x="374"
        y="40"
        width="130"
        height="90"
        rx="10"
        className="fill-bg-3 stroke-line-strong"
      />
      <text x="439" y="80" textAnchor="middle" className="fill-text-1 text-[14px] font-semibold">
        Server
      </text>
      <text x="439" y="102" textAnchor="middle" className="fill-text-2 font-mono text-[11px]">
        FastAPI
      </text>
      <line
        x1="150"
        y1="68"
        x2="370"
        y2="68"
        className="stroke-cyan/50"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <line
        x1="150"
        y1="104"
        x2="370"
        y2="104"
        className="stroke-green/50"
        strokeWidth="1.5"
        strokeDasharray="4 5"
      />
      <text x="260" y="58" textAnchor="middle" className="fill-cyan font-mono text-[11px]">
        POST /signup {"{…}"}
      </text>
      <text x="260" y="126" textAnchor="middle" className="fill-green font-mono text-[11px]">
        201 Created
      </text>
      {reduced ? null : (
        <>
          <motion.circle
            r="5"
            cy="68"
            className="fill-cyan"
            initial={{ cx: 150 }}
            animate={{ cx: [150, 370] }}
            transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
          />
          <motion.circle
            r="5"
            cy="104"
            className="fill-green"
            initial={{ cx: 370 }}
            animate={{ cx: [370, 150] }}
            transition={{
              duration: 1.4,
              delay: 1.4,
              repeat: Infinity,
              repeatDelay: 1.4,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </svg>
  );
}
