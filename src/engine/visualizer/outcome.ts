import type { TestResult } from "@/engine/harness/protocol";

export type FlowOutcome = "served" | "bounced" | "crashed";

export function outcomeOf(status: number): FlowOutcome {
  if (status >= 500) return "crashed";
  if (status >= 400) return "bounced";
  return "served";
}

/** Human line for a result, e.g. "201 · should have bounced". */
export function verdictLine(r: TestResult): string {
  if (r.passed) return String(r.status);
  const want = outcomeOf(r.expect_status);
  const wanted =
    want === "bounced"
      ? "should have bounced"
      : want === "served"
        ? "should get in"
        : "should crash";
  return `${r.status} · ${wanted}`;
}
