import { cn } from "@/lib/cn";

import { CHAPTERS } from "../story/chapters";

/** Floors of the Backend Tower, bottom to top, and the chapter that lights each one. */
const FLOORS = [
  { id: "gatehouse", label: "Lobby · Gatehouse" },
  { id: "router-station", label: "F1 · Router Station" },
  { id: "signal-tower", label: "F2 · Signal Tower" },
  { id: "vaults", label: "F3 · Data Vaults" },
  { id: "vaults", label: "F4 · Citadel" },
] as const;

const W = 220; // tower width
const X = 90; // tower left edge (centered in the 400-wide view)
const FH = 64; // floor height
const BASE = 470; // ground line
const TOP = BASE - FH * FLOORS.length;

/**
 * No-WebGL stand-in for the 3D dive: a static cutaway of the Backend Tower drawn over the 2D
 * skyline. The current chapter's floor lights up; the full stack chapters show the glass
 * closed again with wires running out to the surface.
 */
export function CutawayArt({ chapter, className }: { chapter: number; className?: string }) {
  const id = CHAPTERS[chapter]?.id ?? "hero";
  const at = CHAPTERS.findIndex((c) => c.id === id);
  const dive = CHAPTERS.findIndex((c) => c.id === "backend");
  const out = CHAPTERS.findIndex((c) => c.id === "fullstack");
  if (at < dive) return null;
  const wired = at >= out;
  const lit = (floorId: string) => !wired && floorId === id;

  return (
    <svg
      viewBox="0 0 400 520"
      aria-hidden
      className={cn("pointer-events-none text-text-3", className)}
      fill="none"
    >
      <line x1="0" y1={BASE} x2="400" y2={BASE} stroke="currentColor" strokeOpacity=".5" />
      {/* solid body so the skyline behind doesn't show through the cutaway */}
      <rect x={X} y={TOP} width={W} height={BASE - TOP} className="fill-bg-0/90" />
      {/* scaffolding + crane: floors still being built */}
      <g
        className={id === "construction" ? "text-cyan" : "text-text-3"}
        stroke="currentColor"
        strokeOpacity=".7"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={X + i * 55} y1={TOP} x2={X + i * 55} y2={TOP - 90} />
        ))}
        {[30, 60, 90].map((dy) => (
          <line key={dy} x1={X} y1={TOP - dy} x2={X + W} y2={TOP - dy} />
        ))}
        <line x1={X + W - 20} y1={TOP - 90} x2={X + W - 20} y2={TOP - 150} />
        <line x1={X + 40} y1={TOP - 150} x2={X + W + 40} y2={TOP - 150} />
        <line x1={X + 70} y1={TOP - 150} x2={X + 70} y2={TOP - 110} strokeDasharray="3 3" />
      </g>
      {/* floors */}
      {FLOORS.map((f, i) => {
        const y = BASE - FH * (i + 1);
        const on = lit(f.id);
        return (
          <g key={f.label} className={on ? "text-cyan" : "text-text-3"}>
            <rect
              x={X}
              y={y}
              width={W}
              height={FH}
              stroke="currentColor"
              strokeOpacity={on ? 1 : 0.6}
              className={on ? "fill-cyan/10" : undefined}
            />
            <text
              x={X + 24}
              y={y + 16}
              className={cn("font-mono text-[10px]", on ? "fill-cyan" : "fill-text-2")}
            >
              {f.label}
            </text>
          </g>
        );
      })}
      {/* brick core: the Academy */}
      <g className={id === "academy" && !wired ? "text-cyan" : "text-text-3"}>
        <rect x={X + 150} y={TOP} width={36} height={BASE - TOP} stroke="currentColor" />
        {Array.from({ length: 16 }, (_, r) => (
          <line
            key={r}
            x1={X + 150}
            x2={X + 186}
            y1={TOP + r * 20}
            y2={TOP + r * 20}
            stroke="currentColor"
            strokeOpacity=".5"
          />
        ))}
      </g>
      {/* steel frame: the framework */}
      <g
        className={id === "frame" && !wired ? "text-cyan" : "text-text-3"}
        stroke="currentColor"
        strokeWidth={id === "frame" ? 2.5 : 1.5}
      >
        {[X, X + 146, X + W].map((x) => (
          <line key={x} x1={x} y1={TOP} x2={x} y2={BASE} />
        ))}
      </g>
      {/* the riser: HTTP on the wire, all the way to the roof antenna */}
      <g className="text-cyan" stroke="currentColor">
        <line x1={X + 14} y1={BASE} x2={X + 14} y2={TOP - 40} strokeWidth="2" />
        <circle cx={X + 14} cy={TOP - 46} r="6" />
      </g>
      {/* lobby checkpoint */}
      <g className="text-amber" stroke="currentColor" strokeWidth="2">
        <path d={`M${X + 192} ${BASE} V${BASE - 36} H${X + 214} V${BASE}`} />
      </g>
      {/* full stack: the glass closes, wires reach out to the surface */}
      {wired ? (
        <g className="text-cyan" stroke="currentColor">
          <rect
            x={X}
            y={TOP}
            width={W}
            height={BASE - TOP}
            strokeWidth="2"
            className="fill-cyan/5"
          />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = BASE - FH * (i + 0.5);
            const end = BASE - 30 - i * 26;
            return (
              <g key={i} strokeOpacity=".8">
                <path d={`M${X} ${y} Q ${X - 50} ${y - 50} ${X - 76 + i * 4} ${end}`} />
                <path d={`M${X + W} ${y} Q ${X + W + 50} ${y - 50} ${X + W + 76 - i * 4} ${end}`} />
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}
