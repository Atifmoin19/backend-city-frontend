import { StatusLight } from "@/components/ui/StatusLight";
import type { HarnessStatus } from "@/engine/harness/HarnessClient";

const STAGES = [
  { key: "runtime", label: "Python runtime" },
  { key: "packages", label: "FastAPI + Pydantic" },
  { key: "harness", label: "Game harness" },
] as const;

const ORDER = ["starting", "runtime", "packages", "harness", "ready"];

/** Pyodide boot progress, framed as the server cold-starting (ideology 9.6). */
export function BootStatus({ status }: { status: HarnessStatus }) {
  if (status.state === "ready") return null;
  if (status.state === "error") {
    return (
      <p className="text-sm text-red">
        Python couldn&apos;t start in this browser: {status.message}. Reload to try again.
      </p>
    );
  }
  const reached = status.state === "loading" ? ORDER.indexOf(status.stage) : -1;
  return (
    <div className="flex flex-col gap-2 text-sm" role="status">
      <p className="text-text-1">Booting your server… this is literally what a cold start is.</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {STAGES.map((s) => {
          const done = ORDER.indexOf(s.key) <= reached;
          const current = ORDER.indexOf(s.key) === reached + 1;
          return (
            <li key={s.key}>
              {done ? (
                <StatusLight status="pass">{s.label}</StatusLight>
              ) : current ? (
                <StatusLight status="busy">{s.label}</StatusLight>
              ) : (
                <span className="text-text-3">{s.label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
