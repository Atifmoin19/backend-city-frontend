import { AlertTriangle } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-text-2">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-11 rounded-md border bg-bg-1 px-3 text-text-1 transition-[border-color,box-shadow]",
          "duration-(--bc-dur-2) outline-none focus:border-cyan focus:shadow-glow-cyan",
          error ? "border-amber" : "border-line-strong hover:border-text-3",
        )}
        {...props}
      />
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
