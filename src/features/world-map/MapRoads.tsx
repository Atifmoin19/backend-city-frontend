"use client";

import { DISTRICTS } from "@/content/districts";
import { useReducedMotion } from "@/lib/useReducedMotion";

import type { DistrictState } from "./progress";

/** Roads between consecutive districts: dark asphalt, lit center line when reachable, traffic on lit roads. */
export function MapRoads({ progress }: { progress: Record<string, DistrictState> }) {
  const reduced = useReducedMotion();
  const segs = DISTRICTS.slice(1).map((to, i) => {
    const from = DISTRICTS[i]!;
    const mx = (from.map.x + to.map.x) / 2;
    const my = Math.min(from.map.y, to.map.y) - 10;
    const lit = progress[to.key] !== "locked" && progress[from.key] !== "locked";
    return {
      id: `road-${from.key}-${to.key}`,
      d: `M ${from.map.x} ${from.map.y} Q ${mx} ${my} ${to.map.x} ${to.map.y}`,
      lit,
    };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      className="absolute inset-0 size-full overflow-visible"
    >
      {segs.map((s) => (
        <path
          key={`${s.id}-base`}
          d={s.d}
          fill="none"
          vectorEffect="non-scaling-stroke"
          stroke="var(--bc-road)"
          strokeWidth={12}
          strokeLinecap="round"
        />
      ))}
      {segs.map((s) => (
        <g key={s.id}>
          <path
            id={s.id}
            d={s.d}
            fill="none"
            vectorEffect="non-scaling-stroke"
            stroke={s.lit ? "var(--bc-cyan)" : "var(--bc-line-strong)"}
            strokeOpacity={s.lit ? 0.85 : 0.9}
            strokeWidth={s.lit ? 2 : 1.5}
            strokeDasharray={s.lit ? undefined : "6 8"}
            style={
              s.lit ? { filter: "drop-shadow(0 0 4px rgb(var(--bc-cyan-rgb) / 0.7))" } : undefined
            }
          />
          {s.lit && !reduced
            ? [0, 1].map((k) => (
                <circle key={k} r="0.5" fill="var(--bc-cyan)" data-ambient>
                  <animateMotion dur="3.2s" begin={`-${k * 1.6}s`} repeatCount="indefinite">
                    <mpath href={`#${s.id}`} />
                  </animateMotion>
                </circle>
              ))
            : null}
        </g>
      ))}
    </svg>
  );
}
