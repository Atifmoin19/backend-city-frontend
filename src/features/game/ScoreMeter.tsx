import { Star } from "lucide-react";

import { cn } from "@/lib/cn";

interface ScoreMeterProps {
  score: number | null;
  threshold: number;
  stars?: number;
  label: string;
}

/** Score bar with the pass line marked. Text always states the number and the goal. */
export function ScoreMeter({ score, threshold, stars, label }: ScoreMeterProps) {
  const pct = score ?? 0;
  const passing = score !== null && score >= threshold;
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="hidden w-40 sm:block">
        <div
          className="relative h-2 overflow-hidden rounded-full bg-bg-1 ring-1 ring-line"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label={`${label}: ${pct}%, pass mark ${threshold}%`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-(--bc-dur-3) ease-out",
              passing ? "bg-green" : score === null ? "bg-line-strong" : "bg-amber",
            )}
            style={{ width: `${pct}%` }}
          />
          <span
            aria-hidden
            className="absolute inset-y-0 w-px bg-text-1/70"
            style={{ left: `${threshold}%` }}
          />
        </div>
      </div>
      <p className="text-sm whitespace-nowrap text-text-2">
        <span className="sr-only">{label}: </span>
        <span
          className={cn(
            "tabular font-semibold",
            passing ? "text-green" : score === null ? "text-text-1" : "text-amber",
          )}
        >
          {score === null ? "–" : `${score}%`}
        </span>{" "}
        / {threshold}% to pass
      </p>
      {stars !== undefined ? (
        <span className="flex" aria-label={`${stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              aria-hidden
              className={cn("size-4", n <= stars ? "fill-amber text-amber" : "text-line-strong")}
            />
          ))}
        </span>
      ) : null}
    </div>
  );
}
