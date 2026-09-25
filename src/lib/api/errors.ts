/** Mirrors the backend error envelope: {"error": {"code", "message", "details"?}} */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: { loc: (string | number)[]; msg: string; type: string }[];
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ApiErrorBody["details"],
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Server asleep / unreachable (Render cold start) rather than a real rejection. */
  get isWakingUp(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}
