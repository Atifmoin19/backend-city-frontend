import type { FromWorker, LoadStage, RunInput, RunReport, ToWorker } from "./protocol";

const PYODIDE_URL =
  process.env.NEXT_PUBLIC_PYODIDE_URL ?? "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";
const RUN_TIMEOUT_MS = 5000;

export type HarnessStatus =
  | { state: "idle" }
  | { state: "loading"; stage: LoadStage | "starting" }
  | { state: "ready"; bootMs: number }
  | { state: "error"; message: string };

type Listener = (s: HarnessStatus) => void;

/**
 * Owns the Pyodide worker. Practice runs never touch the backend.
 * A run that exceeds RUN_TIMEOUT_MS (e.g. an infinite loop) kills the worker and reboots it.
 */
export class HarnessClient {
  private worker: Worker | null = null;
  private status: HarnessStatus = { state: "idle" };
  private listeners = new Set<Listener>();
  private pending = new Map<
    number,
    { resolve: (r: RunReport) => void; reject: (e: Error) => void }
  >();
  private nextId = 1;
  private readyPromise: Promise<void> | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.status);
    return () => this.listeners.delete(fn);
  }

  private set(s: HarnessStatus) {
    this.status = s;
    for (const fn of this.listeners) fn(s);
  }

  /** Start booting Python (idempotent). Call early, e.g. while the learner reads the brief. */
  boot(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.set({ state: "loading", stage: "starting" });
    // Static module worker (public/workers): Pyodide rejects the classic workers Turbopack emits
    const worker = new Worker("/workers/pyodide.worker.mjs", { type: "module", name: "pyodide" });
    this.worker = worker;
    this.readyPromise = new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent<FromWorker>) => {
        const msg = e.data;
        switch (msg.type) {
          case "stage":
            this.set({ state: "loading", stage: msg.stage });
            break;
          case "ready":
            this.set({ state: "ready", bootMs: msg.ms });
            resolve();
            break;
          case "init-error":
            this.set({ state: "error", message: msg.message });
            this.readyPromise = null;
            reject(new Error(msg.message));
            break;
          case "result":
            this.pending.get(msg.id)?.resolve(msg.report);
            this.pending.delete(msg.id);
            break;
          case "run-error":
            this.pending.get(msg.id)?.reject(new Error(msg.message));
            this.pending.delete(msg.id);
            break;
        }
      };
    });
    const init: ToWorker = { type: "init", pyodideUrl: PYODIDE_URL, harnessBase: "/harness" };
    worker.postMessage(init);
    return this.readyPromise;
  }

  async run(input: RunInput): Promise<RunReport> {
    await this.boot();
    const id = this.nextId++;
    const worker = this.worker!;
    return new Promise<RunReport>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.restart();
        resolve({
          ok: false,
          error:
            "Your code ran for more than 5 seconds, so the server was restarted. Look for a loop that never ends.",
          results: [],
        });
      }, RUN_TIMEOUT_MS);
      this.pending.set(id, {
        resolve: (r) => {
          clearTimeout(timer);
          resolve(r);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      const msg: ToWorker = { type: "run", id, input };
      worker.postMessage(msg);
    });
  }

  private restart() {
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    void this.boot();
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.readyPromise = null;
    this.listeners.clear();
  }
}
