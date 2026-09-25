import type { SideKey } from "@/content/sides";

/** Line drawing for each side: glass facade, steel frame with wiring, or both halves. */
export function SideArt({ side, className }: { side: SideKey; className?: string }) {
  return (
    <svg viewBox="0 0 120 96" fill="none" aria-hidden className={className}>
      <path d="M8 90h104" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
      {side !== "python-backend" ? <Facade x={side === "full-stack" ? 24 : 36} /> : null}
      {side !== "frontend" ? <Frame x={side === "full-stack" ? 60 : 36} /> : null}
    </svg>
  );
}

function Facade({ x }: { x: number }) {
  const panes = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) {
      panes.push(
        <rect
          key={`${r}-${c}`}
          x={x + 5 + c * 11}
          y={24 + r * 10.5}
          width="7"
          height="6"
          rx="1"
          fill="currentColor"
          fillOpacity={(r * 3 + c) % 4 === 0 ? 0.9 : 0.28}
        />,
      );
    }
  }
  return (
    <g>
      <rect x={x} y="16" width="38" height="74" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d={`M${x + 12} 16v-6h14v6`} stroke="currentColor" strokeWidth="1.5" />
      {panes}
    </g>
  );
}

function Frame({ x }: { x: number }) {
  const floors = [30, 50, 70];
  return (
    <g stroke="currentColor" strokeWidth="1.5">
      {/* columns and floor beams */}
      <path d={`M${x} 90V16M${x + 38} 90V16M${x + 19} 90V16`} />
      <path d={`M${x} 16h38`} />
      {floors.map((y) => (
        <path key={y} d={`M${x} ${y}h38`} />
      ))}
      {/* cross bracing */}
      <path
        d={`M${x} 30l19 20M${x + 19} 30l-19 20M${x + 19} 50l19 20M${x + 38} 50l-19 20`}
        strokeOpacity=".45"
      />
      {/* wiring with a packet */}
      <path d={`M${x + 4} 88V22h30`} strokeDasharray="2 3" strokeOpacity=".8" />
      <circle cx={x + 4} cy="46" r="2.5" fill="currentColor" stroke="none" />
      {/* brick core */}
      <path d={`M${x + 24} 90v-12h10v12M${x + 24} 84h10M${x + 29} 78v6`} strokeOpacity=".6" />
    </g>
  );
}
