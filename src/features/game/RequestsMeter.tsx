import type { TestResult } from "@/engine/harness/protocol";
import { cn } from "@/lib/cn";

/** Practice progress in plain words: how many public requests landed where they should. */
export function RequestsMeter({ total, results }: { total: number; results: TestResult[] | null }) {
  const passed = results ? results.filter((r) => r.passed).length : 0;
  return (
    <div className="flex items-center gap-2.5" aria-live="polite">
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, i) => {
          const r = results?.[i];
          return (
            <span
              key={i}
              className={cn(
                "h-2 w-5 rounded-full",
                !r ? "bg-line-strong" : r.passed ? "bg-green shadow-glow-green" : "bg-red",
              )}
            />
          );
        })}
      </span>
      <span className="text-sm whitespace-nowrap text-text-2">
        <span
          className={cn("tabular font-semibold", passed === total ? "text-green" : "text-text-1")}
        >
          {results ? passed : 0}/{total}
        </span>{" "}
        requests correct
      </span>
    </div>
  );
}
