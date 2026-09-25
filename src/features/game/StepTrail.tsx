import { Check, Lock } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

type StepState = "done" | "current" | "locked" | "open";

interface Step {
  label: string;
  href?: string;
  state: StepState;
}

/** Briefing → Practice → Checkpoint, so the learner always knows where they stand. */
export function StepTrail({ steps }: { steps: Step[] }) {
  return (
    <ol aria-label="Topic steps" className="flex items-center gap-1.5 text-xs">
      {steps.map((s, i) => {
        const body = (
          <span
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-medium",
              s.state === "current" && "border-cyan/60 bg-cyan/10 text-cyan",
              s.state === "done" && "border-green/40 text-green",
              s.state === "open" && "border-line-strong text-text-2",
              s.state === "locked" && "border-line text-text-3",
            )}
          >
            {s.state === "done" ? <Check aria-hidden className="size-3.5" /> : null}
            {s.state === "locked" ? <Lock aria-hidden className="size-3" /> : null}
            {s.state === "current" ? (
              <span aria-hidden className="size-1.5 rounded-full bg-cyan shadow-glow-cyan" />
            ) : null}
            {s.label}
            <span className="sr-only">
              {s.state === "done"
                ? " (done)"
                : s.state === "current"
                  ? " (you are here)"
                  : s.state === "locked"
                    ? " (locked)"
                    : ""}
            </span>
          </span>
        );
        return (
          <li key={s.label} className="flex items-center gap-1.5">
            {i > 0 ? <span aria-hidden className="h-px w-3 bg-line-strong" /> : null}
            {s.href && s.state !== "current" && s.state !== "locked" ? (
              <Link href={s.href} className="hover:brightness-125">
                {body}
              </Link>
            ) : (
              <span aria-current={s.state === "current" ? "step" : undefined}>{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
