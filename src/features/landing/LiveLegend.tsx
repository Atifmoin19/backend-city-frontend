"use client";

import { Led, type Status } from "@/components/ui/StatusLight";
import { cn } from "@/lib/cn";

export interface TrafficCounts {
  pass: number;
  bounce: number;
  crash: number;
}

const ROWS: { status: Status; key: keyof TrafficCounts | null; code: string; label: string }[] = [
  { status: "flow", key: null, code: "req", label: "request in flight" },
  { status: "pass", key: "pass", code: "2xx", label: "served" },
  { status: "bounce", key: "bounce", code: "4xx", label: "bounced at the gate" },
  { status: "crash", key: "crash", code: "5xx", label: "server crashed" },
];

/** Legend of what every light in the city means, with live counts from the simulation. */
export function LiveLegend({ counts, className }: { counts: TrafficCounts; className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-7",
        className,
      )}
    >
      {ROWS.map((row) => (
        <div key={row.status} className="flex items-center gap-2 text-sm">
          <Led status={row.status} />
          <dt className="font-mono text-xs text-text-1">{row.code}</dt>
          <dd className="text-text-2">
            {row.key ? <span className="tabular mr-1 text-text-1">{counts[row.key]}</span> : null}
            {row.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
