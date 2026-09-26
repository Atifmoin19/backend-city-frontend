"use client";

import { useState } from "react";

const dayFmt = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

/** Signups per day, 14 days. One series: token color, no legend, hover shows the value;
 * a screen-reader table carries the same numbers. */
export function SignupsChart({ days }: { days: { day: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((d) => d.count));
  const W = 560;
  const H = 140;
  const gap = 2;
  const bw = W / days.length - gap;
  const label = (d: string) => dayFmt.format(new Date(`${d}T00:00:00`));
  return (
    <figure>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H + 18}`}
          className="w-full"
          role="img"
          aria-label="Signups per day, last 14 days"
        >
          <line x1="0" y1={H} x2={W} y2={H} stroke="var(--bc-line)" />
          {days.map((d, i) => {
            const h = (d.count / max) * (H - 8);
            const x = i * (bw + gap);
            return (
              <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* hit target: the whole column, bigger than the bar */}
                <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
                {d.count ? (
                  <path
                    d={`M${x} ${H} V${H - h + 4} q0 -4 4 -4 H${x + bw - 4} q4 0 4 4 V${H} Z`}
                    fill="var(--bc-cyan)"
                    opacity={hover === null || hover === i ? 1 : 0.45}
                  />
                ) : null}
              </g>
            );
          })}
          <text x="0" y={H + 14} className="fill-text-3 text-[10px]">
            {label(days[0]!.day)}
          </text>
          <text x={W} y={H + 14} textAnchor="end" className="fill-text-3 text-[10px]">
            {label(days.at(-1)!.day)}
          </text>
        </svg>
        {hover !== null ? (
          <div
            className="pointer-events-none absolute -top-2 rounded-md border border-line-strong bg-bg-3 px-2 py-1 text-xs text-text-1 shadow-panel"
            style={{
              left: `${((hover + 0.5) / days.length) * 100}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {label(days[hover]!.day)}:{" "}
            <span className="tabular font-semibold">{days[hover]!.count}</span>
          </div>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>Signups per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{label(d.day)}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
