"use client";

import { DISTRICTS } from "@/content/districts";
import { useReducedMotion } from "@/lib/useReducedMotion";

import type { DistrictState } from "./progress";

/** Cables between consecutive districts. Lit when the destination is reachable. */
export function MapRoads({ progress }: { progress: Record<string, DistrictState> }) {
  const reduced = useReducedMotion();
  const segs = DISTRICTS.slice(1).map((to, i) => {
    const from = DISTRICTS[i]!;
    const mx = (from.map.x + to.map.x) / 2;
    const my = Math.min(from.map.y, to.map.y) - 8;
    return {
      id: `${from.key}-${to.key}`,
      d: `M ${from.map.x} ${from.map.y} Q ${mx} ${my} ${to.map.x} ${to.map.y}`,
      lit: progress[to.key] !== "locked",
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
        <g key={s.id}>
          <path
            id={s.id}
            d={s.d}
            fill="none"
            vectorEffect="non-scaling-stroke"
            stroke={s.lit ? "var(--bc-cyan)" : "var(--bc-line-strong)"}
            strokeOpacity={s.lit ? 0.55 : 0.8}
            strokeWidth={s.lit ? 1.5 : 1}
            strokeDasharray={s.lit ? undefined : "4 6"}
          />
          {s.lit && !reduced ? (
            <circle r="0.55" fill="var(--bc-cyan)" data-ambient>
              <animateMotion dur={`${3 + (s.id.length % 3)}s`} repeatCount="indefinite">
                <mpath href={`#${s.id}`} />
              </animateMotion>
            </circle>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
