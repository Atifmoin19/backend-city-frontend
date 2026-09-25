import { AlertTriangle } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  /** Leading icon inside the input. */
  icon?: ReactNode;
  /** Trailing control inside the input (e.g. show/hide password). */
  trailing?: ReactNode;
  /** Content rendered under the input, above hint/error (e.g. a strength meter). */
  below?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, icon, trailing, below, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-1">
        {label}
      </label>
      <div className="group relative">
        {icon ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors [&_svg]:size-4",
              error ? "text-amber" : "text-text-3 group-focus-within:text-cyan",
            )}
          >
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "h-12 w-full rounded-lg border bg-bg-1/80 text-text-1 transition-[border-color,box-shadow,background-color]",
            "duration-(--bc-dur-2) outline-none focus:bg-bg-1 focus:shadow-glow-cyan",
            icon ? "pl-10" : "pl-3.5",
            trailing ? "pr-12" : "pr-3.5",
            error
              ? "border-amber focus:border-amber"
              : "border-line-strong hover:border-text-3 focus:border-cyan",
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute top-1/2 right-2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>
      {below}
      {error ? (
        <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-sm text-amber">
          <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-sm text-text-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
