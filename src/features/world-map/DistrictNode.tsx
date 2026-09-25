"use client";

import { Check, Lock } from "lucide-react";
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
  active: "in progress",
  locked: "locked",
};

/** A district as a little cluster of towers. Lit windows = cleared, pulsing ring = current. */
export const DistrictNode = forwardRef<HTMLButtonElement, DistrictNodeProps>(function DistrictNode(
  { district, state, selected, onSelect },
  ref,
) {
  const windows =
    state === "done" ? "fill-green" : state === "active" ? "fill-cyan" : "fill-line-strong";
  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${district.name}, level ${district.level}, ${STATE_LABEL[state]}`}
      className="group absolute -translate-x-1/2 -translate-y-[78%] rounded-md outline-offset-4"
      style={{ left: `${district.map.x}%`, top: `${district.map.y}%` }}
    >
      {state === "active" ? (
        <span
          aria-hidden
          data-ambient
          className="absolute -inset-3 animate-pulse-led rounded-full border border-cyan/60 shadow-glow-cyan"
        />
      ) : null}
      <svg
        viewBox="0 0 48 40"
        className={cn(
          "h-12 w-14 transition-transform duration-(--bc-dur-2) ease-out group-hover:-translate-y-0.5 sm:h-14 sm:w-16",
          selected && "-translate-y-1",
        )}
      >
        <rect
          x="4"
          y="16"
          width="12"
          height="24"
          className={state === "locked" ? "fill-bg-2" : "fill-[#111a3a]"}
        />
        <rect
          x="18"
          y="4"
          width="13"
          height="36"
          className={state === "locked" ? "fill-bg-2" : "fill-[#0d1430]"}
        />
        <rect
          x="33"
          y="12"
          width="11"
          height="28"
          className={state === "locked" ? "fill-bg-2" : "fill-[#111a3a]"}
        />
        {[
          [7, 20],
          [11, 26],
          [7, 32],
          [21, 9],
          [26, 15],
          [21, 21],
          [26, 27],
          [21, 33],
          [36, 17],
          [40, 23],
          [36, 30],
        ].map(([x, y]) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="2.5"
            height="2.5"
            className={windows}
            opacity={state === "locked" ? 0.5 : 0.95}
          />
        ))}
        <rect
          x="0"
          y="39"
          width="48"
          height="1"
          className={state === "locked" ? "fill-line-strong" : "fill-cyan/60"}
        />
      </svg>
      <span
        className={cn(
          "absolute top-full left-1/2 mt-1.5 flex -translate-x-1/2 items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
          state === "locked" ? "text-text-3" : "text-text-1",
          selected && "bg-bg-2 ring-1 ring-cyan/50",
        )}
      >
        {state === "done" ? <Check aria-hidden className="size-3 text-green" /> : null}
        {state === "locked" ? <Lock aria-hidden className="size-3" /> : null}
        <span className="hidden sm:inline">{district.name.replace("The ", "")}</span>
        <span className="font-mono sm:hidden">L{district.level}</span>
      </span>
    </button>
  );
});
