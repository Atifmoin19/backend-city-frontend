import { ApiError } from "@/lib/api/errors";

export interface MappedError {
  field?: string;
  message: string;
}

const FRIENDLY: Record<string, MappedError> = {
  email_taken: {
    field: "email",
    message: "An account with this email already exists. Log in instead?",
  },
  invalid_credentials: {
    message: "That email and password don't match. Check both and try again.",
  },
  account_blocked: {
    message: "This account is blocked. Contact support if you think that's a mistake.",
  },
  rate_limited: { message: "Too many attempts. Wait a minute, then try again." },
};

/** Turn a backend error envelope into something a form can show. */
export function mapAuthError(err: unknown): MappedError[] {
  if (!(err instanceof ApiError)) return [{ message: "Something went wrong. Try again." }];
  if (err.isWakingUp)
    return [{ message: "The server is still waking up. Give it a few seconds and try again." }];
  const known = FRIENDLY[err.code];
  if (known) return [known];
  if (err.code === "validation_error" && err.details) {
    return err.details.map((d) => ({ field: String(d.loc.at(-1)), message: d.msg }));
  }
  return [{ message: err.message }];
}
