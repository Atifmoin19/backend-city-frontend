"use client";

import { Led, StatusLight } from "@/components/ui/StatusLight";
import { cn } from "@/lib/cn";

export interface PreviewField {
  name: string;
  value: string;
  valid: boolean;
  touched: boolean;
  secret?: boolean;
}

interface RequestPreviewProps {
  method: "POST";
  path: string;
  fields: PreviewField[];
  outcome?: "idle" | "sending" | "pass" | "bounce";
  className?: string;
}

/**
 * The form, shown as the HTTP request it will become. Each field gets a gate light,
 * so learners see validation happen before they ever reach a lesson.
 */
export function RequestPreview({
  method,
  path,
  fields,
  outcome = "idle",
  className,
}: RequestPreviewProps) {
  const allValid = fields.every((f) => f.valid);
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-line bg-editor", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs">
          <span className="text-cyan">{method}</span> <span className="text-text-2">{path}</span>
        </span>
        {outcome === "sending" ? (
          <StatusLight status="busy">Sending</StatusLight>
        ) : outcome === "pass" ? (
          <StatusLight status="pass">201 Created</StatusLight>
        ) : outcome === "bounce" ? (
          <StatusLight status="bounce">Bounced</StatusLight>
        ) : allValid ? (
          <StatusLight status="pass">Ready</StatusLight>
        ) : (
          <span className="text-xs text-text-3">Waiting for valid fields</span>
        )}
      </div>
      <pre
        className="px-4 py-3.5 font-mono text-[0.8rem] leading-7 text-text-2"
        aria-label="Request body preview"
      >
        <span className="text-text-3">{"{"}</span>
        {fields.map((f, i) => (
          <div key={f.name} className="flex items-center gap-2 pl-4">
            <Led
              status={!f.touched && !f.value ? "locked" : f.valid ? "pass" : "bounce"}
              className="size-1.5"
            />
            <span className="min-w-0 truncate">
              <span className="text-purple">&quot;{f.name}&quot;</span>
              <span className="text-text-3">: </span>
              <span className="text-text-1">
                &quot;{f.secret ? "•".repeat(Math.min(f.value.length, 16)) : f.value}&quot;
              </span>
              {i < fields.length - 1 ? <span className="text-text-3">,</span> : null}
            </span>
          </div>
        ))}
        <span className="text-text-3">{"}"}</span>
      </pre>
      <figcaption className="sr-only">
        Preview of the request your form will send. Fields with a green light pass validation.
      </figcaption>
    </figure>
  );
}
