import { StatusLight, type Status } from "@/components/ui/StatusLight";
import type { TestResult } from "@/engine/harness/protocol";
import { outcomeOf } from "@/engine/visualizer/outcome";
import type { PublicTest } from "@/lib/api/types";

function statusOf(r: TestResult): Status {
  if (!r.passed) return "crash";
  return outcomeOf(r.status) === "bounced" ? "bounce" : "pass";
}

/** Every public request, what it expects, and what your server did. */
export function RequestLog({
  tests,
  results,
}: {
  tests: PublicTest[];
  results: TestResult[] | null;
}) {
  return (
    <div className="rounded-lg border border-line bg-bg-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-xs text-text-3">
        <span>Public requests</span>
        <span>
          {results
            ? `${results.filter((r) => r.passed).length}/${results.length} as expected`
            : "Not run yet"}
        </span>
      </div>
      <ul className="divide-y divide-line">
        {tests.map((t, i) => {
          const r = results?.[i];
          return (
            <li
              key={t.name}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm"
            >
              <span className="truncate text-text-1">{t.name}</span>
              <span className="text-right text-xs text-text-3">
                expects <span className="tabular font-mono text-text-2">{t.expect_status}</span>
              </span>
              <span className="truncate font-mono text-xs text-text-3">
                <span className="text-cyan">{t.request.method}</span> {t.request.path}{" "}
                {JSON.stringify(t.request.json)}
              </span>
              <span className="justify-self-end">
                {r ? (
                  <StatusLight status={statusOf(r)}>
                    <span className="tabular font-mono">{r.status}</span>
                    <span className="sr-only">{r.passed ? "as expected" : "not as expected"}</span>
                  </StatusLight>
                ) : (
                  <span className="text-xs text-text-3">waiting</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
