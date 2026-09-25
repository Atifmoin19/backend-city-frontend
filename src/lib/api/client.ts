import { ApiError, type ApiErrorBody } from "./errors";

const BASE = "/api"; // same-origin; Next.js rewrites to the FastAPI backend
const COLD_START_RETRIES = 3;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  /** Called once when the backend looks asleep and we start retrying. */
  onWaking?: () => void;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const json = (await res.json()) as { error?: ApiErrorBody };
    if (json.error) {
      return new ApiError(res.status, json.error.code, json.error.message, json.error.details);
    }
  } catch {
    // non-JSON (proxy error page)
  }
  return new ApiError(res.status, "http_error", res.statusText || "Request failed");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Typed fetch wrapper. Cookies ride along automatically (same origin, httpOnly).
 * Retries with backoff when the free-tier backend is cold-starting (ideology 13.3).
 */
export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let notified = false;
  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${BASE}${path}`, {
        method: opts.method ?? "GET",
        headers: opts.body === undefined ? undefined : { "content-type": "application/json" },
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
        credentials: "same-origin",
        signal: opts.signal,
      });
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      res = new Response(null, { status: 503, statusText: "Backend unreachable" });
    }
    if (res.ok) {
      return (res.status === 204 ? undefined : await res.json()) as T;
    }
    const error = await parseError(res);
    if (!error.isWakingUp || attempt >= COLD_START_RETRIES) throw error;
    if (!notified) {
      opts.onWaking?.();
      notified = true;
    }
    await sleep(1500 * 2 ** attempt);
  }
}
