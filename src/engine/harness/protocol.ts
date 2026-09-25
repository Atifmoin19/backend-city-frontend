/** Messages between the main thread and the Pyodide worker. */
import type { PublicTest, SimRequest } from "@/lib/api/types";

export interface TestResult {
  name: string;
  request: SimRequest;
  expect_status: number;
  status: number;
  passed: boolean;
  body: unknown;
}

export interface RunReport {
  ok: boolean;
  error: string | null;
  results: TestResult[];
}

export interface RunInput {
  starterCode: string;
  snippet: string;
  region: { start_marker: string; end_marker: string };
  tests: PublicTest[];
}

export type LoadStage = "runtime" | "packages" | "harness" | "ready";

export type ToWorker =
  | { type: "init"; pyodideUrl: string; harnessBase: string }
  | { type: "run"; id: number; input: RunInput };

export type FromWorker =
  | { type: "stage"; stage: LoadStage; ms: number }
  | { type: "ready"; ms: number }
  | { type: "init-error"; message: string }
  | { type: "result"; id: number; report: RunReport; ms: number }
  | { type: "run-error"; id: number; message: string };
