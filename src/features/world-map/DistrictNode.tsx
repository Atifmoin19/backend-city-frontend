"use client";

import { Check, Construction } from "lucide-react";
import { forwardRef } from "react";

import type { District } from "@/content/districts";
import { cn } from "@/lib/cn";

import type { DistrictState } from "./progress";

interface DistrictNodeProps {
  district: District;
  state: DistrictState;
  selected: boolean;
  onSelect: () => void;
}

const STATE_LABEL: Record<DistrictState, string> = {
  done: "cleared",
  active: "open",
  locked: "under construction",
};

const TOWERS = [
  { x: 26, w: 16, h: 30 },
  { x: 44, w: 18, h: 46 },
  { x: 64, w: 14, h: 36 },
  { x: 80, w: 12, h: 22 },
];

/** An illustrated city block on an isometric plate. */
export const DistrictNode = forwardRef<HTMLButtonElement, DistrictNodeProps>(function DistrictNode(
  { district, state, selected, onSelect },
  ref,
) {
  const building = state === "locked";
  const tone = state === "done" ? "done" : state === "active" ? "active" : "locked";
  const front = `var(--bc-tower-${tone})`;
  const side = `var(--bc-tower-${tone}-side)`;
  const windowFill = `var(--bc-tower-${tone === "locked" ? "active" : tone}-window)`;
  const plateStroke =
    state === "done"
      ? "var(--bc-green)"
      : state === "active"
        ? "var(--bc-cyan)"
        : "var(--bc-line-strong)";
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${district.name}, level ${district.level}, ${STATE_LABEL[state]}`}
      className="group absolute w-28 -translate-x-1/2 -translate-y-[72%] rounded-lg outline-offset-4 sm:w-32"
      style={{ left: `${district.map.x}%`, top: `${district.map.y}%` }}
    >
      {/* light pool under the plate */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[58%] left-1/2 h-16 w-40 -translate-x-1/2 rounded-[50%] blur-xl transition-opacity duration-(--bc-dur-3)",
          state === "done" && "bg-green/25",
          state === "active" && "bg-cyan/30",
          state === "locked" && "bg-line-strong/20",
          selected && "opacity-100",
          !selected && state === "locked" && "opacity-60",
        )}
      />
      {/* level badge */}
      <span
        className={cn(
          "absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] leading-none",
          state === "locked"
            ? "border-line-strong bg-bg-2 text-text-3"
            : "border-cyan/50 bg-bg-1 text-cyan",
        )}
      >
        L{district.level}
      </span>
      <svg
        viewBox="0 0 110 96"
        className={cn(
          "w-full transition-transform duration-(--bc-dur-2) ease-out group-hover:-translate-y-1",
          selected && "-translate-y-1.5",
          state === "active" && "drop-shadow-[0_0_18px_rgb(var(--bc-cyan-rgb)/0.45)]",
          state === "done" && "drop-shadow-[0_0_14px_rgb(var(--bc-green-rgb)/0.3)]",
        )}
      >
        {/* plate: lit top + clay side, like a diorama base */}
        <polygon
          points="55,62 105,78 55,94 5,78"
          fill="var(--bc-plate-top)"
          stroke={plateStroke}
          strokeWidth={selected ? 2 : 1.2}
        />
        <polygon points="5,78 55,94 55,99 5,83" fill="var(--bc-plate-side)" />
        <polygon points="55,94 105,78 105,83 55,99" fill="var(--bc-plate-side)" opacity="0.8" />
        {TOWERS.map((t, i) => {
          const top = 80 - t.h - 4;
          const depth = 5; // side face width: gives each block volume
          return (
            <g key={i} opacity={building ? 0.7 : 1}>
              <polygon
                points={`${t.x + t.w},${top} ${t.x + t.w + depth},${top - 3} ${t.x + t.w + depth},${top + t.h - 3} ${t.x + t.w},${top + t.h}`}
                fill={side}
              />
              <polygon
                points={`${t.x},${top} ${t.x + depth},${top - 3} ${t.x + t.w + depth},${top - 3} ${t.x + t.w},${top}`}
                fill={front}
                style={{ filter: "brightness(1.18)" }}
              />
              <rect
                x={t.x}
                y={top}
                width={t.w}
                height={t.h}
                fill={front}
                stroke={building ? "var(--bc-line-strong)" : "none"}
                strokeDasharray={building ? "2 2" : undefined}
              />
              {!building
                ? Array.from({ length: Math.floor(t.h / 8) }).map((_, r) => (
                    <rect
                      key={r}
                      x={t.x + 3}
                      y={80 - t.h + r * 8}
                      width={t.w - 6}
                      height={2.5}
                      fill={windowFill}
                      opacity={0.45 + ((r + i) % 3) * 0.25}
                    />
                  ))
                : null}
            </g>
          );
        })}
        {building ? (
          <g stroke="var(--bc-text-3)" strokeWidth="1.2" fill="none">
            {/* scaffolding + crane: honest "under construction" */}
            <path d="M24 76 V44 M36 76 V44 M24 60 H36 M24 48 H36 M24 60 L36 48" />
            <path d="M86 76 V18 M86 18 H60 M86 24 L70 18 M64 18 V30" />
            <rect x="60" y="30" width="8" height="6" fill="var(--bc-text-3)" stroke="none" />
          </g>
        ) : null}
        {state === "active" ? (
          <circle
            cx="55"
            cy="10"
            r="3"
            fill="var(--bc-cyan)"
            className="animate-pulse-led"
            data-ambient
          />
        ) : null}
      </svg>
      <span
        className={cn(
          "mx-auto mt-1 flex w-fit items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium whitespace-nowrap",
          selected
            ? "border-cyan/60 bg-bg-1 text-text-1 shadow-glow-cyan"
            : "border-line bg-bg-1/80 text-text-1",
          state === "locked" && !selected && "text-text-2",
        )}
      >
        {state === "done" ? <Check aria-hidden className="size-3.5 text-green" /> : null}
        {state === "locked" ? <Construction aria-hidden className="size-3.5 text-text-3" /> : null}
        {state === "active" ? <span aria-hidden className="size-1.5 rounded-full bg-cyan" /> : null}
        {district.name.replace("The ", "")}
      </span>
    </button>
  );
});
