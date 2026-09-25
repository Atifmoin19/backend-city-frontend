"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

import { TextField } from "./TextField";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Current value, needed for the strength meter. */
  strengthOf?: string;
}

/** 0-4 by length and character variety. A guide, not a security guarantee. */
export function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let s = pw.length >= 8 ? 1 : 0;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

const LABELS = ["Too short", "Okay", "Good", "Strong", "Very strong"];
const COLORS = ["bg-amber", "bg-amber", "bg-cyan", "bg-green", "bg-green"];

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ strengthOf, ...props }, ref) {
    const [show, setShow] = useState(false);
    const score = strengthOf === undefined ? null : passwordStrength(strengthOf);
    return (
      <TextField
        ref={ref}
        type={show ? "text" : "password"}
        icon={<Lock />}
        trailing={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="grid size-8 place-items-center rounded-md text-text-3 transition-colors hover:bg-bg-3 hover:text-text-1"
          >
            {show ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </button>
        }
        below={
          score !== null && strengthOf ? (
            <div className="flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1" aria-hidden>
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors duration-(--bc-dur-2)",
                      n <= Math.max(1, score) ? COLORS[score] : "bg-line-strong",
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-text-2">{LABELS[score]}</span>
            </div>
          ) : null
        }
        {...props}
      />
    );
  },
);
